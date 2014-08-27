//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
'use strict;'
var http = require("http");
var file = require("./src/filehelper.js");
var m = require('./src/middleware.js');
var fn = require('./src/fn.js');
var log = console.log;

port = process.argv[2] || 8080;

http.createServer(function(request, response) {
  if (request.url.indexOf('/api') !== -1) {
    if (fn.requestWithBody(request.method)) {
      var body = '';
      request.on('data', function(chunk) { body += chunk.toString(); });
      request.on('end', function() {
        request.body = JSON.parse(body);
        m.pipeline({ req: request, resp: response });
      });
    }
    else {
      m.pipeline({ req: request, resp: response });
    }
  }
  else {
    file.get(request, response);
  }
}).listen(parseInt(port, 10));

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
