//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
var http = require("http");
var file = require("./src/filehelper");
var fn = require('./src/fn');
var pipeline = require('./src/pipeline');
var authenticator = require('./src/authn').auth;
var authorizer = require('./src/authr').auth;
var typeResolver = require('./src/resolver').resolve;
var invoker = require('./src/invoker').invoke;
var converter = require('./src/hal').convert;
var log = console.log;
var port = 8080;

pipeline.use(typeResolver);
pipeline.use(invoker);
pipeline.use(converter);

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
