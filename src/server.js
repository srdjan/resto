'use strict;'
var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var fx = require('./fx.js');
var app = require('./app.js');

port = process.argv[2] || 8070;

function statusCode(result) {
  return result.hasOwnProperty('statusCode') ? result.statusCode : 200;
}

function createResponse(result, response) {
  response.writeHeader(statusCode(result), { "Content-Type": "application/json" });
  response.write(JSON.stringify(result));
  response.end();
  return response;
}

function processApi(req, response) {
  var body = '';
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.on('data', function(chunk) { body += chunk.toString(); });
    req.on('end', function() {
      req.body = JSON.parse(body);
      var result = fx.handle(app, req);
      return createResponse(result, response);
    });
  }
  else {
    var result = fx.handle(app, req);
    return createResponse(result, response);
  }
};

function processStaticFiles(fileName, response) {
  fs.readFile(fileName, "binary", function(err, file) {
    if (err) {
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.write(err + "\n");
      response.end();
    }
    else {
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    }
    return response;
  });
};

//-- server --
//--
http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname;
  uri = fx.trimLeftAndRight(uri, '/');
  if (uri.indexOf('api/') !== -1) {
    return processApi(request, response);
  }

  var tokens = uri.split('/');
  tokens.shift();
  if(tokens.length === 0) {
    tokens.push('hal-browser');
    tokens.push('index.html');
  }
  else {
    tokens.unshift('hal-browser');
  }

  var fileName = path.join(process.cwd(), tokens.join('/'));
  fs.exists(fileName, function(exists) {
    if (!exists) {
      fx.log('Not found, fileName: ' + fileName);
      response.writeHeader(404, { "Content-Type": "application/json" });
      response.end();
      return response;
    }
    return processStaticFiles(fileName, response);
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n => http://localhost:" + port + "/\nCTRL + SHIFT + C to shutdown");
