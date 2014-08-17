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
var req = {
  method: 'get',
  url: 'http//demo.com/api/apples/',
  body: {}
};
var all = handle(app, req);
var selfPath = all.getLink('self')['href'];
var createPath = all.getLink('create')['href'];
req = {
  method: 'post',
  url: createPath,
  body: {
    color: 'red',
    weight: 0.1
  }
};
var apple = handle(app, req);

expect(apple.listLinkRels().length).to.be(3);
expect(apple.weight).to.be(0.1);
expect(R.contains('self', apple.listLinkRels())).to.be(true);
expect(R.contains('grow', apple.listLinkRels())).to.be(true);
expect(R.contains('toss', apple.listLinkRels())).to.be(true);

// //- test invariants
var selfPath = apple.getLink('self')['href'];
req = {
  method: 'get',
  url: selfPath,
  body: {}
};
apple = handle(app, req);
expect(apple.weight).to.be(0.1);
expect(apple.listLinkRels().length).to.be(3);
expect(R.contains('self', apple.listLinkRels())).to.be(true);
expect(R.contains('grow', apple.listLinkRels())).to.be(true);
expect(R.contains('toss', apple.listLinkRels())).to.be(true);

// //- call 'grow' api
var growPath = apple.getLink('grow')['href'];
req = {
  method: 'put',
  url: growPath,
  body: {
    color: 'red',
    weight: 300.0
  }
};
apple = handle(app, req);

expect(apple.weight).to.be(300);
expect(apple.listLinkRels().length).to.be(3);
expect(R.contains('self', apple.listLinkRels())).to.be(true);
expect(R.contains('eat', apple.listLinkRels())).to.be(true);
expect(R.contains('toss', apple.listLinkRels())).to.be(true);

// //- call 'eat' api
var eatPath = apple.getLink('eat')['href'];
req = {
  method: 'put',
  url: eatPath,
  body: {
    color: 'red',
    weight: 0.0
  }
};
handle(app, req);
req = {
  method: 'get',
  url: selfPath,
  body: {}
};
apple = handle(app, req);

expect(apple.weight).to.be(0.0);
expect(apple.listLinkRels().length).to.be(1);
expect(R.contains('self', apple.listLinkRels())).to.be(true);
expect(R.contains('grow', apple.listLinkRels())).to.be(false);
expect(R.contains('eat', apple.listLinkRels())).to.be(false);
expect(R.contains('toss', apple.listLinkRels())).to.be(false);

// //- test api whitelisting - should not be able to call 'grow' in tis state
req = {
  method: 'put',
  url: growPath,
  body: {
    color: 'red',
    weight: 300.0
  }
};
apple = handle(app, req);
expect(apple).to.have.property('statusCode');
expect(apple.statusCode).to.be(409);

// //- test GetAll
req = {
  method: 'post',
  url: createPath,
  body: {
    color: 'yellow',
    weight: 0.1
  }
};
apple = handle(app, req);

req = {
  method: 'get',
  url: 'http://demo.com/api/apples/',
  body: {}
};
all = handle(app, req);
var embeds = all.getEmbeds('apples');
expect(embeds.length).to.be(2);

//- clean
clearStorage();
