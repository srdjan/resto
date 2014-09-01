//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
var halson = require('halson');
var expect = require('expect.js');
var http = require('./httpmock.js');
var fn = require('../src/fn.js');
var db = require('../src/db.js');
var pipeline = require('../src/pipeline.js');
var auth = require('../src/auth.js').auth;
var resolve = require('../src/resolver.js').resolve;
var query = require('../src/db-query.js').query;
var persist = require('../src/db-cmd.js').persist;
var invoke = require('../src/invoker.js').invoke;
var convert = require('../src/hal.js').convert;
var log = console.log;

function getAll() {
  var reqGetAll = new http.request('GET', '/api/apples/');
  var response = new http.response();
  var ctx = { req: reqGetAll, resp: response };
  ctx = pipeline.run(ctx);
  all = halson(ctx.resp.body);
  return { data: all, statusCode: ctx.resp.statusCode };
}

function create(all) {
  var createLink = all.getLink('create');
  var reqCreate = new http.request(createLink.method, createLink.href, {weight: 10.0, color: "red"});
  var response = new http.response();
  var ctx = { req: reqCreate, resp: response };
  ctx = pipeline.run(ctx);
  var apple = halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.resp.statusCode };
}

function self(resource) {
  var selfLink = resource.getLink('self');
  var reqSelf = new http.request('GET', selfLink.href);
  var response = new http.response();
  var ctx = { req: reqSelf, resp: response };
  ctx = pipeline.run(ctx);
  var apple = halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.statusCode };
}

function grow(apple) {
  var growLink = apple.getLink('grow');
  var reqGrow = new http.request(growLink.method, growLink.href, { weightIncr: 230.0});
  var response = new http.response();
  var ctx = { req: reqGrow, resp: response };
  ctx = pipeline.run(ctx);
  apple = halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.resp.statusCode };
}

function eat(apple) {
  var eatLink = apple.getLink('eat');
  var reqEat = new http.request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  var response = new http.response();
  var ctx = { req: reqEat, resp: response };
  ctx = pipeline.run(ctx);
  apple = typeof ctx.resp.body === 'undefined' ? {} : halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.resp.statusCode };
}

function eatNotAllowed(apple) {
  var eatLink = apple.getLink('eat');
  var reqEat = new http.request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  var response = new http.response();
  var ctx = { req: reqEat, resp: response };
  ctx = pipeline.run(ctx);
  return { data: {}, statusCode: ctx.resp.statusCode };
}

function toss(apple) {
  var tossLink = apple.getLink('toss');
  var reqToss = new http.request(tossLink.method, tossLink.href, {});
  var response = new http.response();
  var ctx = { req: reqToss, resp: response };
  ctx = pipeline.run(ctx);
  apple = halson(ctx.resp.body);
  return { data: {}, statusCode: ctx.resp.statusCode };
}

//- prepare
db.clear();
pipeline.use(auth);
pipeline.use(resolve);
pipeline.use(query);
pipeline.use(invoke);
pipeline.use(persist);
pipeline.use(convert);

//-  test get all
  var all = getAll();
  expect(all.statusCode).to.be(200);
  expect(all.data.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.data.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.data.listLinkRels())).to.be(true);

// //- test create
  var apple = create(all.data);
  expect(apple.data.listLinkRels().length).to.be(3);
  expect(apple.data.weight).to.be(10.0);
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true);

//- test if create sucessful
  var self = self(apple.data);
  expect(self.data.weight).to.be(10.0);
  expect(self.data.listLinkRels().length).to.be(3);
  expect(fn.contains('self', self.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', self.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', self.data.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var appleGrown = grow(self.data);
  expect(appleGrown.data.weight).to.be(240.0);
  expect(appleGrown.data.listLinkRels().length).to.be(3);
  expect(fn.contains('self', appleGrown.data.listLinkRels())).to.be(true);
  expect(fn.contains('eat', appleGrown.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', appleGrown.data.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var appleEaten = eat(appleGrown.data);
  expect(appleEaten.data.weight).to.be(0.0);
  expect(appleEaten.data.listLinkRels().length).to.be(2);
  expect(fn.contains('self', appleEaten.data.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  var notAllowedResult = eatNotAllowed(appleGrown.data);
  expect(notAllowedResult.statusCode).to.be(404);

//- test getAll before toss
  var all = getAll();
  var embeds = all.data.getEmbeds('apples');
  expect(embeds.length).to.be(1);

  result = toss(appleEaten.data);

//- test getAll after toss
  var all = getAll();
  var embeds = all.data.getEmbeds('apples');
  expect(embeds.length).to.be(0);

