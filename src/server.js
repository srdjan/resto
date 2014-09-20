//---------------------------------------------------------------------------------
//- http-server
//---------------------------------------------------------------------------------
var http = require("http");
var file = require("./src/filehelper");
var fn = require('./src/fn');
var log = console.log;

var server;
exports.create = function(service) {
    server = http.createServer(function(request, response) {
    if (fn.isApiCall(request)) {
      processApi(service, request, response);
    }
    else {
      file.get(request, response);
    }
  });
  return server;
};

function processApi(service, request, response) {
  if (fn.hasBody(request.method)) {
    var body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function() {
      request.body = JSON.parse(body);
      service.process(request, response);
    });
  }
  else {
    service.process(request, response);
  }
}
