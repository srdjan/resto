//---------------------------------------------------------------------------------
//- db-cmd
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var db = require('./db.js');
var log = console.log;

exports.persist = function persist(ctx) {
  log('persister');
  if (ctx.method === 'get') {
    return ctx;
  }

  if (ctx.method === 'put' || ctx.method === 'patch') {
    ctx.result = db.save(ctx.entity);
    return ctx;
  }

  if (ctx.method === 'delete') {
    ctx.result = db.remove(ctx.id);
    return ctx;
  }

  if (ctx.method === 'post') {
    if(ctx.id === 0) {
      ctx.result = db.add(ctx.entity);
    }
    else {
      ctx.result = db.save(ctx.entity);
    }
    return ctx;
  }
  ctx.statusCode = 405;
  ctx.result = {message: 'Method Not Allowed'};
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: persister.js');

