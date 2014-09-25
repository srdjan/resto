var pipeline      = require('../../src/pipeline');
var authenticator = require('../../src/authn').auth;
var authorizer    = require('../../src/authr').auth;
var resolver      = require('../../src/resolver').resolve;
var invoker       = require('../../src/invoker').invoke;
var converter     = require('../../src/hal').convert;
var http          = require('../../src/server');
var apple         = require('./resources/apple');
var log = console.log;

pipeline.expose(apple).on(http)//.on([http, ws])
        .use(authenticator)
        .use(resolver)
        .use(authorizer)
        .use(invoker)
        .use(converter)
        .listenOn(8080);


