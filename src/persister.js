//---------------------------------------------------------------------------------
//- db-cmd
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

exports.persist = function persist(ctx) {
  if (ctx.method === 'get') {
    return fn.Next(ctx);
  }

  if (ctx.method === 'put' || ctx.method === 'patch') {
    ctx.result = db.save(ctx.entity);
    return fn.Next(ctx);
  }

  if (ctx.method === 'delete') {
    ctx.result = db.remove(ctx.id);
    return fn.Next(ctx);
  }

  if (ctx.method === 'post') {
    if(ctx.id === 0) {
      ctx.result = db.add(ctx.entity);
    }
    else {
      ctx.result = db.save(ctx.entity);
    }
    return fn.Next(ctx);
  }

  return fn.Fail({ statusCode: 405, message: 'Method Not Allowed' });
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: db-cmd.js');

