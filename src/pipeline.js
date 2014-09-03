//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var Either = require('data.either');
var Failure = Either.Left;
var Success = Either.Right;
var log = console.log;

var stash = [];
var logBefore = false;

function trace(func, ctx, when) {
  log(fn.getFnName(func) + ', ' + when + ': ' + JSON.stringify(ctx) + '\r\n');
}

exports.run = function(ctx) {
  try {
    ctx.statusCode = 200;
    fn.each(function(h) {
      if(logBefore) { trace(h.func, ctx, 'before'); }

      return ctx.statusCode === 200 ? Success(h.func(ctx))
                                  : Failure("Error: " + ctx.statusCode);
    }, stash);
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' message: ' + e.message);
    ctx.resp.writeHead(e.statusCode, {"Content-Type": "application/json"});
    ctx.resp.write(e.message);
  }
  finally {
    return ctx;
  }
};

exports.use = function(f, p) {
  stash.push({ func: f, pred: p || false});
};
