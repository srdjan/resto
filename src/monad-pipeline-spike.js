var Either = require('data.either');
var log = console.log;

var handlers = [];

// (ctx -> ctx), (expr -> bool), bool -> undefined
function use(f, p, t) {
  handlers.push({ func: f, pred: p || false, trace: t || false});
}


//tood: map could be used when input is data, but is there any advantage over simple function???
// // f, d, ep -> (d -> d)
// function map(f, d, ep) {
//   var r = f(d);
//   var m = p(r) ? Either.Left(r) : Either.Right(r);
//   return m.orElse(function(e) { log('Error!'); return e;});
// }

// f, m(a), ep -> m(b)
function combine(f, m, ep) {
  return m.chain(function(d) {
    var r = f(d);
    return ep(r) ? Either.Left(r) : Either.Right(r);
  });
}
// hs, d, ep -> (d -> d)
function combineAll(hs, d, ep) {
  var m = Either.of(d);
  hs.forEach(function(h) { m = combine(h.func, m, ep); });
  return m.orElse(function(e) { log('Error!'); return e;});
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: monad-pipeline-spike-till-fail.js');

function f1(ctx) {
  if(ctx.counter > 1) {
    ctx.statusCode = 500;
    return ctx;
  }
  ctx.counter += 1;
  log('f1, counter: ' + ctx.counter);
  return ctx;
}
function f2(ctx) {
  if(ctx.counter > 2) {
    ctx.statusCode = 500;
    return ctx;
  }
  ctx.counter += 1;
  log('f2, counter: ' + ctx.counter);
  return ctx;
}
function f3(ctx) {
  if(ctx.counter > 1) {
    ctx.statusCode = 500;
    return ctx;
  }
  ctx.counter += 1;
  log('f3, counter: ' + ctx.counter);
  return ctx;
}

// setup
use(f1);
use(f2);
use(f3);

// run until failure
var result = combineAll(handlers, {counter: 1, statusCode: 200}, function(d) {d.statusCode !== 200;});
log(result);
//output:
//> f1, counter: 2
//> f2, counter: 3
//> Error!
//> { counter: 3, statusCode: 500 }
