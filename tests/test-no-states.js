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
  var reqGetAll = new Request('GET', '/api/todos/');
  var response = new Response();
  var ctx = { req: reqGetAll, resp: response };
  pipeline(ctx);
  var all = halson(ctx.resp.body);
  expect(ctx.resp.statusCode).to.be(200);
  expect(all.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.listLinkRels())).to.be(true);

//- test create
  var reqCreate = new Request('POST', '/api/todos/', { content: 'buy milk', status: "red"} );
  response = new Response();
  ctx = { req: reqCreate, resp: response };
  pipeline(ctx);
  var todo = halson(ctx.resp.body);
  expect(todo.listLinkRels().length).to.be(5);
  expect(todo.status).to.be('red');
  expect(fn.contains('self', todo.listLinkRels())).to.be(true);
  expect(fn.contains('post', todo.listLinkRels())).to.be(true);
  expect(fn.contains('put', todo.listLinkRels())).to.be(true);
  expect(fn.contains('patch', todo.listLinkRels())).to.be(true);
  expect(fn.contains('delete', todo.listLinkRels())).to.be(true);

  var response = new Response();
  ctx = { req: reqGetAll, resp: response };
  pipeline(ctx);
  all = halson(ctx.resp.body);
  var embeds = all.getEmbeds('todos');
  expect(embeds.length).to.be(1);

//- test get by id
  var selfLink = todo.getLink('self');
  var reqSelf = new Request('GET', selfLink.href);
  response = new Response();
  ctx = { req: reqSelf, resp: response };
  pipeline(ctx);
  todo = halson(ctx.resp.body);
  expect(todo.listLinkRels().length).to.be(5);
  expect(todo.status).to.be('red');
  expect(fn.contains('self', todo.listLinkRels())).to.be(true);
  expect(fn.contains('post', todo.listLinkRels())).to.be(true);
  expect(fn.contains('put', todo.listLinkRels())).to.be(true);
  expect(fn.contains('patch', todo.listLinkRels())).to.be(true);
  expect(fn.contains('delete', todo.listLinkRels())).to.be(true);

//- call put api
  var eatLink = todo.getLink('put');
  var reqEat = new Request(eatLink.method, eatLink.href, { content: 'milk and jogurt', status: 'green'});
  response = new Response();
  ctx = { req: reqEat, resp: response };
  pipeline(ctx);
  todo = halson(ctx.resp.body);
  expect(todo.status).to.be('green');
  expect(todo.listLinkRels().length).to.be(5);
  expect(fn.contains('self', todo.listLinkRels())).to.be(true);

// - call 'create' and toss' (delete) api
  response = new Response();
  ctx = { req: reqSelf, resp: response };
  pipeline(ctx);
  todo = halson(ctx.resp.body);
  var delLink = todo.getLink('delete');
  var reqDel = new Request(delLink.method, delLink.href, { });
  response = new Response();
  ctx = { req: reqDel, resp: response };
  pipeline(ctx);
  todo = halson(ctx.resp.body);
  expect(fn.contains('self', todo.listLinkRels())).to.be(true);

//- clean
db.clear();
