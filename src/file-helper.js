//---------------------------------------------------------------------------------
//- file helper
//---------------------------------------------------------------------------------
var path = require("path");
var fs = require("fs");
var url = require("url");
var fn = require('./fn');
var log = console.log;

function getFile(fileName, response) {
  fs.readFile(fileName, "binary", function(err, file) {
    if (err) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(err + "\n");
    }
    else {
      response.writeHead(200);
      response.write(file, "binary");
    }
    response.end();
  });
}

exports.get = function(request, response) {
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
    if (exists) {
      return getFile(fileName, response);
    }
    log('Not found, hostname: ' + hostname + ' pathname: ' + pathname + ' fileName: ' + fileName);
    response.writeHead(404, {"Content-Type": "application/json"});
    response.end();
  });
};
