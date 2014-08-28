//note: taken from: https://github.com/vojtajina/node-mocks
exports.Request = function(method, url, body, headers) {
  this.method = method;
  this.url = url;
  this.body = body || {};
  this.headers = headers || {};

  this.getHeader = function(key) {
    return this.headers[key];
  };
};

exports.Response = function() {
  var bodySent = false;

  this.headers = {};
  this.body = null;
  this.statusCode = null;

  // this._isFinished = function() {
  //   return this.headerSent && bodySent;
  // };

  // this.headerSent = false;

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
