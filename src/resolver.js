//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var resource = require('./resource.js');
var log = console.log;

//- api/apples/123456/create
function getTypeFromPath(url) {
  var tokens = fn.getTokens(url);
  if (tokens.length > 1) {
    var typeName = tokens[1].slice(0, -1);
    return typeName.charAt(0).toUpperCase() + typeName.substring(1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

exports.handle = function handle(ctx) {
  var idAndRel = fn.getIdAndRel(ctx.req.url);
  ctx.req.id = idAndRel.id;
  ctx.req.rel = idAndRel.rel;

  var requestedType = getTypeFromPath(ctx.req.url);
  ctx.req.typeName = requestedType;
  ctx.req.typeCtor = app[requestedType];

  var handler = resource[ctx.req.method.toLowerCase()];
  ctx.result = handler(ctx.req);
  if (! fn.hasProp(ctx.result, 'statusCode')) {
    ctx.result.statusCode = 200;
  }
  return ctx;
};

