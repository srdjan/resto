var pipeline      = require('../../lib/pipeline');
var authenticator = require('../../lib/authn').auth;
var authorizer    = require('../../lib/authr').auth;
var resolver      = require('../../lib/resolver').resolve;
var invoker       = require('../../lib/invoker').invoke;
var converter     = require('../../lib/hal').convert;
var http          = require('../../lib/server');

var apple         = require('./resources/apple');
var log           = console.log;

var appleResource = apple;

var ReqResp = pipeline.createFor(appleResource)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter);

var EndPoint = http.createOn(ReqResp);
EndPoint.start(8080);
