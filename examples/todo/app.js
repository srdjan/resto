var service = require('./service');
var authenticator = require('./authn').auth;
var authorizer = require('./authr').auth;
var resolver = require('./resolver').resolve;
var invoker = require('./invoker').invoke;
var converter = require('./hal').convert;
var httpServer = require('../server');

var activity = require('./resources/activity');
var todo = require('./resources/todo');
var log = console.log;

// service processing pipeline
// configure and and start:
service.compose(activity, hasMany, todo).on(httpServer.create())
              .use(authenticator)
              .use(resolver)
              .use(authorizer)
              .use(invoker)
              .use(converter)
              .start(8070);
log("Todo Service running at port: " + 8070 + "\nCTRL + SHIFT + C to shutdown");

