//---------------------------------------------------------------------------------
//- resolver
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var app = require('./app.js');
var resource = require('./resource.js');
var log = console.log;

function getId(tokens) {
  var id = fn.btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) {
    return { id: 0, rel: ''};
  }
  return { id: id, rel: ''};
}

function getIdAndRel(url) {
  var tokens = fn.getTokens(url);
  if(tokens.length === 2) {
    return {id: 0, rel: ''};
  }
  var idAndRel = getId(tokens);
  if(idAndRel.id !== 0) {
    return idAndRel;
  }
  tokens = fn.btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  }
  else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
}

function getTypeName(url) {
  var tokens = fn.getTokens(url);
  if (tokens.length > 1) {
    var typeName = tokens[1].slice(0, -1);
    return typeName.charAt(0).toUpperCase() + typeName.substring(1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

exports.resolve = function resolve(ctx) {
  var idAndRel = getIdAndRel(ctx.req.url);
  ctx.id = idAndRel.id;
  ctx.rel = idAndRel.rel;
  ctx.statusCode = 200;
  ctx.typeName = getTypeName(ctx.req.url);
  ctx.typeCtor = app[ctx.typeName];
  ctx.handler = resource[ctx.req.method.toLowerCase()];
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: resolver.js');

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

  //test: getTypeName(url):- api/apples/123456/create
  var url = '/api/apples/';
  var typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/';
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob('123456');
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');

  url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
  typeName = getTypeName(url);
  expect(typeName).to.be('Apple');
