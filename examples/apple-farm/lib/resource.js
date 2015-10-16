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
    var result = db.remove(ctx.id);
    if (result) {
      ctx = getAll(ctx);
    } else {
      ctx.statusCode = 500;
      ctx.result = 'Error: not able to Delete';
    }
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

function getAll(ctx) {
  var all = db.getAll(ctx.pageNumber);
  ctx.result = all.page;
  ctx.pageNumber = all.pageNumber;
  ctx.pageCount = all.pageCount;
  return ctx;
}

exports.get = function (ctx) {
  if (ctx.id) {
    var entity = db.get(ctx.id);
    if (typeof entity === 'undefined') {
      ctx.statusCode = 404;
      ctx.message = 'Not Found';
    } else {
      ctx.result = entity;
    }
  } else {
    ctx = getAll(ctx);
  }
  return ctx;
};

exports.post = function (ctx) {
  if (ctx.id) {
    ctx.entity = db.get(ctx.id);
    return validateApiCall(ctx).chain(processApi).chain(persist).merge();
  }
  ctx.entity = new ctx.typeCtor();
  return validatePropsMatch(ctx).chain(update).chain(persist).merge();
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

//---------------------------------------------------------------------------------
// simple resource tests
db.clear();
var SimpleApple = function SimpleApple() {
  this.weight = 1;
  this.color = 'green';
};

function test_create_simple_resource_collection() {
  var simpleApple = new SimpleApple();
  var ctx = {
    id: 0,
    rel: "self",
    method: "post",
    typeCtor: SimpleApple,
    body: simpleApple,
    entity: simpleApple
  };

  ctx = exports.post(ctx);
  log(ctx.result);
  expect(ctx.result.color).to.be('green');
}
test_create_simple_resource_collection();

function test_get_simple_resource_collection() {
  var ctx = {
    pageNumber: 1
  };

  ctx = exports.get(ctx);
  log(ctx);
  expect(ctx.result.length).to.be(1);
}
test_get_simple_resource_collection();

//---------------------------------------------------------------------------------
// resource with states tests
db.clear();

// test post, id = 0
function test_post() {
  var ctx = {
    id: 0,
    typeCtor: function typeCtor() {
      this.name = 'sam';
    },
    body: { name: 'sam' }
  };
  var result = exports.post(ctx);
  expect(result.body.name).to.be.equal(result.entity.name);
}
test_post();

function test_post2() {
  var ctx = {
    id: 0,
    typeCtor: function typeCtor() {
      this.name = 'sam1';
    },
    body: { nammmme: 'sam' }
  };
  var result = exports.post(ctx);
  expect(result.statusCode).to.be(400);
}
test_post2();

// test post, id != 0,  prepare db:
function test_post3() {
  var ctx = {
    id: 0,
    typeCtor: function typeCtor() {
      this.name = '';
    },
    body: { name: 'sam' },
    entity: { name: '???',
      getLinks: function getLinks() {
        return [{ rel: 'grow', method: "POST" }, { rel: 'toss', method: "DELETE" }];
      }
    }
  };
  var fromDb = db.add(ctx.entity);
  ctx.id = fromDb.id;
  // log(ctx)
  var result = exports.post(ctx);
  expect(result.statusCode).to.be(405);
}
test_post3();

function test_post4() {
  var ctx = {
    id: 0,
    typeCtor: function typeCtor() {
      this.name = '';
    },
    body: { nammmme: 'sam' },
    entity: { name: '' }
  };
  var result = exports.post(ctx);
  expect(result.statusCode).to.be(400);
}
test_post4();

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
  var apple = new Apple();
  var ctx = {
    id: 0,
    rel: "create",
    method: "post",
    typeCtor: Apple,
    body: apple,
    entity: apple
  };

  var fromDb = exports.post(ctx);
  ctx.id = fromDb.entity.id;

  ctx.rel = "toss";
  ctx.method = "delete";
  exports['delete'](ctx);

  ctx.rel = "self";
  ctx.method = "get";
  fromDb = exports.get(ctx);
  expect(fromDb.statusCode).to.be(404);
}
test_delete();

db.clear();