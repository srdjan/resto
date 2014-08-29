//---------------------------------------------------------------------------------
//- tests
//---------------------------------------------------------------------------------
var halson = require('halson');
var expect = require('expect.js');
var Request = require('./httpmock.js').Request;
var Response = require('./httpmock.js').Response;
var fn = require('../src/fn.js');
var db = require('../src/db.js');
var pipeline = require('../src/pipeline.js').pipeline;
var log = console.log;

//- prepare
db.clear();

//-  test get all
  var reqGetAll = new Request('GET', '/api/apples/');
  var response = new Response();
  var ctx = { req: reqGetAll, resp: response };
  pipeline(ctx);
  var all = halson(ctx.resp.body);
  expect(ctx.resp.statusCode).to.be(200);
  expect(all.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.listLinkRels())).to.be(true);

//- test create
  var createLink = all.getLink('create');
  var reqCreate = new Request(createLink.method, createLink.href, {weight: 10.0, color: "red"});
  var response = new Response();
  ctx = { req: reqCreate, resp: response };
  pipeline(ctx);
  var apple = halson(ctx.resp.body);
  expect(apple.listLinkRels().length).to.be(3);
  expect(apple.weight).to.be(10.0);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

  var response = new Response();
  ctx = { req: reqGetAll, resp: response };
  pipeline(ctx);
  all = halson(ctx.resp.body);
  var embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- test invariants
  var selfLink = apple.getLink('self');
  var reqSelf = new Request('GET', selfLink.href);
  response = new Response();
  ctx = { req: reqSelf, resp: response };
  pipeline(ctx);
  apple = halson(ctx.resp.body);
  expect(apple.weight).to.be(10.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var growLink = apple.getLink('grow');
  var reqGrow = new Request(growLink.method, growLink.href, { weightIncr: 230.0});
  response = new Response();
  ctx = { req: reqGrow, resp: response };
  pipeline(ctx);
  apple = halson(ctx.resp.body);
  expect(apple.weight).to.be(240.0);
  expect(apple.listLinkRels().length).to.be(3);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);
  expect(fn.contains('eat', apple.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var eatLink = apple.getLink('eat');
  var reqEat = new Request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  response = new Response();
  ctx = { req: reqEat, resp: response };
  pipeline(ctx);
  apple = halson(ctx.resp.body);
  expect(apple.weight).to.be(0.0);
  expect(apple.listLinkRels().length).to.be(2);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  response = new Response();
  ctx = { req: reqEat, resp: response };
  pipeline(ctx);
  expect(ctx.resp.statusCode).to.be(404);

//- test GetAll - there shoudl be one apple left :)
  reqCreate.body = { color: 'brown', weight: 34.0 };
  var response = new Response();
  ctx = { req: reqCreate, resp: response };
  pipeline(ctx);
  var apple = halson(ctx.resp.body);

  var response = new Response();
  ctx = { req: reqGetAll, resp: response };
  pipeline(ctx);
  all = halson(ctx.resp.body);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(2);

// - call 'create' and toss' (delete) api
  response = new Response();
  ctx = { req: reqSelf, resp: response };
  pipeline(ctx);
  apple = halson(ctx.resp.body);
  var tossLink = apple.getLink('toss');
  var reqToss = new Request(tossLink.method, tossLink.href, { weight: 0.0, color: 'brown'});
  response = new Response();
  ctx = { req: reqToss, resp: response };
  pipeline(ctx);
  apple = halson(ctx.resp.body);
  expect(fn.contains('self', apple.listLinkRels())).to.be(true);

  var response = new Response();
  ctx = { req: reqGetAll, resp: response };
  pipeline(ctx);
  all = halson(ctx.resp.body);
  embeds = all.getEmbeds('apples');
  expect(embeds.length).to.be(1);

//- clean
db.clear();
log('passed!');
