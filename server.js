//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
'use strict;'
var http = require("http");
var file = require("./src/filehelper.js");
var fn = require('./src/fn.js');
var processApi = require('./src/pipeline.js').process;
var log = console.log;

port = process.argv[2] || 8080;

http.createServer(function(request, response) {
  if (fn.isApiCall(request)) {
    fn.processApi(request, response, processApi);
  }
  else {
    file.get(request, response);
  }
}).listen(parseInt(port, 10));

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
