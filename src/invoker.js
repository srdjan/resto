//---------------------------------------------------------------------------------
//- invoker
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var log = console.log;

exports.invoke = function invoke(ctx) {
  if(typeof ctx.result !== 'undefined') {
    return ctx;
  }
  ctx.result = ctx.handler(ctx);
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: invoker.js');

