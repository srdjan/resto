//---------------------------------------------------------------------------------
//- resource
//---------------------------------------------------------------------------------
var Either = require('data.either');
var fn     = require('./fn');
var db     = require('./db');
var log    = console.log;

function validateApiCall(ctx) {
  var links = ctx.entity.getLinks();
  if ( ! fn.some(function(link) { return link.rel === ctx.rel; }, links)) {
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
  fn.each(function(key) { ctx.entity[key] = ctx.body[key]; }, Object.keys(ctx.body));
  return Either.Right(ctx);
}

function persist(ctx) {
  if (ctx.method === 'put' || ctx.method === 'patch') {
    ctx.result = db.save(ctx.entity);
  }
  else if (ctx.method === 'delete') {
    ctx.result = db.remove(ctx.id);
  }
  else if (ctx.method === 'post') {
    if (ctx.id === 0) {
      ctx.result = db.add(ctx.entity);
    }
    else {
      ctx.result = db.save(ctx.entity);
    }
  }
  else {
    ctx.statusCode = 405;
    ctx.result = 'Method Not Allowed';
    return Either.Left(ctx);
  }
  return Either.Right(ctx);
}

function processApi(ctx) {
  if(ctx.entity[ctx.rel](ctx.body)) {
    return Either.Right(ctx);
  }
  log('domain API returned false - no changes to entity should persist');
  return Either.Left(ctx);
}

exports.createFrom = function(aggrRoot) {
  throw new Error("Not Implemented");
}

exports.get = function(ctx) {
  if (ctx.id) {
    ctx.result = db.get(ctx.id);
  }
  else {
    var all = db.getAll(ctx.pageNumber);
    ctx.result = all.page;
    ctx.pageNumber = all.pageNumber;
    ctx.pageCount = all.pageCount;
  }
  return ctx;
};

exports.post = function(ctx) {
  if(ctx.id === 0) {
    ctx.entity = new ctx.typeCtor();
    return validatePropsMatch(ctx)
                  .chain(update)
                  .chain(persist)
                  .merge();
  }
  ctx.entity = db.get(ctx.id);
  return validateApiCall(ctx)
                  .chain(processApi)
                  .chain(persist)
                  .merge();
};

exports.put = function(ctx) {
  ctx.entity = db.get(ctx.id);
  return validatePropsMatch(ctx)
                  .chain(validateApiCall)
                  .chain(processApi)
                  .chain(update)
                  .chain(persist)
                  .merge();
};

exports.patch = function(ctx) {
  ctx.entity = db.get(ctx.id);
  return validatePropsExist(ctx)
                  .chain(validateApiCall)
                  .chain(processApi)
                  .chain(update)
                  .chain(persist)
                  .merge();
};

exports.delete = function(ctx) {
  ctx.entity = db.get(ctx.id);
  return validateApiCall(ctx)
                  .chain(processApi)
                  .chain(persist)
                  .merge();
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: resource.js');

  db.clear();

  // test post, id = 0
  var ctx = {
    id: 0,
    typeCtor: function() { this.name = '';},
    body: {name: 'sam'}
  };
  var result = exports.post(ctx);
  expect(result.body.name).to.be.equal(result.entity.name);

  var ctx = {
    id: 0,
    typeCtor: function() { this.name = '';},
    body: {nammmme: 'sam'},
    entity: {name: ''}
  };
  var result = exports.post(ctx);
  expect(result.statusCode).to.be(400);

  // test post, id != 0
  // prepare db:
  var ctx = {
    id: 0,
    typeCtor: function() { this.name = '';},
    body: {name: 'sam'},
    entity: { name: '?'}
  };
  var fromDb = db.add(ctx.entity);
  ctx.id = fromDb.id;

  // var result = exports.post(ctx);
  // expect(result.statusCode).to.be(405);

  // var ctx = {
  //   id: 0,
  //   typeCtor: function() { this.name = '';},
  //   body: {nammmme: 'sam'},
  //   entity: {name: ''}
  // };
  // var result = exports.post(ctx);
  // expect(result.statusCode).to.be(400);
db.clear();
