//---------------------------------------------------------------------------------
//- db-cmd
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

exports.persist = function persist(ctx) {
  if (ctx.req.method.toLowerCase() === 'get') {
    return ctx;
  }

  if (ctx.req.method.toLowerCase() === 'put' || ctx.req.method.toLowerCase() === 'patch') {
    ctx.result = db.save(ctx.entity);
    return ctx;
  }
  if (ctx.req.method.toLowerCase() === 'delete') {
    ctx.result = db.remove(ctx.id);
    return ctx;
  }
  if (ctx.req.method.toLowerCase() === 'post') {
    if(ctx.id === 0) {
      ctx.result = db.add(ctx.entity);
    }
    else {
      ctx.result = db.save(ctx.entity);
    }
    return ctx;
  }

  throw { statusCode: 405, message: 'Method Not Allowed' };
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: db-cmd.js');

