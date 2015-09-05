//---------------------------------------------------------------------------------
//- http-server
//---------------------------------------------------------------------------------
"use strict";

var http = require("http");
var file = require("./file-helper");
var fn = require('./fn');
var log = console.log;

exports.create = function (pipeline) {
  var server = http.createServer(function (request, response) {
    if (fn.isApiCall(request)) {
      processApi(pipeline, request, response);
    } else {
      file.get(request, response);
    }
  });

  return {
    start: function start(port) {
      server.listen(port);
      log("API running at port: " + port + "\nCTRL + SHIFT + C to shutdown");
      return this;
    },
    stop: function stop() {
      server.stop();
      log("API at port: " + port + "stopping...");
      return this;
    }
  };
};

function processApi(pipeline, request, response) {
  if (fn.hasBody(request.method)) {
    (function () {
      var body = '';
      request.on('data', function (chunk) {
        return body += chunk.toString();
      });
      request.on('end', function () {
        request.body = JSON.parse(body);
        pipeline.process(request, response);
      });
    })();
  } else {
    pipeline.process(request, response);
  }
}