//---------------------------------------------------------------------------------
//- resource
//---------------------------------------------------------------------------------
'use strict';

var Either = require('data.either');
var fn = require('./fn');
var db = require('./db');
var log = console.log;

function validateApiCall(ctx) {
  var links = ctx.entity.getLinks();
  if (fn.none(function (link) {
    return link.rel === ctx.rel;
  }, links)) {
    ctx.statusCode = 405;
    ctx.result = 'Conflict - Method call not allowed';
    return Either.Left(ctx);
  }
  return Either.Right(ctx);
}

function validatePropsExist(ctx) {
  if (fn.propsDontExist(ctx.body, ctx.entity)) {
    ctx.statusCode = 400;
    ctx.result = 'Bad Request - props do not exist';
    return Either.Left(ctx);
  }
  return Either.Right(ctx);
}

function validatePropsMatch(ctx) {
  if (fn.propsDontMatch(ctx.body, ctx.entity)) {
    ctx.statusCode = 400;
    ctx.result = 'Bad Request - props do not match';
    return Either.Left(ctx);
  }
  return Either.Right(ctx);
}

function update(ctx) {
  fn.map(function (key) {
    return ctx.entity[key] = ctx.body[key];
  }, Object.keys(ctx.body));
  return Either.Right(ctx);
}

function persist(ctx) {
  if (ctx.method === 'put' || ctx.method === 'patch') {
    ctx.result = db.save(ctx.entity);
  } else if (ctx.method === 'delete') {
    ctx.result = db.remove(ctx.id);
  } else if (ctx.method === 'post') {
    if (ctx.id === 0) {
      ctx.result = db.add(ctx.entity);
    } else {
      ctx.result = db.save(ctx.entity);
    }
  } else {
    ctx.statusCode = 405;
    ctx.result = 'Method Not Allowed';
    return Either.Left(ctx);
  }
  return Either.Right(ctx);
}

function processApi(ctx) {
  if (ctx.entity[ctx.rel](ctx.body)) {
    return Either.Right(ctx);
  }
  log('domain API returned false - no changes to entity should persist');
  return Either.Left(ctx);
}

exports.get = function (ctx) {
  if (ctx.id) {
    ctx.result = db.get(ctx.id);
  } else {
    var all = db.getAll(ctx.pageNumber);
    ctx.result = all.page;
    ctx.pageNumber = all.pageNumber;
    ctx.pageCount = all.pageCount;
  }
  return ctx;
};

exports.post = function (ctx) {
  if (ctx.id === 0) {
    ctx.entity = new ctx.typeCtor();
    return validatePropsMatch(ctx).chain(update).chain(persist).merge();
  }
  ctx.entity = db.get(ctx.id);
  return validateApiCall(ctx).chain(processApi).chain(persist).merge();
};

exports.put = function (ctx) {
  ctx.entity = db.get(ctx.id);
  return validatePropsMatch(ctx).chain(validateApiCall).chain(processApi).chain(update).chain(persist).merge();
};

exports.patch = function (ctx) {
  ctx.entity = db.get(ctx.id);
  return validatePropsExist(ctx).chain(validateApiCall).chain(processApi).chain(update).chain(persist).merge();
};

exports['delete'] = function (ctx) {
  ctx.entity = db.get(ctx.id);
  return validateApiCall(ctx).chain(processApi).chain(persist).merge();
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: resource.js');

db.clear();

// test post, id = 0
// function test_post() {
//   let ctx = {
//               id: 0,
//               typeCtor() { this.name = ''},
//               body: {name: 'sam'}
//             }
//   let result = exports.post(ctx)
//   expect(result.body.name).to.be.equal(result.entity.name)
// }
// test_post()

// function test_post2() {
//   let ctx = {
//     id: 0,
//     typeCtor() { this.name = ''},
//     body: {nammmme: 'sam'},
//     entity: {name: ''}
//   }
//   let result = exports.post(ctx)
//   expect(result.statusCode).to.be(400)
// }
// test_post2()

// // test post, id != 0,  prepare db:
// function test_post3() {
//   let ctx = {
//     id: 0,
//     typeCtor() { this.name = ''},
//     body: {name: 'sam'},
//     entity: { name: '?',
//               getLinks: function() {
//                   return [{ rel: 'grow', method: "POST" },
//                           { rel: 'toss', method: "DELETE"}]
//       }
//     }
//   }
//   let fromDb = db.add(ctx.entity)
//   ctx.id = fromDb.id
//   // log(ctx)
//   let result = exports.post(ctx)
//   expect(result.statusCode).to.be(405)
// }
// test_post3()

// function test_post4() {
//   let ctx = {
//     id: 0,
//     typeCtor() { this.name = ''},
//     body: {nammmme: 'sam'},
//     entity: {name: ''}
//   }
//   let result = exports.post(ctx)
//   expect(result.statusCode).to.be(400)
// }
// test_post4()

// let apple = function() {
//   this.weight = 12
//   this.color = 'red'
//   this.grow = function() {log('grow')}
//   this.toss = function(){log('toss')}
//   this.getLinks = function() {
//       return [{ rel: 'grow', method: "POST" },
//               { rel: 'toss', method: "DELETE"}]
//   }
// }
var Apple = function Apple() {
  this.weight = 1;
  this.color = 'green';

  this.grow = function (msg) {
    if (this.weight > 0 && this.weight + msg.weightIncr < 300) {
      this.weight += msg.weightIncr;
      return true;
    }
    return false;
  };

  this.eat = function (msg) {
    if (msg.weight) return false;
    return true;
  };

  this.toss = function (msg) {
    log('tossed apple: ' + JSON.stringify(this));
    return true;
  };

  this.getLinks = function () {
    if (this.weight > 0 && this.weight < 200) {
      return [{ rel: 'grow', method: "POST" }, { rel: 'toss', method: "DELETE" }];
    } else if (this.weight >= 200 && this.weight < 300) {
      return [{ rel: 'eat', method: "PUT" }, { rel: 'toss', method: "DELETE" }];
    } else if (!this.weight) {
      return [{ rel: 'toss', method: "DELETE" }];
    }
    return [];
  };
};

// test delete:
function test_delete() {
  var ctx = {
    id: 0,
    rel: "toss",
    method: "delete",
    typeCtor: Apple,
    entity: new Apple(),
    statusCode: 200
  };

  var fromDb = db.add(ctx.entity);
  ctx.id = fromDb.id;

  var result = exports['delete'](ctx);

  log(result);
  expect(result.statusCode).to.be(200);
}
test_delete();

// db.clear()