var Either = require('data.either');
var Success = Either.Left;
var Continue = Either.Right;
var log = console.log;
var handlers = [];

// Monad(a), (a -> b) -> Monad(b)
function map(monad, transformation) {
  return monad.chain(function(value) {
    return monad.of(transformation(value));
  });
}

// (ctx -> ctx), (expr -> bool), bool -> undefined
function use(f) {
  handlers.push(f);
}

// ctx -> (ctx -> ctx)
function run(ctx) {
  var m = Either.of(ctx);
  handlers.forEach(function(f) { m = map(m, f); });
  return m.orElse(function(e) { return e; });
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
  log('f1 ran');
  if(ctx.statusCode === 200) {
    return Success(ctx);
  }
  return Continue(ctx);
}
function f2(ctx) {
  log('f2 ran');
  if(ctx.statusCode === 201) {
    return Success(ctx);
  }
  return Continue(ctx);
}
function f3(ctx) {
  log('f3 ran');
  if(ctx.statusCode === 404) {
    return Success(ctx);
  }
  return Continue(ctx);
}

// setup
use(f1);
use(f2);
use(f3);

// run until success
var result = run({counter: 1, statusCode: 201});
log(result.get());
//output:
//>f1 ran, counter: 1
//>f2 ran, counter: 2
//>{ counter: 2, statusCode: 200 }
