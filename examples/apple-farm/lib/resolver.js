//---------------------------------------------------------------------------------
//- type resolver
//---------------------------------------------------------------------------------
'use strict';

var fn = require('./fn');
var log = console.log;

function resolve(ctx) {
  var tokens = fn.getTokens(ctx.url);
  if (tokens.length < 2) {
    ctx.result = { Error: 'type resolver error' };
    ctx.statusCode = 500;
    return ctx;
  }
  var typeName = tokens[1].slice(0, -1);
  ctx.typeName = typeName.charAt(0).toUpperCase() + typeName.substring(1);
  ctx.typeCtor = ctx.model[ctx.typeName];

  if (!ctx.hal) {
    if (tokens.length === 3) {
      var id = Number(tokens[2]);
      if (!isNaN(id)) {
        ctx.id = id; //todo: convert to number?
      }
    }
  }
  return ctx;
}

module.exports.resolve = resolve;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: type-resolver.js');

// test: resolveType(url):- api/apples/123456/create
var url = '/api/apples/';
var ctx = resolve({ hal: false, url: url, model: { Apple: function Apple() {} } });
expect(ctx.typeName).to.be('Apple');

url = 'api/apples/' + fn.atob('123456');
ctx = resolve({ hal: false, url: url, model: { Apple: function Apple() {} } });
expect(ctx.typeName).to.be('Apple');

url = 'api/apples/';
ctx = resolve({ hal: false, url: url, model: { Apple: function Apple() {} } });
expect(ctx.typeName).to.be('Apple');

url = 'api/apples/' + fn.atob('123456');
ctx = resolve({ hal: false, url: url, model: { Apple: function Apple() {} } });
expect(ctx.typeName).to.be('Apple');

url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
ctx = resolve({ hal: false, url: url, model: { Apple: function Apple() {} } });
expect(ctx.typeName).to.be('Apple');

//should fail
url = 'apples' + fn.atob(123456 + '/' + 'create');
ctx = resolve({ hal: false, url: url, model: { Apple: function Apple() {} } });
expect(ctx.statusCode).to.be(500);