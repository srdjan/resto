//---------------------------------------------------------------------------------
//- framework
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var db = require('./db.js');
var hal = require('./hal.js');
var log = console.log;

//- api/apples || api/apples/abc3b4=1
function getIdFromPath(path) {
  var tokens = path.split('/');
  var id = fn.btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) return 0;
  return id;
}

//- api/apples/123456/create
function getIdAndRelFromPath(path) {
  var idAndRel = { id: 0, rel: ''};

  var tokens = path.split('/')
  tokens = fn.btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  }
  else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
}

var filterEmpty = fn.filter(function(e) { return Object.getOwnPropertyNames(e).length > 0; });

function validateApiCall(reqRel, entity) {
  var links = hal.getLinksForCurrentState(entity);
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

function getPath(url) {
  var path = url.substring(url.indexOf('api'), url.length);
  return fn.trimLeftAndRight(path, '/');
}

//-- exports ------------------------------------------------------------
//-----------------------------------------------------------------------
exports.clearDb = function() {
  db.clear();
}

exports.Resource = function(entityCtor) {
  var entityCtor = entityCtor;
  var typeName = entityCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  function createAndStore(body) {
    var entity = new entityCtor();
    validatePropsMatch(body, entity);
    fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
    db.save(entity);
    return { name: typeName, data: entity }; //todo: - return 201 (Created) -
  }

  function getById(id) {
    var entity = db.get(id);
    if (typeof entity === 'undefined') {
      throw { statusCode: 404, message: 'Not Found', log: "GET: entity === undefined" };
    }
    return { name: typeName, data: entity };
  };

  function getAll() {
    var entities = db.getAll();
    if (entities.length >= 1) {
      entities = filterEmpty(entities);
    }
    var result = { name: typeName, data: entities };
    return result;
  };

  //- public api -----
  //-
  this.get = function(path) {
    var id = getIdFromPath(path);
    if (id === 0) return getAll();
    return getById(id);
  };

  this.put = function(path, body) {
    var idAndRel = getIdAndRelFromPath(path);
    var entity = db.get(idAndRel.id);
    validateApiCall(idAndRel.rel, entity);
    validatePropsMatch(body, entity);

    var result = entity[idAndRel.rel](body);
    if (result) {
      fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
      db.save(entity);
      return { name: typeName, data: entity };
    }
    log("PUT: Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity));
    return { name: typeName, statusCode: 422, message: 'Unprocessable Entity'};
  };

  this.post = function(path, body) {
    var idAndRel = getIdAndRelFromPath(path);
    if(idAndRel.id === 0) {
      return createAndStore(body);
    }
    //- else: process post message id !== 0 and body.props don't have to exist on entity
    var entity = db.get(idAndRel.id);
    validateApiCall(idAndRel.rel, entity);
    var result = entity[idAndRel.rel](body);
    if (result) {
      db.save(entity);
      return { name: typeName, data: entity };
    }
    log("POST: Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity));
    return { name: typeName, statusCode: 422, message: 'Unprocessable Entity'};
  };

  this.patch = function(path, body) {
    var idAndRel = getIdAndRelFromPath(path);
    var entity = db.get(idAndRel.id);
    validateApiCall(idAndRel.rel, entity);
    validatePropsExist(body, entity);

    var result = entity[idAndRel.rel](body);
    if (result) {
      fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
      db.save(entity);
      return { name: typeName, data: entity };
    }
    log("PATCH: Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity));
    return { name: typeName, statusCode: 422, message: 'Unprocessable Entity'};
  };

  this.delete = function(path) {
    var idAndRel = getIdAndRelFromPath(path);
    var entity = db.get(idAndRel.id);
    db.remove(idAndRel.id);
    return { name: typeName, data: {} };
  };
};

//- api/apples/123456/create
function getTypeFromPath(path) {
  var tokens = path.split('/');
  if (tokens.length > 1) {
    return tokens[1].slice(0, -1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

exports.handle = function(app, req) {
  try {
    var path = getPath(req.url);
    var requestedType = getTypeFromPath(path);
    var resource = app[requestedType + 'Resource'];
    var handler = resource[req.method.toLowerCase()];
    var result = handler(path, req.body);
    if(result.hasOwnProperty('data')) {
      return hal.convert(result.name, result.data);
    }
    return { statusCode: result.statusCode, message: result.message };
  }
  catch (e) {
    log('Fx Exception: ' + JSON.stringify(e));
    if (e.hasOwnProperty('statusCode')) {
      return { statusCode: e.statusCode, message: e.message };
    }
    return { statusCode: 500, message: e };
  }
};
