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
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

exports.resolve = function resolve(ctx) {
  ctx.typeName = getTypeName(ctx.url);
  ctx.typeCtor = app[ctx.typeName];
  var handler = resource[ctx.method];
  ctx.result = handler(ctx);
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: resolver.js');

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
