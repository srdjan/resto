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
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)//, true)
                      .use(converter)

const apiEndPoint = server.create(reqHandler)

log('------ run integration tests -----')
//-  test bad get all
  var all = apiEndPoint.get('bad')
  expect(all.statusCode).to.be(500)
  expect(all.data.Error).to.be('type resolver error')

//-  test get all - empty set
  all = apiEndPoint.get('/api/apples/')
  expect(all.statusCode).to.be(200)
  expect(all.data.listLinkRels().length).to.be(2)
  expect(fn.contains('self', all.data.listLinkRels())).to.be(true)
  expect(fn.contains('create', all.data.listLinkRels())).to.be(true)

// //- test create apple 1
  var apple = apiEndPoint.cmd(all.data, 'create', {weight: 10, color: "red"})
  expect(apple.data.listLinkRels().length).to.be(3)
  expect(apple.data.weight).to.be(10)
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 2
  apple = apiEndPoint.cmd(all.data, 'create', {weight: 20, color: "green"})
  expect(apple.data.listLinkRels().length).to.be(3)
  expect(apple.data.weight).to.be(20)
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 3 - full page size
  apple = apiEndPoint.cmd(all.data, 'create', {weight: 20, color: "orange"})
  expect(apple.data.listLinkRels().length).to.be(3)
  expect(apple.data.weight).to.be(20)
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test create apple 4 - page 2
  apple = apiEndPoint.cmd(all.data, 'create', {weight: 20, color: "blue"})
  expect(apple.data.listLinkRels().length).to.be(3)
  expect(apple.data.weight).to.be(20)
  expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('grow', apple.data.listLinkRels())).to.be(true)
  expect(fn.contains('toss', apple.data.listLinkRels())).to.be(true)

//- test if create sucessful
  var self = apiEndPoint.get(apple.data.getLink('self').href)
  expect(self.data.weight).to.be(20)
  expect(self.data.listLinkRels().length).to.be(3)
  expect(fn.contains('self', self.data.listLinkRels())).to.be(true)
  expect(fn.contains('grow', self.data.listLinkRels())).to.be(true)
  expect(fn.contains('toss', self.data.listLinkRels())).to.be(true)

//-  test get all - 2 pages
  all = apiEndPoint.get('/api/apples/')
  expect(all.statusCode).to.be(200)
  expect(all.data.listLinkRels().length).to.be(5)
  expect(fn.contains('create', all.data.listLinkRels())).to.be(true)

//- call 'grow' api (post - with id and propertis that don't exist on entity)
  var appleGrown = apiEndPoint.cmd(self.data, 'grow', { weightIncr: 230})
  expect(appleGrown.data.weight).to.be(250)
  expect(appleGrown.data.listLinkRels().length).to.be(3)
  expect(fn.contains('self', appleGrown.data.listLinkRels())).to.be(true)
  expect(fn.contains('eat', appleGrown.data.listLinkRels())).to.be(true)
  expect(fn.contains('toss', appleGrown.data.listLinkRels())).to.be(true)

//- call 'eat' api (full put)
  var appleEaten = apiEndPoint.cmd(appleGrown.data, 'eat', { weight: 0, color: 'orange'})
  expect(appleEaten.data.weight).to.be(0)
  expect(appleEaten.data.listLinkRels().length).to.be(2)
  expect(fn.contains('self', appleEaten.data.listLinkRels())).to.be(true)

// - test api whitelisting - should not be able to call 'grow' in this state
  var notAllowedResult = apiEndPoint.cmd(appleGrown.data, 'eat',  { weight: 0, color: 'orange'})
  expect(notAllowedResult.statusCode).to.be(405)

// - test get before toss
  all = apiEndPoint.get('/api/apples/')
  // log(JSON.stringify(all.data))
  let embeds = all.data.getEmbeds('apples')
  expect(embeds.length).to.be(3)  //page 1

  //todo: get page 2 and a test that is has 1 embed

//- todos one of the apples
  // result = apiEndPoint.cmd(appleEaten.data, 'toss', { })

//- test get after toss
  all = apiEndPoint.get('/api/apples/')
  // log(JSON.stringify(all.data))
  embeds = all.data.getEmbeds('apples')
  expect(embeds.length).to.be(3)

//- cleanup after
db.clear()
