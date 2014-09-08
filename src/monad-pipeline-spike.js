var Either = require('data.either');
var fn = require('./fn.js');
var log = console.log;

var handlers = [];

// (ctx -> ctx), (expr -> bool), bool -> undefined
function use(f, p, t) {
  handlers.push({ func: f, pred: p || false, trace: t || false});
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: monad-pipeline-spike-till-fail.js');

function f1(ctx) {
  log('f1, counter before: ' + ctx.counter);
  if(ctx.counter > 1) {
    ctx.statusCode = 500;
    return ctx;
  }
  ctx.counter += 1;
  return ctx;
}
function f2(ctx) {
  log('f2, counter before: ' + ctx.counter);
  if(ctx.counter > 1) {
    ctx.statusCode = 500;
    return ctx;
  }
  ctx.counter += 1;
  return ctx;
}
function f3(ctx) {
  log('f3, counter before: ' + ctx.counter);
  // if(ctx.counter > 1) {
  //   ctx.statusCode = 500;
  //   return ctx;
  // }
  ctx.counter += 1;
  return ctx;
}

// setup
use(f1);
use(f2);
use(f3);

// run until failure
var result = fn.combineAll(handlers, function(d) {return d.statusCode !== 200;}, {counter: 1, statusCode: 200});
log(result);
//output:
//> f1, counter: 2
//> f2, counter: 3
//> Error!
//> { counter: 3, statusCode: 500 }
