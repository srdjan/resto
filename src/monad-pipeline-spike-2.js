var Either = require('data.either');
var Success = Either.Left;
var Continue = Either.Right;
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

// ctx -> (ctx -> ctx)
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
log('testing: monad-pipeline-spike-till-ok.js');

function f1(ctx) {
  if(ctx.statusCode === 200) {
    log('f1 ran');
    return Success(ctx);
  }
  return Continue(ctx);
}
function f2(ctx) {
  if(ctx.statusCode === 201) {
    log('f2 ran');
    return Success(ctx);
  }
  return Continue(ctx);
}
function f3(ctx) {
  if(ctx.statusCode === 404) {
    log('f3 ran');
    return Success(ctx);
  }
  return Continue(ctx);
}

// setup
use(f1);
use(f2);
use(f3);

// run until success
var result = run({counter: 1, statusCode: 201})
                .orElse(function(ctx) { return ctx; });
log(result);
//output:
//>f1 ran, counter: 1
//>f2 ran, counter: 2
//>{ counter: 2, statusCode: 200 }
