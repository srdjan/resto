//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var resource = require('./resource.js');
var log = console.log;

function trimLeftAndRight(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "");
}

function getTokens(url) {
  var path = url.substring(url.indexOf('api'), url.length);
  return trimLeftAndRight(path, '/').split('/');
}

//- api/apples || api/apples/abc3b4=1
function getId(tokens) {
  var id = fn.btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) {
    return { id: 0, rel: ''};
  }
  return { id: id, rel: ''};
}

//- api/apples/123456/create
function getIdAndRel(url) {
  var tokens = getTokens(url);
  var idAndRel = getId(tokens);
  if(idAndRel.id !== 0) {
    return idAndRel;
  }
  tokens = fn.btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  }
  else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
}

//- api/apples/123456/create
function getTypeFromPath(url) {
  var tokens = getTokens(url);
  if (tokens.length > 1) {
    var typeName = tokens[1].slice(0, -1);
    return typeName.charAt(0).toUpperCase() + typeName.substring(1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

function handle(ctx) {
  var idAndRel = getIdAndRel(ctx.req.url);
  ctx.id = idAndRel.id;
  ctx.rel = idAndRel.rel;
  ctx.body = ctx.req.body;
  ctx.typeName = getTypeFromPath(ctx.req.url);
  ctx.typeCtor = app[ctx.typeName];

  var handler = resource[ctx.req.method.toLowerCase()];

  ctx.result = handler(ctx);
  if (! fn.hasProp(ctx.result, 'statusCode')) {
    ctx.result.statusCode = 200;
  }
  return ctx;
}

module.exports.handle = handle;
