//---------------------------------------------------------------------------------
//- tests using apple-farm model
//---------------------------------------------------------------------------------
const halson        = require('halson')
const expect        = require('expect.js')
const fn            = require('./lib/fn')
const db            = require('./lib/db')
const server        = require('./lib/test-server')
const pipeline      = require('./lib/pipeline')
const authenticator = require('./lib/authn').auth
const authorizer    = require('./lib/authr').auth
const resolver      = require('./lib/resolver').resolve
const invoker       = require('./lib/invoker').invoke
const converter     = require('./lib/hal').convert
const appleResource = require('./resources/apple')
const log           = console.log

//- prepare
db.clear()

log('------ configure pipeline --------')
const reqHandler = pipeline.expose(appleResource)
                      // .use(authenticator)
                      .use(resolver)
                      // .use(authorizer)
                      .use(invoker)//, true)
                      .use(converter)

const apiEndPoint = server.create(reqHandler)
const headers = {accept: 'application/hal+json'}

log('------ run Apple tests -----')
//-  test bad get all
var all = apiEndPoint.get('bad', headers)
expect(all.statusCode).to.be(500)
expect(all.data.Error).to.be('type resolver error')

//-  test get all - empty set
all = apiEndPoint.get('/api/apples/', headers)
expect(all.statusCode).to.be(200)
expect(all.data.listLinkRels().length).to.be(2)
expect(fn.contains('self', all.data.listLinkRels())).to.be(true)
expect(fn.contains('create', all.data.listLinkRels())).to.be(true)

//- test create apple 1
// var apple = apiEndPoint.cmd("POST", '/api/apples/', {weight: 10, color: "red"}, headers)

var link = all.data.getLink("create");
var apple = apiEndPoint.cmd(link.method, link.href, {weight: 10, color: "red"}, headers)
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(10)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 2
link = all.data.getLink("create");
apple = apiEndPoint.cmd(link.method, link.href, {weight: 20, color: "green"}, headers)
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 3 - full page size
link = all.data.getLink("create");
apple = apiEndPoint.cmd(link.method, link.href, {weight: 20, color: "orange"}, headers)
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 4 - page 2
link = all.data.getLink("create");
apple = apiEndPoint.cmd(link.method, link.href, {weight: 20, color: "blue"}, headers)
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test if create sucessful
var self = apiEndPoint.get(apple.data.getLink('self').href, headers)
expect(self.data.weight).to.be(20)
expect(self.data.listLinkRels().length).to.be(3)
expect(fn.contains('self', self.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', self.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', self.data.listLinkRels())).to.be(true)

//-  test get all - 2 pages
all = apiEndPoint.get('/api/apples/', headers)
expect(all.statusCode).to.be(200)
expect(all.data.listLinkRels().length).to.be(5)
expect(fn.contains('create', all.data.listLinkRels())).to.be(true)

//- call 'grow' api (post - with id and propertis that don't exist on entity)
link = self.data.getLink("grow");
var appleGrown = apiEndPoint.cmd(link.method, link.href, { weightIncr: 230}, headers)
expect(appleGrown.data.weight).to.be(250)
expect(appleGrown.data.listLinkRels().length).to.be(3)
expect(fn.contains('self', appleGrown.data.listLinkRels())).to.be(true)
expect(fn.contains('eat', appleGrown.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', appleGrown.data.listLinkRels())).to.be(true)

//- call 'eat' api (full put)
link = appleGrown.data.getLink("eat");
var appleEaten = apiEndPoint.cmd(link.method, link.href, { weight: 0, color: 'orange'}, headers)
expect(appleEaten.data.weight).to.be(0)
expect(appleEaten.data.listLinkRels().length).to.be(2)
expect(fn.contains('self', appleEaten.data.listLinkRels())).to.be(true)

// - test api whitelisting - should not be able to call 'grow' in this state
link = appleGrown.data.getLink("eat");
var notAllowedResult = apiEndPoint.cmd(link.method, link.href, { weight: 0, color: 'orange'}, headers)
expect(notAllowedResult.statusCode).to.be(405)

// - test get before toss
all = apiEndPoint.get('/api/apples/', headers)
// log(JSON.stringify(all.data))
var embeds = all.data.getEmbeds('apples')
expect(embeds.length).to.be(3)  //page 1

//todo: get page 2 and a test that is has 1 embed

//- toss one of the apples
link = appleEaten.data.getLink("toss");
var result = apiEndPoint.cmd(link.method, link.href, { }, headers)

//- test get after toss
all = apiEndPoint.get('/api/apples/', headers)
// log(JSON.stringify(all.data))
embeds = all.data.getEmbeds('apples')
expect(embeds.length).to.be(3)

//- cleanup after
db.clear()
