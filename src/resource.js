//---------------------------------------------------------------------------------
//- resource
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var Either = require('data.either');
var db = require('./db.js');
var log = console.log;

function validateApiCall(ctx) {
  var links = fn.getLinks(ctx.entity);
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

function processApi(ctx) {
  if(ctx.entity[ctx.rel](ctx.body)) {
    return Either.Right(ctx);
  }
  ctx.statusCode = 422;
  ctx.result = 'Error: ' + result;
  return Either.Left(ctx);
}

exports.get = function(ctx) {
  if (ctx.id === 0) {
    ctx.result = db.getAll();
  }
  else {
    ctx.result = db.get(ctx.id);
  }
  return ctx;
};

exports.post = function(ctx) {
  if(ctx.id === 0) {
    ctx.entity = new ctx.typeCtor();
    return fn.map2M(Either.of(ctx), validatePropsMatch).chain(update).merge();
  }
  ctx.entity = db.get(ctx.id);
  return fn.map2M(Either.of(ctx), validateApiCall).chain(processApi).merge();
};

exports.put = function(ctx) {
  ctx.entity = db.get(ctx.id);
  return fn.map2M(Either.of(ctx), validatePropsMatch).chain(validateApiCall).chain(processApi).chain(update).merge();
};

exports.patch = function(ctx) {
  ctx.entity = db.get(ctx.id);
  return fn.map2M(Either.of(ctx), validatePropsExist).chain(validateApiCall).chain(processApi).chain(update).merge();
};

exports.delete = function(ctx) {
  ctx.entity = db.get(ctx.id);
  return fn.map2M(Either.of(ctx), validateApiCall).chain(processApi).merge();
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: resource.js');

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

  var result = exports.post(ctx);
  expect(result.statusCode).to.be(405);

  // var ctx = {
  //   id: 0,
  //   typeCtor: function() { this.name = '';},
  //   body: {nammmme: 'sam'},
  //   entity: {name: ''}
  // };
  // var result = exports.post(ctx);
  // expect(result.statusCode).to.be(400);
