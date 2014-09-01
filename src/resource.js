//---------------------------------------------------------------------------------
//- resource
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

function validateApiCall(rel, entity) {
  var links = fn.getLinks(entity);
  if ( ! fn.some(function(link) { return link.rel === rel; }, links)) {
    throw { statusCode: 404, message: 'Conflict - API call not allowed' };
  }
}

function validatePropsExist(body, entity) {
  if (fn.propsDontExist(body, entity)) {
    throw { statusCode: 400, message: 'Bad Request - props do not exist' };
  }
}

function validatePropsMatch(body, entity) {
  if (fn.propsDontMatch(body, entity)) {
    throw { statusCode: 400, message: 'Bad Request - props do not match' };
  }
}

function update(entity, body) {
  fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
  return entity;
}

function processApi(rel, body, entity) {
  validateApiCall(rel, entity);
  var result = entity[rel](body);
  if ( ! result) {
    throw { statusCode: 422, message: 'Error: ' + result };
  }
  return entity;
}

function postWithoutId(ctx) {
  var entity = new ctx.typeCtor();
  validatePropsMatch(ctx.req.body, entity);
  ctx.entity = update(entity, ctx.req.body);
  return ctx;
}

function postWithId(ctx) {
  var entity = db.get(ctx.id);
  ctx.entity = processApi(ctx.rel, ctx.req.body, entity);
  return ctx;
}

exports.post = function(ctx) {
  if(ctx.id === 0) {
    return postWithoutId(ctx);
  }
  return postWithId(ctx);
};

exports.put = function(ctx) {
  var entity = db.get(ctx.id);

  validatePropsMatch(ctx.req.body, entity);
  entity = processApi(ctx.rel, ctx.req.body, entity);
  ctx.entity = update(entity, ctx.req.body);
  return ctx;
};

exports.patch = function(ctx) {
  var entity = db.get(ctx.id);

  validatePropsExist(ctx.req.body, entity);
  entity = processApi(ctx.rel, ctx.req.body, entity);
  ctx.entity = update(entity, ctx.req.body);
  return ctx;
};

exports.delete = function(ctx) {
  var entity = db.get(ctx.id);

  ctx.entity = processApi(ctx.rel, ctx.req.body, entity);
  return ctx;
};
