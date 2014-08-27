//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('../src/fn.js');
var handler = require('../src/resolver.js').handle;
var toHal = require('../src/hal.js').toHal;
var log = console.log;

//todo:  var pipeline = fn.compose(toHal, handler, jsonSanitizer, auth);

var pipeline = fn.compose(toHal, handler);

exports.process = function(ctx) {
  try {
    pipeline(ctx);
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    // log('Fx Exception, statusCode: ' + e.statusCode + ' meessage: ' + e.message);
    ctx.resp.writeHead(e.statusCode, {"Content-Type": "application/json"});
    ctx.resp.write(e.message);
  }
}

