//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
'use strict;'
var http = require("http");
var f = require("./src/filehelper.js");
var m = require('./src/middleware.js');
var log = console.log;

port = process.argv[2] || 8060;

http.createServer(function(request, response) {
  if (request.url.indexOf('/api') !== -1) {
    var ctx = {req: request, resp: response};
    m.pipeline(ctx);
  }
  else {
    f.get(request, response);
  }
}).listen(parseInt(port, 10));

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
