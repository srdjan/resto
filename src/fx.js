//---------------------------------------------------------------------------------
//- framework
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var datastore = require('./datastore.js');
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

//- api/apples/123456/create
function getTypeFromPath(path) {
  var tokens = path.split('/');
  if (tokens.length > 1) {
    return tokens[1].slice(0, -1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

var getStates = fn.filter(function(m) { return m.startsWith('state_') });
var filterEmpty = fn.filter(function(e) { return Object.getOwnPropertyNames(e).length > 0; });

function getLinksForCurrentState(entity) {
  var states = getStates(Object.keys(entity));
  for (var i = 0; i < states.length; i++) {
    var links = entity[states[i]]();
    if (links !== false) {
      return links;
    }
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Invalid state invariants: ' + JSON.stringify(entity) };
}

function checkIfApiCallAllowed(reqRel, entity) {
  var links = getLinksForCurrentState(entity);
  if ( ! fn.some(function(link) { return link.rel === reqRel; }, links)) {
    throw {
      statusCode: 409,
      message: 'Conflict',
      log: 'Error: API call not allowed, rel: ' + reqRel + ' entity: ' + JSON.stringify(entity)
    }
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

//-- exports ------------------------------------------------------------
//-----------------------------------------------------------------------
exports.Resource = function(entityCtor) {
  var entityCtor = entityCtor;
  var typeName = entityCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  function validateType(path, method) {
    var typeNameFromPath = getTypeFromPath(path);
    if (typeNameFromPath !== typeName) {
      throw { statusCode: 406, message: 'Not Acceptable', log: method + ": url type: " + typeNameFromPath + " diff than: " + typeName }
    }
  }

  function createAndStore(body) {
    var entity = new entityCtor();
    validatePropsMatch(body, entity);
    fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
    datastore.save(entity.id, entity);
    var links = getLinksForCurrentState(entity);
    return hal.createFull(typeName, entity, links); //todo: - return 201 (Created) -
  }

  function execute(from, rel, body, entity) {
    var result = entity[rel](body);
    if (result) {
      datastore.save(entity.id, entity);
      var links = getLinksForCurrentState(entity);
      return hal.createFull(typeName, entity, links);
    }
    throw {
      statusCode: 422,
      message: 'Unprocessable Entity',
      log: from + ": Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity)
    };
  }

  function getById(id) {
    var entity = datastore.get(id);
    if (typeof entity === 'undefined') {
      throw { statusCode: 404, message: 'Not Found', log: "GET: entity === undefined" };
    }
    var links = getLinksForCurrentState(entity);
    return hal.createFull(typeName, entity, links);
  };

  function getAll() {
    var halRep = hal.createRoot(typeName);

    var entities = datastore.getAll();
    if (entities.length >= 1) {
      entities = filterEmpty(entities);
      if (entities.length > 0) {
        halRep = hal.addEmbeds(typeName, halRep, entities);
      }
    }
    return halRep;
  };

  //- public api -----
  //-
  this.get = function(path) {
    validateType(path, 'GET');
    var id = getIdFromPath(path);

    if (id === 0) return getAll();
    return getById(id);
  };

  this.put = function(path, body) {
    validateType(path, 'PUT');
    var idAndRel = getIdAndRelFromPath(path);
    var entity = datastore.get(idAndRel.id);

    validatePropsMatch(body, entity);
    checkIfApiCallAllowed(idAndRel.rel, entity);

    //- update entity
    fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
    return execute('PUT', idAndRel.rel, body, entity);
  };

  this.post = function(path, body) {
    validateType(path, 'POST');

    var idAndRel = getIdAndRelFromPath(path);
    if(idAndRel.id === 0) {
      return createAndStore(body);
    }
    //- else: process post message id !== 0 and body.props don't have to exist on entity
    var entity = datastore.get(idAndRel.id);
    checkIfApiCallAllowed(idAndRel.rel, entity);
    return execute('POST', idAndRel.rel, body, entity);
  };

  this.patch = function(path, body) {
    validateType(path, 'PATCH');
    var idAndRel = getIdAndRelFromPath(path);
    var entity = datastore.get(idAndRel.id);

    validatePropsExist(body, entity);
    checkIfApiCallAllowed(idAndRel.rel, entity);

    //- update entity
    fn.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
    return execute('PATCH', idAndRel.rel, body, entity);
  };

  this.delete = function(path) {
    validateType(path, 'DELETE');
    // datastore.removeItem(url);
    throw {
      statusCode: 501,
      message: 'Not Implemented',
      log: "DELETE: not implemented!"
    };
  };
};

exports.handle = function(app, req) {
  try {
    var path = req.url.substring(req.url.indexOf('api'), req.url.length);
    path = fn.trimLeftAndRight(path, '/');
    var resource = app[getTypeFromPath(path) + 'Resource'];
    var handler = resource[req.method.toLowerCase()];
    return handler(path, req.body);
  }
  catch (e) {
    log('Fx Exception: ' + JSON.stringify(e));
    if (e.hasOwnProperty('statusCode')) {
      return {
        statusCode: e.statusCode,
        message: e.message
      };
    }
    return {
      statusCode: 500,
      message: e
    };
  }
};
