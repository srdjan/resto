//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
var halson = require('halson');
var expect = require('expect.js');
var Request = require('./httpmock.js').Request;
var Response = require('./httpmock.js').Response;
var fn = require('../src/fn.js');
var db = require('../src/db.js');
var pipeline = require('../src/pipeline.js');
var resolver = require('../src/resolver.js').handle;
var toHal = require('../src/hal.js').toHal;
var log = console.log;

function getAll() {
  var reqGetAll = new Request('GET', '/api/apples/');
  var response = new Response();
  var ctx = { req: reqGetAll, resp: response };
  ctx = pipeline.go(ctx);
  all = halson(ctx.resp.body);
  return { data: all, statusCode: ctx.resp.statusCode };
}

function create(all) {
  var createLink = all.getLink('create');
  var reqCreate = new Request(createLink.method, createLink.href, {weight: 10.0, color: "red"});
  var response = new Response();
  var ctx = { req: reqCreate, resp: response };
  ctx = pipeline.go(ctx);
  var apple = halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.resp.statusCode };
}

function getSelf(resource) {
  var selfLink = resource.getLink('self');
  var reqSelf = new Request('GET', selfLink.href);
  var response = new Response();
  var ctx = { req: reqSelf, resp: response };
  ctx = pipeline.go(ctx);
  var apple = halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.statusCode };
}

function grow(apple) {
  var growLink = apple.getLink('grow');
  var reqGrow = new Request(growLink.method, growLink.href, { weightIncr: 230.0});
  var response = new Response();
  var ctx = { req: reqGrow, resp: response };
  ctx = pipeline.go(ctx);
  apple = halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.resp.statusCode };
}

function eat(apple) {
  var eatLink = apple.getLink('eat');
  var reqEat = new Request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  var response = new Response();
  var ctx = { req: reqEat, resp: response };
  ctx = pipeline.go(ctx);
  apple = typeof ctx.resp.body === 'undefined' ? {} : halson(ctx.resp.body);
  return { data: apple, statusCode: ctx.resp.statusCode };
}

function eatNotAllowed(apple) {
  var eatLink = apple.getLink('eat');
  var reqEat = new Request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  var response = new Response();
  var ctx = { req: reqEat, resp: response };
  ctx = pipeline.go(ctx);
  return { data: {}, statusCode: ctx.resp.statusCode };
}

function toss(apple) {
  var tossLink = apple.getLink('toss');
  var reqToss = new Request(tossLink.method, tossLink.href, {});
  var response = new Response();
  var ctx = { req: reqToss, resp: response };
  ctx = pipeline.go(ctx);
  apple = halson(ctx.resp.body);
  return { data: {}, statusCode: ctx.resp.statusCode };
}

//- prepare
db.clear();
pipeline.use(true, resolver);
pipeline.use(true, toHal);

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
  var self = getSelf(apple.data);
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

