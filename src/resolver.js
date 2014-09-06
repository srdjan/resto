//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var Either = require('data.either');
var resource = require('./resource.js');
var db = require('./db.js');
var log = console.log;

function getTypeName(url) {
  var tokens = fn.getTokens(url);
  if (tokens.length > 1) {
    var typeName = tokens[1].slice(0, -1);
    return Either.Right(typeName.charAt(0).toUpperCase() + typeName.substring(1));
  }
  return Either.Left({ statusCode: 400, message: 'Bad Request' });
}
var _try = function(f, data) { return fn.mapM(Either.of(data), f).orElse(function(err) {return err.swap().get();});};

exports.resolve = function resolve(ctx) {
  var result = _try(getTypeName, ctx.url);
  if(result.isLeft) {
    ctx.result = result;
    return ctx;
  }

  ctx.typeName = result.get();
  ctx.typeCtor = app[ctx.typeName];
  var handler = resource[ctx.method];
  ctx.result = handler(ctx);
  return Either.Right(ctx);
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: resolver.js');

  var result = exports.resolve({url: '/api/apples/', method: 'get', id: 0});
  // expect(result.get().result.length).to.be(0);

  //test: getTypeName(url):- api/apples/123456/create
  var url = '/api/apples/';
  var typeName = getTypeName(url);
  expect(typeName.get()).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  typeName = getTypeName(url);
  expect(typeName.get()).to.be('Apple');

  url = 'api/apples/';
  typeName = getTypeName(url);
  expect(typeName.get()).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  typeName = getTypeName(url);
  expect(typeName.get()).to.be('Apple');

  url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
  typeName = getTypeName(url);
  expect(typeName.get()).to.be('Apple');

  // should fail
  url = 'apples' + fn.atob(123456 + '/' + 'create');
  typeName = getTypeName(url);
  // log(typeName.swap().get());
  expect(typeName.isLeft).to.be(true);

