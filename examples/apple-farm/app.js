var pipeline      = require('../../lib/pipeline');
var authenticator = require('../../lib/authn').auth;
var authorizer    = require('../../lib/authr').auth;
var resolver      = require('../../lib/resolver').resolve;
var invoker       = require('../../lib/invoker').invoke;
var converter     = require('../../lib/hal').convert;
var http          = require('../../lib/server');

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
