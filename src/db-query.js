//---------------------------------------------------------------------------------
//- db-query
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

exports.query = function query(ctx) {
  if (ctx.method.toLowerCase() !== 'get') {
    if(ctx.id > 0) {
      ctx.entity = db.get(ctx.id);
    }
    return ctx;
  }

  if (ctx.id === 0) {
    ctx.result = db.getAll();
  }
  else {
    ctx.result = db.get(ctx.id);
  }
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: db-query.js');

