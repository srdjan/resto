//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
var http = require("http");
var file = require("./src/filehelper.js");
var fn = require('./src/fn.js');
var pipeline = require('./src/pipeline.js');
var resolve = require('./src/resolver.js').resolve;
var invoke = require('./src/invoker.js').invoke;
var convert = require('./src/hal.js').toHal;
var log = console.log;
var port = 8060;

pipeline.use(resolve);
pipeline.use(invoke);
pipeline.use(convert);

http.createServer(function(request, response) {
  if (fn.isApiCall(request)) {
    processApi(request, response);
  }
  else {
    file.get(request, response);
  }
}).listen(port);

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");

function processApi(request, response) {
  if (fn.hasBody(request.method)) {
    var body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function() {
      request.body = JSON.parse(body);
      pipeline.run(request, response);
    });
  }
  else {
    pipeline.run(request, response);
  }
}
