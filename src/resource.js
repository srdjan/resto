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

function getById(url) {
  var idAndRel = fn.getIdAndRel(url);
  var entity = db.get(idAndRel.id);
  if (typeof entity === 'undefined') {
    throw { statusCode: 404, message: 'Not Found'};
  }
  return entity;
}

function update(entity, body) {
  fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
  return entity;
}

function processApi(rel, entity, body, shouldUpdate) {
  validateApiCall(rel, entity);
  var result = entity[rel](body);
  if (result) {
    if (shouldUpdate) {
      update(entity, body);
    }
    db.save(entity);
    return entity;
  }
  throw { statusCode: 422, message: 'Error: ' + result };
}

exports.Resource = function(typeConstructor) {
  var typeCtor = typeConstructor;
  var typeName = typeCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  this.get = function(request) {
    var idAndRel = fn.getIdAndRel(request.url);
    if (idAndRel.id === 0) {
      var entities = db.getAll();
      return { name: typeName, data: entities, statusCode: 200 };
    }
    var entity = getById(request.url);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.put = function(request) {
    var entity = getById(request.url);
    var idAndRel = fn.getIdAndRel(request.url);

    validatePropsMatch(request.body, entity);
    entity = processApi(idAndRel.rel, entity, request.body, true);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.post = function(request) {
    var entity = new typeCtor();
    var idAndRel = fn.getIdAndRel(request.url);
    if(idAndRel.id === 0) {
      validatePropsMatch(request.body, entity);
      entity.id = db.createId();
      update(entity, request.body);
      db.save(entity);
      return { name: typeName, data: entity, statusCode: 201 };
    }
    var entityFromDb = getById(request.url);
    update(entity, entityFromDb);
    entity = processApi(idAndRel.rel, entity, request.body, false);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.patch = function(request) {
    var entity = getById(request.url);
    var idAndRel = fn.getIdAndRel(request.url);

    validatePropsExist(request.body, entity);
    entity = processApi(idAndRel.rel, entity, request.body, true);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.delete = function(request) {
    var entity = getById(request.url);
    var idAndRel = fn.getIdAndRel(request.url);
    db.remove(idAndRel.id);
    return { name: typeName, data: {}, statusCode: 200 };
  };
};
