//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var log = console.log;

var stash = [];
var logBefore = false;
var logAfter = false;

function trace(f, ctx, when) {
  log(fn.getFnName(f) + ', ' + when + ': ' + JSON.stringify(ctx) + '\r\n');
}

function run(ctx) {
  fn.each(function(h) {
    if(logBefore) { trace(h.func, ctx, 'before'); }
    ctx = h.func(ctx);
    if(logAfter) { trace(h.func, ctx, 'after'); }
  }, stash);
  return ctx;
}

exports.run = function(ctx) {
  try {
    run(ctx);
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
