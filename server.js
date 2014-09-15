//---------------------------------------------------------------------------------
//- server
//---------------------------------------------------------------------------------
var http = require("http");
var file = require("./src/filehelper.js");
var db = require('./src/db.js');
var fn = require('./src/fn.js');
var pipeline = require('./src/pipeline.js');
var authenticator = require('./src/authn.js').auth;
var authorizer = require('./src/authr.js').auth;
var typeResolver = require('./src/resolver.js').resolve;
var invoker = require('./src/invoker.js').invoke;
var converter = require('./src/hal.js').convert;
var log = console.log;
var port = 8080;

db.init('../../../datastore');

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
