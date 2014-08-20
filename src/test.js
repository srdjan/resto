//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
'use strict;'
var expect = require('expect.js');
var fn = require('./fn.js');
var fx = require('./fx.js');
var app = require('./app.js');
var log = console.log;

//- prepare
fx.clearDb();

//-  test get all
  var reqGetAll = { method: 'get', url: 'http://test.demo.com/api/apples/', body: {}};
  var all = fx.handle(app, reqGetAll);
  var createPath = all.getLink('create')['href'];
  var reqCreate = { method: 'post', url: createPath, body: { color: 'red', weight: 10.0 }};
  var apple = fx.handle(app, reqCreate);
  expect(apple.listLinkRels().length).to.be(3);
  expect(apple.weight).to.be(10.0);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

  all = fx.handle(app, reqGetAll);
  var embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- test invariants
  var selfPath = apple.getLink('self')['href'];
  var reqGetSelf = { method: 'get', url: selfPath, body: {}};
  apple = fx.handle(app, reqGetSelf);
  expect(apple.weight).to.be(10.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var growPath = apple.getLink('grow')['href'];
  var reqGrow = { method: 'post', url: growPath, body: { weightIncr: 230.0 }};
  apple = fx.handle(app, reqGrow);
  expect(apple.weight).to.be(240.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('eat', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'eat' api (partial post)
  var eatPath = apple.getLink('eat')['href'];
  var reqEat = { method: 'post', url: eatPath, body: { weightDecr: 240.0 }};
  fx.handle(app, reqEat);
  apple = fx.handle(app, reqGetSelf);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(1);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  apple = fx.handle(app, reqGrow);
  expect(apple).to.have.property('statusCode');
  expect(apple.statusCode).to.be(409);

//- call 'toss' (full put) api
  reqCreate = { method: 'post', url: createPath, body: { color: 'brown', weight: 34.0 }};
  apple = fx.handle(app, reqCreate);
  var tossPath = apple.getLink('toss')['href'];
  var reqToss = { method: 'put', url: tossPath, body: { color: 'brown', weight: 0.0 }};
  apple = fx.handle(app, reqToss);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(1);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

// //- test GetAll
  reqCreate = { method: 'post', url: createPath, body: { color: 'green', weight: 10.0 }};
  apple = fx.handle(app, reqCreate);

  all = fx.handle(app, reqGetAll);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(3);

//- clean
fx.clearDb();
