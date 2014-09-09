//---------------------------------------------------------------------------------
//- method resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var resource = require('./resource.js');
var log = console.log;

function resolve(ctx) {
  ctx.handler = resource[ctx.method];
  if (typeof ctx.handler === 'undefined') {
    ctx.result = {Error: 'method resolver error'};
    ctx.statusCode = 500;
    return ctx;
  }
  return ctx;
}

module.exports.resolve = resolve;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: method-resolver.js');

  var ctx = resolve({ method: 'bad method name'});
  expect(ctx.statusCode).to.be(500);

  ctx = resolve({method: 'get'});
  expect(typeof ctx.handler).to.be('function');
