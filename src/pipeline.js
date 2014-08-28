//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var handler = require('./resolver.js').handle;
var toHal = require('./hal.js').toHal;
var proxy = require('./proxy-logger.js');
var log = console.log;

var pipe = function pipeline() {
  var queue = [];
  var logBefore = false;
  var logAfter = false;

  return {
    setLogBefore: function(yn) {
      logBefore = yn;
    },
    setLogAfter: function(yn) {
      logAfter = yn;
    },
    use: function(fn) {
      queue.push(fn);
    },
    run: function(ctx) {
      fn.each(function(job) {
          if(logBefore) log(JSON.stringify(ctx));
          job(ctx);
          if(logAfter) log(JSON.stringify(ctx));
        }, queue); }
  };
}();

pipe.use(handler);
pipe.use(toHal);
pipe.setLogBefore(true);

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
