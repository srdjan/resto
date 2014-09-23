//---------------------------------------------------------------------------------
//- http-server
//---------------------------------------------------------------------------------
var http = require("http");
var file = require("./file-helper");
var fn   = require('./fn');
var log  = console.log;

var server;
exports.create = function(pipeline) {
    server = http.createServer(function(request, response) {
    if (fn.isApiCall(request)) {
      processApi(pipeline, request, response);
    }
    else {
      file.get(request, response);
    }
  });
  return this;
};
exports.runOn = function(port) {
  server.listen(port);
  log("Apple Farm Service running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
  return true;
};

function processApi(pipeline, request, response) {
  if (fn.hasBody(request.method)) {
    var body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function() {
      request.body = JSON.parse(body);
      pipeline.process(request, response);
    });
  }
  else {
    pipeline.process(request, response);
  }
}
