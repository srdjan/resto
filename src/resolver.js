//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var hal = require('./hal.js');
var app = require('./app.js');
var log = console.log;

exports.handle = function(request, response) {
  try {
    var path = getPath(request.url);
    var requestedType = getTypeFromPath(path);
    var resource = app[requestedType + 'Resource'];
    var handler = resource[request.method.toLowerCase()];
    var result = handler(path, request.body);
    var halRep = hal.convert(result.name, result.data);
    response.setHeader("Content-Type", "application/json");
    response.writeHead(result.statusCode);
    response.write(JSON.stringify(halRep));
    response.end();
  }
  catch (e) {
    log('Fx Exception: ' + JSON.stringify(e));
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    response.setHeader("Content-Type", "application/json");
    response.writeHead(e.statusCode);
    response.write(e.message || {});
    response.end();
  }
};

//- api/apples/123456/create
function getTypeFromPath(path) {
  var tokens = path.split('/');
  if (tokens.length > 1) {
    return tokens[1].slice(0, -1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

function getPath(url) {
  var path = url.substring(url.indexOf('api'), url.length);
  return fn.trimLeftAndRight(path, '/');
}

