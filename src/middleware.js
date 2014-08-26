//---------------------------------------------------------------------------------
//- middleware
//---------------------------------------------------------------------------------
'use strict;'
var http = require("http");
var fn = require('./fn.js');
var resolver = require('./resolver.js');
var log = console.log;

function getApiType(ctx) {
  ctx.req.withBody = false;
  if (ctx.req.method === 'POST' || ctx.req.method === 'PUT' || ctx.req.method === 'PATCH') {
    ctx.req.withBody = true;
  }
  return ctx;
};

function readBodyStream(ctx) {
  if (ctx.req.withBody) {
    if(Object.keys(ctx.req.body).length === 0) {
      var body = '';
      ctx.req.on('data', function(chunk) { body += chunk.toString(); });
      ctx.req.on('end', function() { ctx.req.body = JSON.parse(body); });
    }
  }
  return ctx;
};

function writeResponse(ctx) {
  ctx.resp.writeHead(ctx.statusCode, {"Content-Type": "application/json"});
  log(typeof ctx.result);
  ctx.resp.write(ctx.result);
  ctx.resp.end();
  return ctx;
}

exports.pipeline = fn.compose(resolver.handle, readBodyStream, getApiType);
