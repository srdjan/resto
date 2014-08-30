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

function getById(id) {
  var entity = db.get(id);
  if (typeof entity === 'undefined') {
    throw { statusCode: 404, message: 'Not Found'};
  }
  return entity;
}

function update(entity, body) {
  fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
  return entity;
}

function processApi(rel, body, entity, shouldUpdate) {
  validateApiCall(rel, entity);
  var result = entity[rel](body);
  if ( ! result) {
    throw { statusCode: 422, message: 'Error: ' + result };
  }
  if (shouldUpdate) {
    update(entity, body);
  }
  db.save(entity);
  return entity;
}

exports.get = function(ctx) {
  if (ctx.id === 0) {
    return db.getAll();
  }
  return getById(ctx.id);
};

exports.put = function(ctx) {
  var entity = getById(ctx.id);

  validatePropsMatch(ctx.body, entity);
  return processApi(ctx.rel, ctx.body, entity, true);
};

exports.post = function(ctx) {
  var entity = new ctx.typeCtor();
  if(ctx.id === 0) {
    validatePropsMatch(ctx.body, entity);
    update(entity, ctx.body);
    db.add(entity);
    return entity;
  }
  var entityFromDb = getById(ctx.id);
  update(entity, entityFromDb);
  entity = processApi(ctx.rel, ctx.body, entity, false);
  return entity;
};

exports.patch = function(ctx) {
  var entity = getById(ctx.id);

  validatePropsExist(ctx.body, entity);
  return processApi(ctx.rel, ctx.body, entity, true);
};

exports.delete = function(ctx) {
  var entity = getById(ctx.id);

  db.remove(ctx.id);
  return entity;
};
