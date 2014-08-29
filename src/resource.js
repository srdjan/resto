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

function processApi(rel, entity, body, shouldUpdate) {
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

exports.Resource = function(typeConstructor) {
  var typeCtor = typeConstructor;
  var typeName = typeCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  this.get = function(request) {
    if (request.idAndRel.id === 0) {
      var entities = db.getAll();
      return { name: typeName, data: entities, statusCode: 200 };
    }
    var entity = getById(request.idAndRel.id);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.put = function(request) {
    var entity = getById(request.idAndRel.id);

    validatePropsMatch(request.body, entity);
    entity = processApi(request.idAndRel.rel, entity, request.body, true);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.post = function(request) {
    var entity = new typeCtor();
    if(request.idAndRel.id === 0) {
      validatePropsMatch(request.body, entity);
      entity.id = db.createId();
      update(entity, request.body);
      db.save(entity);
      return { name: typeName, data: entity, statusCode: 201 };
    }
    var entityFromDb = getById(request.idAndRel.id);
    update(entity, entityFromDb);
    entity = processApi(request.idAndRel.rel, entity, request.body, false);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.patch = function(request) {
    var entity = getById(request.idAndRel.id);

    validatePropsExist(request.body, entity);
    entity = processApi(request.idAndRel.rel, entity, request.body, true);
    return { name: typeName, data: entity, statusCode: 200 };
  };

  this.delete = function(request) {
    var entity = getById(request.idAndRel.id);

    db.remove(request.idAndRel.id);
    return { name: typeName, data: {}, statusCode: 200 };
  };
};
