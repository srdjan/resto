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

exports.resolve = function resolve(ctx) {
  var _getTypeName = fn.mapM(Either.of(ctx.url), getTypeName).orElse(function(err) {return err;});
  if(_getTypeName.isLeft) {
    ctx.result = _getTypeName.swap().get();
    return ctx;
  }

  ctx.typeName = getTypeName(ctx.url).get();
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

  //test: getTypeName(url):- api/apples/123456/create
  var url = '/api/apples/';
  var typeName = getTypeName(url);
  expect(typeName.get()).to.be('Apple');

  // url = 'api/apples/' + fn.atob('123456');
  // typeName = getTypeName(url);
  // expect(typeName).to.be('Apple');

  // url = 'api/apples/';
  // typeName = getTypeName(url);
  // expect(typeName).to.be('Apple');

  // url = 'api/apples/' + fn.atob('123456');
  // typeName = getTypeName(url);
  // expect(typeName).to.be('Apple');

  // url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
  // typeName = getTypeName(url);
  // expect(typeName).to.be('Apple');

  // should fail
  url = 'apples' + fn.atob(123456 + '/' + 'create');
  typeName = getTypeName(url);
  log(typeName.swap().get());
  expect(typeName.isLeft).to.be(true);
