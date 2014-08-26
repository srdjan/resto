//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var hal = require('./hal.js');
var app = require('./app.js');
var log = console.log;

function getHandler(url, method) {
  var requestedType = fn.getTypeFromPath(url);
  var resource = app[requestedType + 'Resource'];
  return resource[method];
}

exports.handle = function(ctx) {
  try {
    var handler = getHandler(ctx.req.url, ctx.req.method.toLowerCase());
    var result = handler(ctx.req, ctx.resp);
    var halRep = hal.convert(result.name, result.data);
    ctx.resp.statusCode = 200;
    ctx.resp.write(JSON.stringify(halRep));
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      log('3')
      e.statusCode = 500;
      e.message = 'Unknown Error!'
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' mesg: ' + e.message);
    ctx.resp.statusCode = e.statusCode;
    ctx.resp.write(e.message);
  }
  return ctx;
};

