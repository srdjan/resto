//---------------------------------------------------------------------------------
//- invoker
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var log = console.log;

exports.invoke = function invoke(ctx) {
  if(typeof ctx.result !== 'undefined') {
    return ctx;
  }
  // log(ctx.req)
  ctx.body = ctx.req.body;
  ctx.result = ctx.handler(ctx);
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: invoker.js');

