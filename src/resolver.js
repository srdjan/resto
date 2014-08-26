//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var hal = require('./hal.js');
var app = require('./app.js');
var log = console.log;

function writeResponse(statusCode, content, response) {
  response.setHeader("Content-Type", "application/json");
  response.writeHead(statusCode);
  response.write(JSON.stringify(content));
  response.end();
}

function getHandler(url, method) {
  var requestedType = fn.getTypeFromPath(url);
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

