//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var log = console.log;

function invoke(ctx) {
  // log('invoker');
  //todo: create a diff path, query vs cmd
  ctx = ctx.handler(ctx);
  return ctx;
}
module.exports.invoke = invoke;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: invoker.js');


