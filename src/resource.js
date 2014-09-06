//---------------------------------------------------------------------------------
//- resource
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

function validateApiCall(rel, entity) {
  var links = fn.getLinks(entity);
  if ( ! fn.some(function(link) { return link.rel === rel; }, links)) {
    throw { statusCode: 405, message: 'Conflict - Method call not allowed' };
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

exports.get = function(ctx) {
  if (ctx.id === 0) {
    return db.getAll();
  }
  return db.get(ctx.id);
};

exports.post = function(ctx) {
  if(ctx.id === 0) {
    var newEntity = new ctx.typeCtor();
    validatePropsMatch(ctx.body, newEntity);
    ctx.entity = update(newEntity, ctx.body);
  }
  else {
    var entity = db.get(ctx.id);
    ctx.entity = processApi(ctx.rel, ctx.body, entity);
  }
  return ctx;
};

exports.put = function(ctx) {
  var entity = db.get(ctx.id);
  validatePropsMatch(ctx.body, entity);
  ctx.entity = processApi(ctx.rel, ctx.body, entity);
  ctx.entity = update(ctx.entity, ctx.body);
  return ctx;
};

exports.patch = function(ctx) {
  var entity = db.get(ctx.id);
  validatePropsExist(ctx.body, entity);
  entity = processApi(ctx.rel, ctx.body, entity);
  ctx.entity = update(ctx.entity, ctx.body);
  return ctx;
};

exports.delete = function(ctx) {
  var entity = db.get(ctx.id);
  ctx.entity = processApi(ctx.rel, ctx.body, entity);
  return ctx;
};
