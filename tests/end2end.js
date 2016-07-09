"use strict"

const expect   = require('expect.js')
const fn       = require('../src/core/fn.js')
const db       = require('../src/core/db')
const Pipeline = require('../src/pipeline')
const authn    = require('../src/authn')
const authr    = require('../src/authr')
const resolver = require('../src/resolver')
const invoker  = require('../src/invoker')
const hal      = require('../src/hal')

const Apple    = require('./apple')
const server   = require('./http-mock')
const log      = console.log

//- prepare
db.clear()

log('------ configure pipeline --------')
const pipeline = Pipeline.expose(Apple)
                      .use(authn.func)
                      .use(resolver.func)
                      .use(authr.func)
                      .use(invoker.func)//, true)
                      .use(hal.func)

const apiEndPoint = server.createEndPoint(pipeline)
const headers = {accept: 'application/hal+json'}

log('------ Run Apple tests -----')
//-  test bad get all
var all = apiEndPoint.GET('bad', headers)
expect(all.statusCode).to.be(500)
expect(all.data.Error).to.be('type resolver error')

//-  test get all - empty set
all = apiEndPoint.GET('/api/apples/', headers)
expect(all.statusCode).to.be(200)
expect(all.data.listLinkRels().length).to.be(2)
expect(fn.contains('self', all.data.listLinkRels())).to.be(true)
expect(fn.contains('create', all.data.listLinkRels())).to.be(true)

//- test create apple 1
var link = all.data.getLink("create");
var apple = apiEndPoint[link.method](link.href, headers, {weight: 10, color: "red"})
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(10)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 2
link = all.data.getLink("create");
apple = apiEndPoint[link.method](link.href, headers, {weight: 20, color: "green"})
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 3 - full page size
link = all.data.getLink("create");
apple = apiEndPoint[link.method](link.href, headers, {weight: 20, color: "orange"})
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 4 - page 2
link = all.data.getLink("create");
apple = apiEndPoint[link.method](link.href, headers, {weight: 20, color: "blue"})
expect(apple.data.listLinkRels().length).to.be(3)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test if create sucessful
var self = apiEndPoint.GET(apple.data.getLink('self').href, headers)
expect(self.data.weight).to.be(20)
expect(self.data.listLinkRels().length).to.be(3)
expect(fn.contains('self', self.data.listLinkRels())).to.be(true)
expect(fn.contains('grow', self.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', self.data.listLinkRels())).to.be(true)

//-  test get all - 2 pages
all = apiEndPoint.GET('/api/apples/', headers)
expect(all.statusCode).to.be(200)
expect(all.data.listLinkRels().length).to.be(5)
expect(fn.contains('create', all.data.listLinkRels())).to.be(true)

//- call 'grow' api (post - with id and propertis that don't exist on entity)
link = self.data.getLink("grow");
var appleGrown = apiEndPoint[link.method](link.href, headers, { weightIncr: 230})
expect(appleGrown.data.weight).to.be(250)
expect(appleGrown.data.listLinkRels().length).to.be(3)
expect(fn.contains('self', appleGrown.data.listLinkRels())).to.be(true)
expect(fn.contains('eat', appleGrown.data.listLinkRels())).to.be(true)
expect(fn.contains('toss', appleGrown.data.listLinkRels())).to.be(true)

//- call 'eat' api (full put)
link = appleGrown.data.getLink("eat");
var appleEaten = apiEndPoint[link.method](link.href, headers, { weight: 0, color: 'orange'})
expect(appleEaten.data.weight).to.be(0)
expect(appleEaten.data.listLinkRels().length).to.be(2)
expect(fn.contains('self', appleEaten.data.listLinkRels())).to.be(true)

// - test api whitelisting - should not be able to call 'grow' in this state
link = appleGrown.data.getLink("eat");
var notAllowedResult = apiEndPoint[link.method](link.href, headers, { weight: 0, color: '<or></or>ange'})
expect(notAllowedResult.statusCode).to.be(405)

// - test get before toss
all = apiEndPoint.GET('/api/apples/', headers)
// log(JSON.stringify(all.data))
var embeds = all.data.getEmbeds('apples')
expect(embeds.length).to.be(3)  //page 1

//todo: get page 2 and a test that is has 1 embed

//- toss one of the apples
link = appleEaten.data.getLink("toss");
var result = apiEndPoint[link.method](link.href, headers, {})

//- test get after toss
all = apiEndPoint.GET('/api/apples/', headers)
// log(JSON.stringify(all.data))
embeds = all.data.getEmbeds('apples')
expect(embeds.length).to.be(3)

//- cleanup after
db.clear()
