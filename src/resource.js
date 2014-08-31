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
  //if (fn.plainJsonObj(ctx.rel)) {
  //  return entity;
  //}

  validateApiCall(rel, entity);
  var result = entity[rel](body);
  if ( ! result) {
    throw { statusCode: 422, message: 'Error: ' + result };
  }
  return entity;
}

function postWithoutId(ctx) {
  var entity = new ctx.typeCtor();
  validatePropsMatch(ctx.body, entity);
  update(entity, ctx.body);
  return db.add(entity);
}

function postWithId(ctx) {
  var entity = db.get(ctx.id);
  entity = processApi(ctx.rel, ctx.body, entity);

  return db.save(entity);
}

exports.get = function(ctx) {
  if (ctx.id === 0) {
    return db.getAll();
  }
  return db.get(ctx.id);
};

exports.post = function(ctx) {
  if(ctx.id === 0) {
    return postWithoutId(ctx);
  }
  return postWithId(ctx);
};

exports.put = function(ctx) {
  var entity = db.get(ctx.id);

  validatePropsMatch(ctx.body, entity);
  entity = processApi(ctx.rel, ctx.body, entity);
  update(entity, ctx.body);

  return db.save(entity);
};

exports.patch = function(ctx) {
  var entity = db.get(ctx.id);

  validatePropsExist(ctx.body, entity);
  entity = processApi(ctx.rel, ctx.body, entity);
  update(entity, ctx.body);

  return db.save(entity);
};

exports.delete = function(ctx) {
  var entity = db.get(ctx.id);

  entity = processApi(ctx.rel, ctx.body, entity);

  return db.remove(ctx.id);
};
