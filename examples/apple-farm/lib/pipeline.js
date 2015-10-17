//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
'use strict';

var urlParser = require('url');
var fn = require('./fn');
var db = require('./db');
var log = console.log;

db.init('../../../datastore');
db.clear();

function writeToResp(response, ctx) {
  var contentType = ctx.hal ? { "Content-Type": "application/hal+json" } : { "Content-Type": "application/json" };
  response.writeHead(ctx.statusCode, contentType);
  response.write(JSON.stringify(ctx.result));
  response.end();
}

function getId(tokens) {
  var id = fn.btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) {
    return { id: 0, rel: '' };
  }
  return { id: id, rel: '' };
}

function getIdAndRel(url) {
  var tokens = fn.getTokens(url);
  if (tokens.length === 2) {
    return { id: 0, rel: '' };
  }
  var idAndRel = getId(tokens);
  if (idAndRel.id !== 0) {
    return idAndRel;
  }
  tokens = fn.btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  } else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
}

var handlers = [];
exports.use = function (f, t) {
  handlers.push({ func: f, trace: t || false });
  return this;
};

var appModel = undefined;
exports.expose = function (model) {
  appModel = model;
  return this;
};

function extractId(ctx, request) {
  var idAndRel = getIdAndRel(request.url);
  ctx.id = idAndRel.id;
  return ctx;
}

function extractIdAndRel(ctx, request) {
  var idAndRel = getIdAndRel(request.url);
  ctx.id = idAndRel.id;
  ctx.rel = idAndRel.rel;
  return ctx;
}

exports.process = function (request, response) {
  var ctx = { hal: false, statusCode: 200, result: {} };

  try {
    if (request.headers['accept'].indexOf('application/hal+json') > -1) {
      ctx.hal = true;
      ctx = extractIdAndRel(ctx, request);
    }

    ctx.method = request.method.toLowerCase();
    ctx.body = request.body;
    var urlParts = urlParser.parse(request.url, true, true);
    ctx.url = urlParts.pathname;
    ctx.pageNumber = urlParts.query.hasOwnProperty('page') ? urlParts.query.page : 0;
    ctx.model = appModel;
    ctx = fn.runAll(handlers, function (d) {
      return d.statusCode !== 200;
    }, ctx);
  } catch (e) {
    ctx.statusCode = 500;
    if (e.hasOwnProperty('statusCode')) {
      ctx.statusCode = e.statusCode;
    }

    ctx.result = 'Fx Exception, statusCode: ' + ctx.statusCode;
    if (e.hasOwnProperty('message')) {
      ctx.result += ', Message: ' + e.message;
    }
  } finally {
    writeToResp(response, ctx);
  }
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: pipeline.js');

//test: getTokens(url):- api/apples/
var url = '/api/apples/';
var tokens = fn.getTokens(url);
expect(tokens.length).to.be(2);

//test: getId(tokens):- api/apples
var idAndRel = getId(tokens);
expect(idAndRel.id).to.be(0);

//test: getTokens(url):- api/apples/123456
url = 'api/apples/' + fn.atob('123456');
tokens = fn.getTokens(url);
expect(tokens.length).to.be(3);

//test: getId(tokens):- api/apples || api/apples/abc3b4=1
idAndRel = getId(tokens);
expect(idAndRel.id).to.be('123456');

//test: getIdAndRel(url):- api/apples/
url = 'api/apples/';
idAndRel = getIdAndRel(url);
expect(idAndRel.id).to.be(0);
expect(idAndRel.rel).to.be('');

//test: getTokens(url):- api/apples/123456
url = 'api/apples/' + fn.atob('123456');
idAndRel = getIdAndRel(url);
expect(idAndRel.id).to.be('123456');
expect(idAndRel.rel).to.be('');

//test: getIdAndRel(url):- api/apples/123456/create
url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
idAndRel = getIdAndRel(url);
expect(idAndRel.id).to.be('123456');
expect(idAndRel.rel).to.be('create');