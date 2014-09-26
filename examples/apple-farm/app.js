var pipeline      = require('../../src/pipeline');
var authenticator = require('../../src/authn').auth;
var authorizer    = require('../../src/authr').auth;
var resolver      = require('../../src/resolver').resolve;
var invoker       = require('../../src/invoker').invoke;
var converter     = require('../../src/hal').convert;
var http          = require('../../src/server');
var apple         = require('./resources/apple');
var log           = console.log;

var Model = apple;

var ReqResp = pipeline.expose(Model)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter);

var EndPoint = http.create(ReqResp);
EndPoint.start(8080);
