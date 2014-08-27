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
    log(ctx.req.method.toLowerCase() + ': ' + ctx.req.url);

    var handler = getHandler(ctx.req.url, ctx.req.method.toLowerCase());
    log(1)
    var result = handler(ctx.req, ctx.resp);
    log(2)
    var halRep = hal.convert(result);
    log(3)
    ctx.resp.writeHead(200, {"Content-Type": "application/json"});
    ctx.resp.write(JSON.stringify(halRep));
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
      e.message = 'Unknown Error!'
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' meessage: ' + e.message);
    ctx.resp.writeHead(e.statusCode, {"Content-Type": "application/json"});
    ctx.resp.write(e.message);
  }
  ctx.resp.end();
  return ctx;
};

