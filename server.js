//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
'use strict;'
var http = require("http");
var f = require("./src/filehelper.js");
var m = require('./src/middleware.js');
var log = console.log;

port = process.argv[2] || 8080;

function processApi(request, response) {
  var body = '';
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function() {
      request.body = JSON.parse(body);
      m.pipeline({ req: request, resp: response });
    });
  }
  else {
    m.pipeline({ req: request, resp: response });
  }
};

http.createServer(function(request, response) {
  if (request.url.indexOf('/api') !== -1) {
    processApi(request, response);
  }
  else {
    f.get(request, response);
  }
}).listen(parseInt(port, 10));

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
