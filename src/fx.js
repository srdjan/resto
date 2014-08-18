//---------------------------------------------------------------------------------
//- framework
//---------------------------------------------------------------------------------
'use strict;'
var R = require('ramda');
var storage = require('node-persist');
var halson = require('halson');
var log = console.log;

storage.initSync({
  dir: '../../../../datastore',
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: 'utf8',
  logging: false, // can also be custom logging function
  continuous: true,
  interval: false
});

function atob(str) {
  var res = new Buffer(str, 'ascii').toString('base64');
  return res.replace('+', '-').replace('/', '_').replace('=', ',');
}

function btoa(str) {
  var res = new Buffer(str, 'base64').toString('ascii');
  return res.replace('-', '+').replace('_', '/').replace(',', '=');
}

//- api/apples || api/apples/abc3b4=1
function getIdFromPath(path) {
  var tokens = path.split('/');
  var id = btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) return 0;
  return id;
};

//- api/apples/123456/create
function getIdAndRelFromPath(path) {
  var idAndRel = { id: 0, rel: ''};

  var tokens = path.split('/')
  tokens = btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  }
  else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
};

//- api/apples/123456/create
function getTypeFromPath(path) {
  var tokens = path.split('/');
  if (tokens.length > 0) {
    return tokens[1].slice(0, -1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
};

function createHalRoot(typeName, entity) {
  var propNames = R.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; }, Object.keys(entity));
  var root = {};
  R.each(function(propName) { root[propName] = entity[propName]; }, propNames);
  return halson(JSON.stringify(root)).addLink('self', '/api/' + typeName + 's/' + atob(entity.id));
};

function getHalRep(typeName, entity) {
  var halRep = createHalRoot(typeName, entity);
  var links = getLinksForCurrentState(entity);
  R.each(function(el) {
    halRep.addLink(el.rel, { href: '/api/' + typeName + 's/' + atob(entity.id + '/' + el.rel), method: el.method });
  }, links);
  return halRep;
};

function getLinksForCurrentState(entity) {
  var states = R.filter(function(m) { return m.startsWith('state_') }, Object.keys(entity));
  for (var i = 0; i < states.length; i++) {
    var links = entity[states[i]]();
    if (links !== false) {
      return links;
    }
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Invalid state invariants: ' + JSON.stringify(entity) };
};

//-- exports ------------------------------------------------------------
//--
var milis = 0;
exports.id = function() {
  milis = new Date().getTime();
  return (milis += 1).toString();
};
exports.log = log;
exports.clearStorage = function() {
  storage.clear();
};
exports.trimLeftAndRight = function(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "");
}
exports.Resource = function(entityCtor) {
  var entityCtor = entityCtor;
  var typeName = entityCtor.toString().match(/function ([^\(]+)/)[1].toLowerCase();

  function checkIfApiCallAllowed(reqRel, entity) {
    var links = getLinksForCurrentState(entity);
    if ( ! R.some(function(link) { return link.rel === reqRel; }, links)) {
      throw {
        statusCode: 409,
        message: 'Conflict',
        log: 'Error: API call not allowed, rel: ' + reqRel + ' entity: ' + JSON.stringify(entity)
      }
    }
    return true;
  }

  function validateType(path, method) {
    var typeNameFromPath = getTypeFromPath(path);
    if (typeNameFromPath !== typeName) {
      throw { statusCode: 406, message: 'Not Acceptable', log: method + ": url type: " + typeNameFromPath + " diff than: " + typeName }
    }
  }

  function validatePropertiesExist(body, entity) {
    var diff = R.difference(Object.keys(body), Object.keys(entity));
    if (diff.length > 0) {
      throw { statusCode: 400, message: 'Bad Request', log: 'Properties: ' + diff + ' do not exist ! ' + JSON.stringify(entity) }
    }
  }

  function validatePropertiesMatch(body, entity) {
    var diff = R.difference(Object.keys(body), Object.keys(entity));
    if (diff.length > 0) {
      throw { statusCode: 400, message: 'Bad Request', log: 'Properties: ' + diff + ' failed to match ! ' + JSON.stringify(entity) }
    }
  }

  function getById(id) {
    var entity = storage.getItem(id);
    if (typeof entity === 'undefined') {
      throw { statusCode: 404, message: 'Not Found', log: "GET: entity === undefined" };
    }
    return getHalRep(typeName, entity);
  };

  function getAll() {
    var halRep = halson({})
      .addLink('self', '/api/' + typeName + 's')
      .addLink('create', {
        href: '/api/' + typeName + 's/' + atob('create'),
        method: 'POST'
      });

    storage.values(function(entities) {
      if (entities.length >= 1) {
        var embeds = R.filter(function(embed) { return Object.getOwnPropertyNames(embed).length > 0; }, entities);
        if (embeds.length > 0) {
          embeds = R.map(function(embed) { halson({}).addLink('self', '/api/' + typeName + 's/' + atob(embed.id)); }, embeds);
          R.each(function(el, index, array) { halRep.addEmbed(typeName + 's', el); }, embeds);
        }
      }
    });
    return halRep;
  };

  function execute(from, rel, body, entity) {
    var result = entity[rel](body);
    if (result) {
      storage.setItem(entity.id, entity);
      return getHalRep(typeName, entity);
    }
    throw {
      statusCode: 422,
      message: 'Unprocessable Entity',
      log: from + ": Unprocessable, Rel: " + idAndRel.rel + " Entity: " + JSON.stringify(entity)
    };
  }

  //- public api -----
  this.get = function(path) {
    validateType(path, 'GET');
    var id = getIdFromPath(path);

    if (id === 0) return getAll();
    return getById(id);
  };

  this.put = function(path, body) {
    validateType(path, 'PUT');
    var idAndRel = getIdAndRelFromPath(path);
    var entity = storage.getItem(idAndRel.id);

    validatePropertiesMatch(body, entity);

    checkIfApiCallAllowed(idAndRel.rel, entity);

    //- update entity
    R.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
    return execute('PUT', idAndRel.rel, body, entity);
  };

  this.post = function(path, body) {
    validateType(path, 'POST');

    var idAndRel = getIdAndRelFromPath(path);
    if(idAndRel.id === 0) {
      var entity = new entityCtor();

      //- validate that incoming properties exist
      validatePropertiesMatch(body, entity);

      R.each(function(key) { entity[key] = body[key]; }, Object.keys(body));
      storage.setItem(entity.id, entity);

      //- return HAL representation - 201 (Created) -
      return getHalRep(typeName, entity);
    }

    //-
    //- process post message id !== 0 and body.props don't have to exist on entity
    var entity = storage.getItem(idAndRel.id);
    checkIfApiCallAllowed(idAndRel.rel, entity);
    return execute('POST', idAndRel.rel, body, entity);
  };

  this.patch = function(path, body) {
    validateType(path, 'PUT');
    var idAndRel = getIdAndRelFromPath(path);
    var entity = storage.getItem(idAndRel.id);

    //- validate that all incoming properties exist - full match not needed
    validatePropertiesExist(body, entity);

    checkIfApiCallAllowed(idAndRel.rel, entity);

    //- update entity
    R.each(function(key) { entity[key] = body[key]; }, Object.keys(body));

    return execute('PATCH', idAndRel.rel, body, entity);
  };

  this.delete = function(path) {
    validateType(path, 'DELETE');
    // storage.removeItem(url);
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
    path = exports.trimLeftAndRight(path, '/');
    var resource = app[getTypeFromPath(path) + 'Resource'];
    var fn = resource[req.method.toLowerCase()];
    return fn(path, req.body);
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
