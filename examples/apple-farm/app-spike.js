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

var appleFarm = service.create(farm)
                       .hasMany(apples);

pipeline.expose(appleFarm.model)
        .use(authenticator)
        .use(resolver)
        .use(authorizer)
        .use(invoker)
        .use(converter);

var server = http.create(pipeline).runOn(8090);
