//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var resource = require('./resource.js');
var db = require('./db.js');
var log = console.log;

function getTypeName(url) {
  var tokens = fn.getTokens(url);
  if (tokens.length > 1) {
    var typeName = tokens[1].slice(0, -1);
    return fn.Success(typeName.charAt(0).toUpperCase() + typeName.substring(1));
  }
  return fn.Fail({ statusCode: 400, message: 'Bad Request' });
}

exports.resolve = function resolve(ctx) {
  var result = fn.run(getTypeName, ctx.url);
  if(result.isLeft) { //todo: need fn.isError(result) ?
    ctx.result = result;
    return fn.Fail(ctx);
  }

  ctx.typeName = result.get();
  ctx.typeCtor = app[ctx.typeName];
  var handler = resource[ctx.method];
  ctx.result = handler(ctx);
  return fn.Next(ctx);
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

