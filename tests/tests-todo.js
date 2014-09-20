//---------------------------------------------------------------------------------
//- tests using todo model
//---------------------------------------------------------------------------------
var halson = require('halson');
var expect = require('expect.js');
var fn = require('../src/fn');
var db = require('../src/db');
var service = require('../src/service');
var authenticator = require('../src/authn').auth;
var authorizer = require('../src/authr').auth;
var resolver = require('../src/resolver').resolve;
var invoker = require('../src/invoker').invoke;
var converter = require('../src/hal').convert;

var activity = require('../examples/todo/resources/activity');
var apple = require('../examples/todo/resources/todo');
var log = console.log;

//- prepare
db.clear();

log('------ starting service --------');
service.expose(compose(activity, hasMany, todo)).on(httpServerMock.create())
              .use(authenticator, true)
              .use(resolver, true)
              .use(authorizer, true)
              .use(invoker, true)
              .use(converter, true)
              .start(8070);

log('------ running integration tests --------');
//-  test bad get all
  var all = get('bad');
  expect(all.statusCode).to.be(500);
  expect(all.data.Error).to.be('type resolver error');

//-  test get all - empty set
  var all = get('/api/apples/');
  expect(all.statusCode).to.be(200);
  expect(all.data.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.data.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.data.listLinkRels())).to.be(true);

//- test create apple 1
  var apple = cmd(all.data, 'create', {weight: 10.0, color: "red"});
  expect(apple.data.listLinkRels().length).to.be(3);
  expect(apple.data.weight).to.be(10.0);
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true);

//- test create apple 2
  var apple = cmd(all.data, 'create', {weight: 20.0, color: "green"});
  expect(apple.data.listLinkRels().length).to.be(3);
  expect(apple.data.weight).to.be(20.0);
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true);

//- test create apple 3 - full page size
  var apple = cmd(all.data, 'create', {weight: 20.0, color: "orange"});
  expect(apple.data.listLinkRels().length).to.be(3);
  expect(apple.data.weight).to.be(20.0);
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true);

//- test create apple 4 - page 2
  var apple = cmd(all.data, 'create', {weight: 20.0, color: "blue"});
  expect(apple.data.listLinkRels().length).to.be(3);
  expect(apple.data.weight).to.be(20.0);
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true);

//- test if create sucessful
  var self = get(apple.data.getLink('self').href);
  expect(self.data.weight).to.be(20.0);
  expect(self.data.listLinkRels().length).to.be(3);
  expect(fn.contains('self', self.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', self.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', self.data.listLinkRels())).to.be(true);

//-  test get all - 2 pages
  var all = get('/api/apples/');
  expect(all.statusCode).to.be(200);
  expect(all.data.listLinkRels().length).to.be(5);
  expect(fn.contains('create', all.data.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var appleGrown = cmd(self.data, 'grow', { weightIncr: 230.0});
  expect(appleGrown.data.weight).to.be(250.0);
  expect(appleGrown.data.listLinkRels().length).to.be(3);
  expect(fn.contains('self', appleGrown.data.listLinkRels())).to.be(true);
  expect(fn.contains('eat', appleGrown.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', appleGrown.data.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var appleEaten = cmd(appleGrown.data, 'eat', { weight: 0.0, color: 'orange'});
  expect(appleEaten.data.weight).to.be(0.0);
  expect(appleEaten.data.listLinkRels().length).to.be(2);
  expect(fn.contains('self', appleEaten.data.listLinkRels())).to.be(true);

// - test api whitelisting - should not be able to call 'grow' in this state
  var notAllowedResult = eatNotAllowed(appleGrown.data);
  expect(notAllowedResult.statusCode).to.be(405);

// - test get before toss
  var all = get('/api/apples/');
  // log(JSON.stringify(all.data));
  var embeds = all.data.getEmbeds('apples');
  expect(embeds.length).to.be(3);  //page 1

  //todo: get page 2 and a test that is has 1 embed

//- toos one of the apples
  result = cmd(appleEaten.data, 'toss', { });

//- test get after toss
  var all = get('/api/apples/');
  // log(JSON.stringify(all.data));
  var embeds = all.data.getEmbeds('apples');
  expect(embeds.length).to.be(3);
