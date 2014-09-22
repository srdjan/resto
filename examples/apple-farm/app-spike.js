var service       = require('resto.service');
var pipeline      = require('resto.pipeline');
var http          = require('resto.httpserver');
var authenticator = require('resto.middleware.authn');
var authorizer    = require('resto.middleware.authr');
var resolver      = require('resto.middleware.resolver');
var invoker       = require('resto.middleware.invoker');
var converter     = require('resto.middleware.hal');
//- dsl
var withMany      = require('resto.realtionships').hasMany;
var ownedBy       = require('resto.realtionships').hasOne;
var whoHas        = require('resto.realtionships').hasOne;
//- resources
var farm          = require('./resources/farm');
var farmer        = require('./resources/farmer');
var appleOrchard  = require('./resources/appleOrchard');
var apples        = require('./resources/apple');

var appleFarm = service.compose(farm)
                       .ownedBy(farmer)
                       .whoHas(appleOrchard)
                       .withMany(apples);

pipeline.expose(appleFarm).on(http)
        .use(authenticator)
        .use(resolver)
        .use(authorizer)
        .use(invoker)
        // .use(liveupdate)
        .use(converter);

pipeline.runOn(8070);
