//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var hal = require('./hal.js');
var app = require('./app.js');
var log = console.log;

exports.handle = function(ctx) {
    // log(ctx.req.method.toLowerCase() + ' ' + ctx.req.url);
    var requestedType = fn.getTypeFromPath(ctx.req.url);
    var resource = app[requestedType + 'Resource'];
    var handler = resource[ctx.req.method.toLowerCase()];
    ctx.result = handler(ctx.req, ctx.resp);
    return ctx;
};

