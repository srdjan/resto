//---------------------------------------------------------------------------------
//- resource
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

var filterEmpty = fn.filter(function(e) { return Object.getOwnPropertyNames(e).length > 0; });

function validateApiCall(reqRel, entity) {
  var links = fn.getLinks(entity);
  if ( ! fn.some(function(link) { return link.rel === reqRel; }, links)) {
    throw { statusCode: 409, message: 'Conflict', log: 'API call not allowed, rel: ' + reqRel + ' ! ' + JSON.stringify(entity) }
  }
  return true;
}

function validatePropsExist(body, entity) {
  var diff = fn.diff(Object.keys(body), Object.keys(entity));
  if (diff.length > 0) {
    throw { statusCode: 400, message: 'Bad Request', log: 'Properties: ' + diff + ' do not exist ! ' + JSON.stringify(entity) }
  }
}

function validatePropsMatch(body, entity) {
  var diff = fn.diff(Object.keys(body), Object.keys(entity));
  if (diff.length > 0) {
    throw { statusCode: 400, message: 'Bad Request', log: 'Properties: ' + diff + ' failed to match ! ' + JSON.stringify(entity) }
  }
}

function getAll(typeName) {
  var entities = db.getAll();
  if (entities.length >= 1) {
    entities = filterEmpty(entities);
  }
  return { name: typeName, data: entities, statusCode: 200, message: {} };
};

function getById(id, typeName, typeCtor) {
  var entity = db.get(id);
  if (typeof entity === 'undefined') {
    return { name: typeName, data: {}, statusCode: 404, message: 'Not Found', message: "getById: entity === undefined"};
  }
  var newEntity = new typeCtor();
  fn.each(function(key) { newEntity[key] = entity[key]; }, Object.keys(entity));
  return { name: typeName, data: newEntity, statusCode: 200, message: {} };
};

function create(body, typeCtor) {
  var entity = new typeCtor();
  entity.id = db.createId();
  validatePropsMatch(body, entity);
  fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
  return entity;
}

exports.Resource = function(typeCtor) {
  var typeCtor = typeCtor;
  var typeName = typeCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  this.get = function(request, reponse) {
    var id = fn.getId(request.url);
    if (id === 0) {
      return getAll(typeName);
    }
    return getById(id, typeName, typeCtor);
  };

  this.put = function(request, response) {
    var idAndRel = fn.getIdAndRel(request.url);
    if (idAndRel.id === 0) {
      return { name: typeName, data: {}, statusCode: 400, message: 'Bad Request', message: "PUT: Id required, path: " + request.url + " Body: " + JSON.stringify(request.body)};
    }

    var entity = db.get(idAndRel.id);
    validateApiCall(idAndRel.rel, entity);
    validatePropsMatch(request.body, entity);

    var result = entity[idAndRel.rel](request.body);
    if (result) {
      fn.each(function(key) { entity[key] = request.body[key]; }, Object.keys(request.body));
      db.save(entity);
      return { name: typeName, data: entity, statusCode: 200, message: {} };
    }
    return { name: typeName, data: {}, statusCode: 422, message: 'Unprocessable Entity', message: "PUT: Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity)};
  };

  this.post = function(request, response) {
    var idAndRel = fn.getIdAndRel(request.url);
    if(idAndRel.id === 0) {
      var entity = create(request.body, typeCtor);
      db.save(entity);
      return { name: typeName, data: entity, statusCode: 200, message: {} }; //todo: - return 201 (Created) -
    }
    //- else: process post message id !== 0 and body.props don't have to exist on entity
    var entity = db.get(idAndRel.id);
    validateApiCall(idAndRel.rel, entity);
    var result = entity[idAndRel.rel](request.body);
    if (result) {
      db.save(entity);
      return { name: typeName, data: entity, statusCode: 200, message: {} };
    }
    return { name: typeName, data: {}, statusCode: 422, message: 'Unprocessable Entity', message: "POST: Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity)};
  };

  this.patch = function(request, response) {
    var idAndRel = fn.getIdAndRel(request.url);
    var entity = getById(idAndRel.id);
    validateApiCall(idAndRel.rel, entity);
    validatePropsExist(request.body, entity);

    var result = entity[idAndRel.rel](request.body);
    if (result) {
      fn.each(function(key) { entity[key] = request.body[key]; }, Object.keys(request.body));
      db.save(entity);
      return { name: typeName, data: entity };
    }
    return { name: typeName, data: {}, statusCode: 422, message: 'Unprocessable Entity', message: "PATCH: Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity)};
  };

  this.delete = function(request, response) {
    var idAndRel = fn.getIdAndRel(request.url);
    var entity = db.get(idAndRel.id);
    db.remove(idAndRel.id);
    return { name: typeName, data: {}, statusCode: 200, message: {} };
  };
};

