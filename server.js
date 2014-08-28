//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
var http = require("http");
var file = require("./src/filehelper.js");
var fn = require('./src/fn.js');
var pipeline = require('./src/pipeline.js').pipeline;
var log = console.log;
var port = 8080;

http.createServer(function(request, response) {
  if (fn.isApiCall(request)) {
    fn.processApi(request, response, pipeline);
  }
  else {
    file.get(request, response);
  }
}).listen(port);

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
