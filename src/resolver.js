//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var hal = require('./hal.js');
var app = require('./app.js');
var log = console.log;

//- api/apples/123456/create
function getTypeFromPath(path) {
  var tokens = path.split('/');
  if (tokens.length > 1) {
    return tokens[1].slice(0, -1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

function writeResponse(statusCode, content, response) {
  response.setHeader("Content-Type", "application/json");
  response.writeHead(statusCode);
  response.write(JSON.stringify(content));
  response.end();
}

function getHandler(url, method) {
  var path = fn.getPath(url);
  var requestedType = getTypeFromPath(path);
  var resource = app[requestedType + 'Resource'];
  return resource[method];
}

exports.handle = function(request, response) {
  try {
    var handler = getHandler(request.url, request.method.toLowerCase());
    var result = handler(request, response);
    var halRep = hal.convert(result.name, result.data);
    writeResponse(result.statusCode, halRep, response);
  }
  catch (e) {
    log('Fx Exception: ' + JSON.stringify(e));
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    writeResponse(e.statusCode, e.message || {}, response);
  }
};

