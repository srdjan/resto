'use strict;'
var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var fn = require('./src/fn.js');
var resolver = require('./src/resolver.js');
var log = console.log;

port = process.argv[2] || 8080;

function getStatusCode(result) {
  return result.hasOwnProperty('statusCode') ? result.statusCode : 200;
}

function processApi(request, response) {
  var body = '';
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function() {
      request.body = JSON.parse(body);
      resolver.handle(request, response);
    });
  }
  else {
    resolver.handle(request, response);
  }
};

function getFile(fileName, response) {
  fs.readFile(fileName, "binary", function(err, file) {
    if (err) {
      response.writeHead(500);
      response.setHeader("Content-Type", "text/plain");
      response.write(err + "\n");
      response.end();
    }
    else {
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    }
  });
};

function returnFile(request, response) {
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

http.createServer(function(request, response) {
  if (request.url.indexOf('/api') !== -1) {
    return processApi(request, response);
  }
  return returnFile(request, response);
}).listen(parseInt(port, 10));

log("Server running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
