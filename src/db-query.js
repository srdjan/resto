//---------------------------------------------------------------------------------
//- db-query
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

exports.query = function query(ctx) {
  if (ctx.req.method.toLowerCase() !== 'get') {
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
