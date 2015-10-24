//---------------------------------------------------------------------------------
//- http-server
//---------------------------------------------------------------------------------
"use strict";

var http = require("http");
var file = require("./file-helper");
var fn = require('./fn');
var log = console.log;

function writeToResp(response, ctx) {
  var contentType = ctx.hal ? { "Content-Type": "application/hal+json" } : { "Content-Type": "application/json" };
  response.writeHead(ctx.statusCode, contentType);
  response.write(JSON.stringify(ctx.result));
  response.end();
}

function process(request, response, pipeline) {
  var ctx = { hal: false, statusCode: 200, result: {} };

  try {
    if (fn.hasBody(request.method)) {
      (function () {
        var body = '';
        request.on('data', function (chunk) {
          return body += chunk.toString();
        });
        request.on('end', function () {
          request.body = JSON.parse(body);
          ctx = pipeline.process(request, ctx);
        });
      })();
    } else {
      ctx = pipeline.process(request, ctx);
    }
  } catch (e) {
    ctx.statusCode = 500;
    if (e.hasOwnProperty('statusCode')) {
      ctx.statusCode = e.statusCode;
    }

    ctx.result = 'Fx Exception, statusCode: ' + ctx.statusCode;
    if (e.hasOwnProperty('message')) {
      ctx.result += ', Message: ' + e.message;
    }
  } finally {
    writeToResp(response, ctx);
  }
}

exports.createEndPoint = function (pipeline) {
  var server = http.createServer(function (request, response) {
    if (fn.isApiCall(request)) {
      process(request, response, pipeline);
    } else {
      file.get(request, response);
    }
  });

  return {
    start: function start(port) {
      server.port = port;
      server.listen(server.port);
      log("API running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
      return this;
    },
    stop: function stop() {
      server.stop();
      log("API at port: " + server.port + "stopping...");
      return this;
    }
  };
};