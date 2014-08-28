//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var handler = require('./resolver.js').handle;
var toHal = require('./hal.js').toHal;
var proxy = require('./proxy-logger.js');
var log = console.log;

var stash = [];
var logBefore = false;
var logAfter = false;

function use(f) {
  stash.push(f);
}

function trace(f, ctx) {
  log(fn.getFnName(f) + ', before: ' + JSON.stringify(ctx) + '\r\n');
}

function run(ctx) {
  fn.each(function(f) {
      if(logBefore) { trace(f, ctx); }

      f(ctx);

      if(logBefore) { trace(f, ctx); }
    }, stash);
}

use(handler);
use(toHal);

exports.pipeline = function(ctx) {
  try {
    run(ctx);
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' meessage: ' + e.message);
    ctx.resp.writeHead(e.statusCode, {"Content-Type": "application/json"});
    ctx.resp.write(e.message);
  }
};

exports.setLogBefore = function(yn) {
  logBefore = yn;
};

exports.setLogAfter = function(yn) {
  logAfter = yn;
};
