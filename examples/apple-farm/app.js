var service       = require('../../src/service');
var authenticator = require('../../src/authn').auth;
var authorizer    = require('../../src/authr').auth;
var resolver      = require('../../src/resolver').resolve;
var invoker       = require('../../src/invoker').invoke;
var converter     = require('../../src/hal').convert;
var httpServer    = require('../../src/server');

var apple = require('./resources/apple');
var log = console.log;

// service processing pipeline
// configure and and start:
service.expose(apple/* compose(farm, ownedBy, farmer, has, apple-orchard */).on(httpServer.create(service))
              .use(authenticator)
              .use(resolver)
              .use(authorizer)
              .use(invoker)
              .use(converter)
              .start(8070);
log("Apple Farm Service running at port: " + 8070 + "\nCTRL + SHIFT + C to shutdown");

