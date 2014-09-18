var service = require('./service');
var authenticator = require('./authn').auth;
var authorizer = require('./authr').auth;
var resolver = require('./resolver').resolve;
var invoker = require('./invoker').invoke;
var converter = require('./hal').convert;
var httpServer = require('../server');
var log = console.log;

//-- service model
exports.Apple = function() {
  this.weight = 0.1;
  this.color = 'green';

  this.grow = function(msg) {
    if (this.weight > 0.0 && this.weight < 300.0) {
      this.weight += msg.weightIncr;
      return true;
    }
    return false;
  };

  this.eat = function(msg) {
    if (msg.weight) return false;
    return true;
  };

  this.toss = function(msg) {
    log('tossed apple: ' + JSON.stringify(this));
    return true;
  };

  this.getLinks = function() {
    if (this.weight > 0.0 && this.weight < 200.0) {
      return [{ rel: 'grow', method: "POST" },
              { rel: 'toss', method: "DELETE"}];
    }
    else if (this.weight >= 200.0 && this.weight < 300.0) {
      return [{ rel: 'eat', method: "PUT" },
              { rel: 'toss', method: "DELETE" }];
    }
    else if ( ! this.weight) {
      return [{ rel: 'toss', method: "DELETE"}];
    }
    return [];
  };
};

//service processing pipeline
//configure and and start:
service.configure(this)
              .use(authenticator)
              .use(resolver)
              .use(authorizer)
              .use(invoker)
              .use(converter)
              .on(httpServer.create())
              .start(8070);

// wsServer.create(pipeline-x);
log("Server running at port: " + 8070 + "\nCTRL + SHIFT + C to shutdown");

