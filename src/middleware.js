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
  var body = '';
  // if (ctx.req.withBody && (ctx.req.body === 'undefined' || Object.keys(ctx.req.body).length === 0)) {
  if (ctx.req.withBody) {
    // if(typeof ctx.req.body === 'undefined') {
      ctx.req.on('data', function(chunk) { body += chunk.toString(); });
      ctx.req.on('end', function() {
        ctx.req.body = JSON.parse(body);
        log('body parsed!')
        return ctx;
      });
    // }
  }
  return ctx;
};

function readBody(ctx) {
  return ctx;
};

exports.pipeline = fn.compose(resolver.handle, getApiType);
