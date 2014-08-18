//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
'use strict;'
var R = require('ramda');
var expect = require('expect.js');
var fx = require('./fx.js');
var app = require('./app.js');
var log = fx.log;
var clearStorage = fx.clearStorage;
var handle = fx.handle;

//- prepare
clearStorage();

//-  test get all
var reqGetAll = { method: 'get', url: 'http://test.demo.com/api/apples/', body: {}};
var all = handle(app, reqGetAll);
var createPath = all.getLink('create')['href'];
var reqCreate = { method: 'post', url: createPath, body: { color: 'red', weight: 10.1 }};
var apple = handle(app, reqCreate);
  expect(apple.listLinkRels().length).to.be(3);
  expect(apple.weight).to.be(10.1);
  expect(R.contains('self', apple.listLinkRels())).to.be(true);
  expect(R.contains('grow', apple.listLinkRels())).to.be(true);
  expect(R.contains('toss', apple.listLinkRels())).to.be(true);

//- test invariants
var selfPath = apple.getLink('self')['href'];
var reqGetSelf = { method: 'get', url: selfPath, body: {}};
apple = handle(app, reqGetSelf);
  expect(apple.weight).to.be(10.1);
  expect(apple.listLinkRels().length).to.be(3);
  expect(R.contains('self', apple.listLinkRels())).to.be(true);
  expect(R.contains('grow', apple.listLinkRels())).to.be(true);
  expect(R.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'grow' api
var growPath = apple.getLink('grow')['href'];
var reqGrow = { method: 'put', url: growPath, body: { color: 'red', weight: 290.0 }};
apple = handle(app, reqGrow);
  expect(apple.weight).to.be(290.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(R.contains('self', apple.listLinkRels())).to.be(true);
  expect(R.contains('eat', apple.listLinkRels())).to.be(true);
  expect(R.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'eat' api
var eatPath = apple.getLink('eat')['href'];
var reqEat = { method: 'put', url: eatPath, body: { color: 'none', weight: 0.0 }};
handle(app, reqEat);
apple = handle(app, reqGetSelf);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(1);
  expect(R.contains('self', apple.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
apple = handle(app, reqGrow);
  expect(apple).to.have.property('statusCode');
  expect(apple.statusCode).to.be(409);

// //- test GetAll
apple = handle(app, reqCreate);
apple = handle(app, reqCreate);
apple = handle(app, reqCreate);

all = handle(app, reqGetAll);
var embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(4);

//- clean
clearStorage();
