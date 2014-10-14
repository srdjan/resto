var halson = require('halson');
var expect = require('expect.js');
var fn     = require('./fn');
// exports.create = function(service) { return this; };
// exports.listen = function(port) {};

//note: taken from: https://github.com/vojtajina/node-mocks
function httpRequest(method, url, body, headers) {
  this.method = method;
  this.url = url;
  this.body = body || {};
  this.headers = headers || {};

  this.getHeader = function(key) {
    return this.headers[key];
  };
};

function httpResponse() {
  var bodySent = false;
  this.headers = {};
  this.body = null;
  this.statusCode = null;

  this.setHeader = function(name, value) {
    // if (this.headerSent) {
    //   throw new Error("Can't set headers after they are sent.");
    // }

    this.headers[name] = value;
  };

  this.getHeader = function(name) {
    return this.headers[name];
  };

  this.removeHeader = function(name) {
    delete this.headers[name];
  };

  this.writeHead = function(status) {
    // if (this.headerSent) {
    //   throw new Error("Can't render headers after they are sent to the client.");
    // }

    // this.headerSent = true;
    this.statusCode = status;
  };

  this.write = function(content) {
    if (bodySent) {
      throw new Error("Can't write to already finished response.");
    }
    this.body = this.body ? this.body + content.toString() : content.toString();
  };

  this.end = function(content) {
    if (content) {
      this.write(content );
    }

    bodySent = true;
    // this.emit('end');
  };
};

exports.createOn = function(pipeline) {
  return {
    get: function get(url) {
      var request = new httpRequest('GET', url);
      var response = new httpResponse();
      pipeline.process(request, response);
      var result = halson(response.body);
      return { data: result, statusCode: response.statusCode };
    },

    cmd: function cmd(resource, rel, newResource) {
      var link = resource.getLink(rel);
      var request = new httpRequest(link.method, link.href, newResource);
      var response = new httpResponse();
      pipeline.process(request, response);
      var result = halson(response.body);
      return { data: result, statusCode: response.statusCode };
    }
  };
};
