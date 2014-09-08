//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var resource = require('./resource.js');
var log = console.log;

function resolveMethod(ctx) {
  // log('method-resolver');
  ctx.handler = resource[ctx.method];
  if (typeof ctx.handler === 'undefined') {
    ctx.result = {Error: 'method resolver error'};
    ctx.statusCode = 500;
    return ctx;
  }
  return ctx;
}

module.exports.resolve = resolveMethod;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: fn-resolver.js');

  var ctx = resolveMethod({ method: 'bad method name'});
  expect(ctx.statusCode).to.be(500);

  ctx = resolveMethod({method: 'get'});
  expect(typeof ctx.handler).to.be('function');
