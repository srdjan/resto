//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('../src/fn.js');
var handler = require('../src/resolver.js').handle;
var toHal = require('../src/hal.js').toHal;
var log = console.log;

var pipe = function pipeline() {
  var queue = [];
  var logBefore = false;
  var logAfter = false;

  return {
    setLog: function(before, after) {
      logBefore = before || false;
      logafter = after || false;
    },
    use: function(fn) {
      queue.push(fn);
    },
    run: function(ctx) {
      fn.each(function(job) {
          if(logBefore) log(ctx);
          job(ctx);
          if(logAfter) log(ctx);
        }, queue); }
  };
}();

pipe.use(handler);
pipe.use(toHal);
pipe.setLog(true);

exports.pipeline = function(ctx) {
  try {
    pipe.run(ctx);
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
