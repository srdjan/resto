var pipeline      = require('../../src/pipeline');
var authenticator = require('../../src/authn').auth;
var authorizer    = require('../../src/authr').auth;
var resolver      = require('../../src/resolver').resolve;
var invoker       = require('../../src/invoker').invoke;
var converter     = require('../../src/hal').convert;
var httpServer    = require('../../src/server');
var apple         = require('./resources/apple');
var log = console.log;

pipeline.expose(apple/* compose(farm, ownedBy, farmer, has, apple-orchard */)
              .use(authenticator)
              .use(resolver)
              .use(authorizer)
              .use(invoker)
              .use(converter)
              .on(httpServer.create(pipeline))
              .start(8080);


