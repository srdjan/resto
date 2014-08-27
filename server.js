//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
'use strict;'
var http = require("http");
var file = require("./src/filehelper.js");
var fn = require('./src/fn.js');
var pipeline = require('./src/pipeline.js').pipeline;
var log = console.log;

http.createServer(function(request, response) {
  if (fn.isApiCall(request)) {
    fn.processApi(request, response, pipeline);
  }
  else {
    file.get(request, response);
  }
}).listen(8080);

log("Server running at port: " + 8080 + "\nCTRL + SHIFT + C to shutdown");
