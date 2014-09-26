var service       = require('../../src/service');
var pipeline      = require('../../src/pipeline');
var http          = require('../../src/server');
var authenticator = require('../../src/authn');
var authorizer    = require('../../src/authr');
var resolver      = require('../../src/resolver');
var invoker       = require('../../src/invoker');
var converter     = require('../../src/hal');

var farm          = require('./resources/farm');
var apples        = require('./resources/apple');

var Model = model.compose(farm).hasMany(apples);

var ReqResp = pipeline.expose(Model)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter);

var EndPoint = http.create(ReqResp);
EndPoint.start(8080);

//var endPoints = [].push(http.create(8080)
//                  .push(ws.create(7676)));
