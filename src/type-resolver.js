//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var log = console.log;

function resolveType(ctx) {
  // log('type-resolver');
  var tokens = fn.getTokens(ctx.url);
  if (tokens.length > 1) {
    var typeName = tokens[1].slice(0, -1);
    ctx.typeName = typeName.charAt(0).toUpperCase() + typeName.substring(1);
    ctx.typeCtor = app[ctx.typeName];
    return ctx;
  }
  ctx.result = {Error: 'type resolver error'};
  ctx.statusCode = 500;
  return ctx;
}

module.exports.resolve = resolveType;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: type-resolver.js');

  //test: resolveType(url):- api/apples/123456/create
  var url = '/api/apples/';
  var ctx = resolveType({url: url});
  expect(ctx.typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  ctx = resolveType({url: url});
  expect(ctx.typeName).to.be('Apple');

  url = 'api/apples/';
  ctx = resolveType({url: url});
  expect(ctx.typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  ctx = resolveType({url: url});
  expect(ctx.typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
  ctx = resolveType({url: url});
  expect(ctx.typeName).to.be('Apple');

  // should fail
  url = 'apples' + fn.atob(123456 + '/' + 'create');
  ctx = resolveType({url: url});
  expect(ctx.statusCode).to.be(500);

