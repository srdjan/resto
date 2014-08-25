//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
'use strict;'
var halson = require('halson');
var expect = require('expect.js');
var httpMock = require('./httpMock.js');
var fn = require('../src/fn.js');
var db = require('../src/db.js');
var app = require('../src/app.js');
var resolver = require('../src/resolver.js');
var log = console.log;

//- prepare
db.clear();

//-  test get all
  var reqGetAll = new httpMock.Request('GET', 'http://test.demo.com/api/apples/', {}, {}, app);
  var response = new httpMock.Response();
  resolver.handle(reqGetAll, response);
  var all = halson(response.body);
  expect(response.statusCode).to.be(200);
  expect(all.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.listLinkRels())).to.be(true);

//- test create
  var createLink = all.getLink('create');
  var reqCreate = new httpMock.Request(createLink.method, createLink.href, {}, {weight: 10.0, color: "red"}, app);
  var response = new httpMock.Response();
  resolver.handle(reqCreate, response);
  var apple = halson(response.body);
  expect(apple.listLinkRels().length).to.be(3);
  expect(apple.weight).to.be(10.0);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

  var response = new httpMock.Response();
  resolver.handle(reqGetAll, response);
  all = halson(response.body);
  var embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- test invariants
  var selfLink = apple.getLink('self');
  var reqSelf = new httpMock.Request('GET', selfLink.href, {}, {}, app);
  response = new httpMock.Response();
  resolver.handle(reqSelf, response);
  apple = halson(response.body);
  expect(apple.weight).to.be(10.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var growLink = apple.getLink('grow');
  var reqGrow = new httpMock.Request(growLink.method, growLink.href, {}, { weightIncr: 230.0}, app);
  response = new httpMock.Response();
  resolver.handle(reqGrow, response);
  apple = halson(response.body);
  expect(apple.weight).to.be(240.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('eat', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var eatLink = apple.getLink('eat');
  var reqEat = new httpMock.Request(eatLink.method, eatLink.href, {}, { weight: 0.0, color: 'orange'}, app);
  response = new httpMock.Response();
  resolver.handle(reqEat, response);
  apple = halson(response.body);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(2);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  response = new httpMock.Response();
  resolver.handle(reqGrow, response);
  expect(response.statusCode).to.be(409);

//- test GetAll - there shoudl be one apple left :)
  reqCreate.body = { color: 'brown', weight: 34.0 };
  var response = new httpMock.Response();
  resolver.handle(reqCreate, response);
  var apple = halson(response.body);

  var response = new httpMock.Response();
  resolver.handle(reqGetAll, response);
  all = halson(response.body);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(2);

// - call 'create' and toss' (delete) api
  response = new httpMock.Response();
  resolver.handle(reqSelf, response);
  apple = halson(response.body);
  var tossLink = apple.getLink('toss');
  var reqToss = new httpMock.Request(tossLink.method, tossLink.href, {}, { weight: 0.0, color: 'brown'}, app);
  response = new httpMock.Response();
  resolver.handle(reqToss, response);
  apple = halson(response.body);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

  var response = new httpMock.Response();
  resolver.handle(reqGetAll, response);
  all = halson(response.body);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- clean
db.clear();
