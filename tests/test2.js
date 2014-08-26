//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
'use strict;'
var halson = require('halson');
var expect = require('expect.js');
var Request = require('./httpmock.js').Request;
var Response = require('./httpmock.js').Response;
var fn = require('../src/fn.js');
var db = require('../src/db.js');
var resolver = require('../src/resolver.js');
var log = console.log;

//- prepare
db.clear();

//-  test get all
  var reqGetAll = new Request('GET', 'http://farm.com/api/apples/');
  var response = new Response();
  resolver.handle(reqGetAll, response);
  var all = halson(response.body);
  expect(response.statusCode).to.be(200);
  expect(all.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.listLinkRels())).to.be(true);

//- test create
  var createLink = all.getLink('create');
  var reqCreate = new Request(createLink.method, createLink.href, {weight: 10.0, color: "red"});
  var response = new Response();
  resolver.handle(reqCreate, response);
  var apple = halson(response.body);
  expect(apple.listLinkRels().length).to.be(3);
  expect(apple.weight).to.be(10.0);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

  var response = new Response();
  resolver.handle(reqGetAll, response);
  all = halson(response.body);
  var embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- test invariants
  var selfLink = apple.getLink('self');
  var reqSelf = new Request('GET', selfLink.href);
  response = new Response();
  resolver.handle(reqSelf, response);
  apple = halson(response.body);
  expect(apple.weight).to.be(10.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var growLink = apple.getLink('grow');
  var reqGrow = new Request(growLink.method, growLink.href, { weightIncr: 230.0});
  response = new Response();
  resolver.handle(reqGrow, response);
  apple = halson(response.body);
  expect(apple.weight).to.be(240.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('eat', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var eatLink = apple.getLink('eat');
  var reqEat = new Request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  response = new Response();
  resolver.handle(reqEat, response);
  apple = halson(response.body);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(2);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  response = new Response();
  resolver.handle(reqGrow, response);
  expect(response.statusCode).to.be(409);

//- test GetAll - there shoudl be one apple left :)
  reqCreate.body = { color: 'brown', weight: 34.0 };
  var response = new Response();
  resolver.handle(reqCreate, response);
  var apple = halson(response.body);

  var response = new Response();
  resolver.handle(reqGetAll, response);
  all = halson(response.body);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(2);

// - call 'create' and toss' (delete) api
  response = new Response();
  resolver.handle(reqSelf, response);
  apple = halson(response.body);
  var tossLink = apple.getLink('toss');
  var reqToss = new Request(tossLink.method, tossLink.href, { weight: 0.0, color: 'brown'});
  response = new Response();
  resolver.handle(reqToss, response);
  apple = halson(response.body);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

  var response = new Response();
  resolver.handle(reqGetAll, response);
  all = halson(response.body);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- clean
db.clear();
