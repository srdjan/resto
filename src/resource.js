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

function processApi(request, entity, shouldUpdate) {
  validateApiCall(request.rel, entity);
  var result = entity[request.rel](request.body);
  if ( ! result) {
    throw { statusCode: 422, message: 'Error: ' + result };
  }
  if (shouldUpdate) {
    update(entity, request.body);
  }
  db.save(entity);
  return entity;
}

exports.Resource = function(typeConstructor) {
  var typeCtor = typeConstructor;
  var typeName = typeCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  this.get = function(request) {
    if (request.id === 0) {
      var entities = db.getAll();
      return { name: typeName, data: entities };
    }
    var entity = getById(request.id);
    return { name: typeName, data: entity };
  };

  this.put = function(request) {
    var entity = getById(request.id);

    validatePropsMatch(request.body, entity);
    entity = processApi(request, entity, true);
    return { name: typeName, data: entity };
  };

  this.post = function(request) {
    var entity = new typeCtor();
    if(request.id === 0) {
      validatePropsMatch(request.body, entity);
      entity.id = db.createId();
      update(entity, request.body);
      db.save(entity);
      return { name: typeName, data: entity, statusCode: 201 };
    }
    var entityFromDb = getById(request.id);
    update(entity, entityFromDb);
    entity = processApi(request, entity, false);
    return { name: typeName, data: entity };
  };

  this.patch = function(request) {
    var entity = getById(request.id);

    validatePropsExist(request.body, entity);
    entity = processApi(request, entity, true);
    return { name: typeName, data: entity };
  };

  this.delete = function(request) {
    var entity = getById(request.id);

    db.remove(request.id);
    return { name: typeName, data: {} };
  };
};
