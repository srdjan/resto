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
    throw { statusCode: 405, message: 'Conflict - Method call not allowed' };
  }
}

function validatePropsExist(ctx) {
  if (fn.propsDontExist(ctx.body, ctx.entity)) {
    throw { statusCode: 400, message: 'Bad Request - props do not exist' };
  }
}

function validatePropsMatch(ctx) {
  if (fn.propsDontMatch(ctx.body, ctx.entity)) {
    throw { statusCode: 400, message: 'Bad Request - props do not match' };
  }
}

function update(ctx) {
  fn.each(function(key) { ctx.entity[key] = ctx.body[key]; }, Object.keys(ctx.body));
  return ctx;
}

function processApi(ctx) {
  if(ctx.entity[ctx.rel](ctx.body)) {
    return ctx;
  }
  throw { statusCode: 422, message: 'Error: ' + result };
}

function map(m, f) {
  return m.chain(function(value) {
    return m.of(f(value));
  });
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
    validatePropsMatch(ctx);
    update(ctx);
  }
  else {
    ctx.entity = db.get(ctx.id);
    validateApiCall(ctx);
    processApi(ctx);
  }
  return ctx;
};

exports.put = function(ctx) {
  ctx.entity = db.get(ctx.id);
  validatePropsMatch(ctx);
  validateApiCall(ctx);
  processApi(ctx);
  update(ctx);
  return ctx;
};

exports.patch = function(ctx) {
  ctx.entity = db.get(ctx.id);
  validatePropsExist(ctx);
  validateApiCall(ctx);
  processApi(ctx);
  update(ctx);
  return ctx;
};

exports.delete = function(ctx) {
  ctx.entity = db.get(ctx.id);
  validateApiCall(ctx);
  return processApi(ctx);
};
