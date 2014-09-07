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
    return typeName.charAt(0).toUpperCase() + typeName.substring(1);
  }
  return '?';
}

exports.resolve = function resolve(ctx) {
  ctx.typeName = getTypeName(ctx.url);
  ctx.typeCtor = app[ctx.typeName];
  var handler = resource[ctx.method];
  if(typeof ctx.typeCtor !== 'undefined') {
    ctx.result = handler(ctx);
    return fn.Next(ctx);
  }
  return fn.Fail(ctx);
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: resolver.js');

  var result = exports.resolve({url: 'bad url!', method: 'get', id: 0});
  expect(result.isRight).to.be(false);

  result = exports.resolve({url: '/api/apples/', method: 'get', id: 0});
  expect(result.get().typeName).to.be('Apple');

  //test: getTypeName(url):- api/apples/123456/create
  var url = '/api/apples/';
  var typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/';
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  // should fail
  url = 'apples' + fn.atob(123456 + '/' + 'create');
  typeName = getTypeName(url);
  expect(typeName).to.be('?');

