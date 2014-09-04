//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var Either = require('data.either');
var Failure = Either.Left;
var Success = Either.Right;
var log = console.log;

var stash = [];

function trace(func, ctx) {
  log(fn.getFnName(func) + ', ' + JSON.stringify(ctx) + '\r\n');
}

function writeToResp(ctx, statusCode, content) {
  ctx.resp.writeHead(statusCode, {"Content-Type": "application/json"});
  ctx.resp.write(content);
  ctx.resp.end();
}

// function _run(ctx) {
//   return Either.of(newTodo)
//           .chain(state_pending)
//           .chain(state_done)
//           .chain(state_archived)
//           .orElse(function(todo) {
//             return todo;
//           });
// }

exports.use = function(f, p, t) {
  stash.push({ func: f, pred: p || false, trace: t || false});
};

exports.run = function(ctx) {
  try {
    ctx.statusCode = 200;
    fn.each(function(h) {
      if(h.trace) { trace(h.func, ctx); }

      return ctx.statusCode === 200 ? Success(h.func(ctx))
                                  : Failure(writeToResp(ctx, statusCode, content));
    }, stash);
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' message: ' + e.message);
    writeToResp(ctx, e.statusCode, e.message);
  }
  finally {
    return ctx;
  }
};

