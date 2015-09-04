const pipeline      = require('./lib/pipeline');
const authenticator = require('./lib/authn').auth;
const authorizer    = require('./lib/authr').auth;
const resolver      = require('./lib/resolver').resolve;
const invoker       = require('./lib/invoker').invoke;
const converter     = require('./lib/hal').convert;
const http          = require('./lib/server');

const apple         = require('./resources/apple');
const log           = console.log;

const appleResource = apple;

const reqResp = pipeline.expose(appleResource)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter)

const EndPoint = http.create(reqResp);
EndPoint.start(8080);
