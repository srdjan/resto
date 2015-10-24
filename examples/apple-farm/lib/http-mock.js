//---------------------------------------------------------------------------------
//- tests server
//---------------------------------------------------------------------------------
'use strict';

var halson = require('halson');
var expect = require('expect.js');
var fn = require('./fn');
var log = console.log;

exports.createEndPoint = function (pipeline) {
  return {
    GET: function GET(url, headers) {
      return httpCmd('GET', url, {}, headers, pipeline);
    },
    POST: function POST(url, headers, newResource) {
      return httpCmd('POST', url, newResource, headers, pipeline);
    },
    PUT: function PUT(url, headers, newResource) {
      return httpCmd('PUT', url, newResource, headers, pipeline);
    },
    DELETE: function DELETE(url, headers) {
      return httpCmd('DELETE', url, {}, headers, pipeline);
    }
  };
};

function httpCmd(method, url, newResource, headers, pipeline) {
  var request = new Request(method, url, newResource, headers);
  var response = new Response();
  pipeline.process(request, response);
  return { data: halson(response.body), statusCode: response.statusCode };
}

//note: taken from: https://github.com/vojtajina/node-mocks
var Request = function Request(method, url, body, headers) {
  this.method = method;
  this.url = url;
  this.body = body || {};
  this.headers = headers || {};
};

var Response = function Response() {
  var bodySent = false;
  this.headers = {};
  this.body = null;
  this.statusCode = null;

  this.setHeader = function (name, value) {
    // if (this.headerSent) {
    //   throw new Error("Can't set headers after they are sent.")
    // }

    this.headers[name] = value;
  };

  this.getHeader = function (name) {
    return this.headers[name];
  };

  this.removeHeader = function (name) {
    delete this.headers[name];
  };

  this.writeHead = function (status) {
    // if (this.headerSent) {
    //   throw new Error("Can't render headers after they are sent to the client.")
    // }

    // this.headerSent = true
    this.statusCode = status;
  };

  this.write = function (content) {
    if (bodySent) {
      throw new Error("Can't write to already finished response.");
    }
    this.body = this.body ? this.body + content.toString() : content.toString();
  };

  this.end = function (content) {
    if (content) {
      this.write(content);
    }

    bodySent = true;
    // this.emit('end')
  };
};