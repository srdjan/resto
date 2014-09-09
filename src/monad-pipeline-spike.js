var Either = require('data.either');
var log = console.log;

var handlers = [];

function use(f, p, t) {
  handlers.push({ func: f, pred: p || false, trace: t || false});
}

// f, ep, m(a) -> m(b)
function run(f, ep, m) {
  return m.chain(function(d) {
    var r = f(d);
    return ep(r) ? Either.Left(r) : Either.Right(r);
  });
}

// hs, ep, a -> b | err
function runAll(hs, ep, d) {
  var m = Either.of(d);
  hs.forEach(function(h) { m = run(h.func, ep, m); });
  return m.merge();
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: monad-pipeline-spike.js');

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
  if(ctx.counter > 1) {
    ctx.statusCode = 500;
    return ctx;
  }
  ctx.counter += 1;
  return ctx;
}

// setup
use(f1);
use(f2);
use(f3);

// run until failure
var result = runAll(handlers, function(d) {return d.statusCode !== 200;}, {counter: 1, statusCode: 200});
log(result);

//output:
//>f1, counter before: 1
//>f2, counter before: 2
//>{ counter: 2, statusCode: 500 }
