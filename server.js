'use strict;'
var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var fn = require('./src/fn.js');
var fx = require('./src/fx.js');
var app = require('./src/app.js');
var log = console.log;

port = process.argv[2] || 8884;

function hasStatusCode(result) {
  return result.hasOwnProperty('statusCode') ? result.statusCode : 200;
}

function createResponse(result, response) {
  response.writeHeader(hasStatusCode(result), { "Content-Type": "application/json" });
  response.write(JSON.stringify(result));
  response.end();
  return response;
}

function processApiRequest(req, response) {
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

function getFile(fileName, response) {
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

function processStaticFileRequest(request, response) {
  var hostname = url.parse(request.url, false, true).hostname;
  var pathname = url.parse(request.url).pathname;
  pathname = fn.trimLeftAndRight(pathname, '/');
  if(hostname !== null && hostname !== 'hal-browser') pathname = pathname.slice(hostname.length);

  var tokens = [];
  if(pathname.length > 0) tokens = pathname.split('/');

  if(tokens.length === 0) {
    tokens.push('hal-browser');
    tokens.push('index.html');
  }

  var fileName = path.join(process.cwd(), tokens.join('/'));
  fs.exists(fileName, function(exists) {
    if (!exists) {
      log('Not found, hostname: ' + hostname + ' pathname: ' + pathname + ' fileName: ' + fileName);
      response.writeHeader(404, { "Content-Type": "application/json" });
      response.end();
      return response;
    }
    return getFile(fileName, response);
  });
}

//-- server --
http.createServer(function(request, response) {
  if (request.url.indexOf('/api') !== -1) {
    log(request.url);
    return processApiRequest(request, response);
  }
  return processStaticFileRequest(request, response);
}).listen(parseInt(port, 10));

log("Server running at: http://localhost:" + port + "/\nCTRL + SHIFT + C to shutdown");
