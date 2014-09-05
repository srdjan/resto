var Either = require('data.either');
var log = console.log;

var handlers = [];

// Monad(a), (a -> b) -> Monad(b)
function map(monad, transformation) {
  return monad.chain(function(value) {
    return transformation(value);
  });
}

// (ctx -> ctx), (expr -> bool), bool -> undefined
function use(f, p, t) {
  handlers.push({ func: f, pred: p || false, trace: t || false});
}

// ctx -> ctx
function run(ctx) {
  var _run = Either.of(ctx);
  handlers.forEach(function(h) { _run = map(_run, h.func); });
  return _run;
}

module.exports = {
  use: use,
  run: run
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: monad-pipeline-spike.js');

function f1(ctx) {
  if(ctx.counter > 1) return Either.Left(new Error('f1'));
  ctx.counter += 1;
  log('f1: ' + ctx.counter);
  return Either.Right(ctx);
}
function f2(ctx) {
  if(ctx.counter > 1) return Either.Left(new Error('f2'));
  ctx.counter += 1;
  log('f2: ' + ctx.counter);
  return Either.Right(ctx);
}
function f3(ctx) {
  if(ctx.counter > 1) return Either.Left(new Error('f3'));
  ctx.counter += 1;
  log('f3: ' + ctx.counter);
  return Either.Right(ctx);
}

// setup
use(f1);
use(f2);
use(f3);

// run
var result = run({counter: 0, statusCode: 200}).orElse(function(err) {return err;});
log(result);

