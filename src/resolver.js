//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var log = console.log;

exports.handle = function handle(ctx) {
  var requestedType = fn.getTypeFromPath(ctx.req.url);
  var resource = app[requestedType + 'Resource'];
  var handler = resource[ctx.req.method.toLowerCase()];

  var idAndRel = fn.getIdAndRel(ctx.req.url);
  ctx.req.id = idAndRel.id;
  ctx.req.rel = idAndRel.rel;

  ctx.result = handler(ctx.req);
  if (! fn.hasProp(ctx.result, 'statusCode')) {
    ctx.result.statusCode = 200;
  }
  return ctx;
};

