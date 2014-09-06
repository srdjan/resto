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
var query = require('../src/resource.js').get;
var persist = require('../src/persister.js').persist;
var convert = require('../src/hal.js').convert;
var log = console.log;

function get(path) {
  var request = new http.request('GET', path);
  var response = new http.response();
  pipeline.run(request, response);
  var result = halson(response.body);
  return { data: result, statusCode: response.statusCode };
}

function cmd(resource, rel, newResource) {
  var link = resource.getLink(rel);
  var request = new http.request(link.method, link.href, newResource);
  var response = new http.response();
  pipeline.run(request, response);
  apple = halson(response.body);
  return { data: apple, statusCode: response.statusCode };
}

function eatNotAllowed(apple) {
  var eatLink = apple.getLink('eat');
  var request = new http.request(eatLink.method, eatLink.href, { weight: 0.0, color: 'orange'});
  var response = new http.response();
  pipeline.run(request, response);
  return { data: {}, statusCode: response.statusCode };
}

//- prepare
db.clear();
pipeline.use(auth);
pipeline.use(resolve);
pipeline.use(persist);
pipeline.use(convert);

//-  test get all
  var all = get('/api/apples/');
  expect(all.statusCode).to.be(200);
  expect(all.data.listLinkRels().length).to.be(2);
  expect(fn.contains('self', all.data.listLinkRels())).to.be(true);
  expect(fn.contains('create', all.data.listLinkRels())).to.be(true);

//- test create
  var apple = cmd(all.data, 'create', {weight: 10.0, color: "red"});
  expect(apple.data.listLinkRels().length).to.be(3);
  expect(apple.data.weight).to.be(10.0);
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true);

//- test if create sucessful
  var self = get(apple.data.getLink('self').href);
  expect(self.data.weight).to.be(10.0);
  expect(self.data.listLinkRels().length).to.be(3);
  expect(fn.contains('self', self.data.listLinkRels())).to.be(true);
  expect(fn.contains('grow', self.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', self.data.listLinkRels())).to.be(true);

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var appleGrown = cmd(self.data, 'grow', { weightIncr: 230.0});
  expect(appleGrown.data.weight).to.be(240.0);
  expect(appleGrown.data.listLinkRels().length).to.be(3);
  expect(fn.contains('self', appleGrown.data.listLinkRels())).to.be(true);
  expect(fn.contains('eat', appleGrown.data.listLinkRels())).to.be(true);
  expect(fn.contains('toss', appleGrown.data.listLinkRels())).to.be(true);

//- call 'eat' api (full put)
  var appleEaten = cmd(appleGrown.data, 'eat', { weight: 0.0, color: 'orange'});
  expect(appleEaten.data.weight).to.be(0.0);
  expect(appleEaten.data.listLinkRels().length).to.be(2);
  expect(fn.contains('self', appleEaten.data.listLinkRels())).to.be(true);

//- test api whitelisting - should not be able to call 'grow' in tis state
  var notAllowedResult = eatNotAllowed(appleGrown.data);
  expect(notAllowedResult.statusCode).to.be(405);

//- test get before toss
  var all = get('/api/apples/');
  var embeds = all.data.getEmbeds('apples');
  expect(embeds.length).to.be(1);

  result = cmd(appleEaten.data, 'toss', { });

//- test get after toss
  var all = get('/api/apples/');
  var embeds = all.data.getEmbeds('apples');
  expect(embeds.length).to.be(0);

