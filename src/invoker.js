//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var log = console.log;

exports.invoke = function invoke(ctx) {
  log('invoker');
  //todo: create a diff path, query vs cmd
  ctx = ctx.handler(ctx);
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: invoker.js');


