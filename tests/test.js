//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
'use strict;'
var expect = require('expect.js');
var fn = require('../src/fn.js');
var fx = require('../src/fx.js');
var app = require('../src/app.js');
var log = console.log;

//- prepare
fx.clearDb();

//-  test get all
  var reqGetAll = { method: 'GET', url: 'http://test.demo.com/api/apples/', body: {}};
  var all = fx.handle(app, reqGetAll);
  var createLink = all.getLink('create');
  var reqCreate = { method: createLink.method, url: createLink.href, body: { color: 'red', weight: 10.0 }};
  var apple = fx.handle(app, reqCreate);
  expect(apple.listLinkRels().length).to.be(3);
  expect(apple.weight).to.be(10.0);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

  all = fx.handle(app, reqGetAll);
  var embeds = all.getEmbeds('apples');
  log(JSON.stringify(embeds));
  expect(embeds.length).to.be(1);

//- test invariants
  var selfLink = apple.getLink('self');
  var reqGetSelf = { method: 'GET', url: selfLink.href, body: {}};
  apple = fx.handle(app, reqGetSelf);
  expect(apple.weight).to.be(10.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var growLink = apple.getLink('grow');
  var reqGrow = { method: growLink.method, url: growLink.href, body: { weightIncr: 230.0 }};
  apple = fx.handle(app, reqGrow);
  expect(apple.weight).to.be(240.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('eat', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var eatLink = apple.getLink('eat');
  var reqEat = { method: eatLink.method, url: eatLink.href, body: { weight: 0.0, color: 'orange' }};
  apple = fx.handle(app, reqEat);
  apple = fx.handle(app, reqGetSelf);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(1);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  apple = fx.handle(app, reqGrow);
  expect(apple).to.have.property('statusCode');
  expect(apple.statusCode).to.be(409);

//- call 'create' and toss' (delete) api
  reqCreate = { method: createLink.method, url: createLink.href, body: { color: 'brown', weight: 34.0 }};
  apple = fx.handle(app, reqCreate);
  var tossLink = apple.getLink('toss');
  var reqToss = { method: tossLink.method, url: tossLink.href, body: { color: 'brown', weight: 0.0 }};
  apple = fx.handle(app, reqToss);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

// //- test GetAll - there shoudl be one apple left :)
  all = fx.handle(app, reqGetAll);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- clean
fx.clearDb();
