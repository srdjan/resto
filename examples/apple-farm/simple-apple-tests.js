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
const appleResource = require('./resources/SimpleApple')
const log           = console.log

//- prepare
db.clear()

log('------ configure pipeline --------')
const reqHandler = pipeline.expose(appleResource)
                      // .use(authenticator)
                      .use(resolver)
                      // .use(authorizer)
                      .use(invoker)//, true)
                      // .use(converter)

const apiEndPoint = server.create(reqHandler)
const headers = {accept: 'application/json'}

log('------ run SimpleApple tests -----')
//-  test bad get all
var all = apiEndPoint.get('bad', headers)
expect(all.statusCode).to.be(500)
// expect(all.data.Error).to.be('type resolver error')

//-  test get all - empty set
all = apiEndPoint.get('/api/apples/', headers)
expect(all.statusCode).to.be(200)

//- test create apple 1
var apple = apiEndPoint.cmd("POST", '/api/apples/', {weight: 10, color: "red"}, headers)
var result = halson(apple.data)
expect(result.weight).to.be(10)

//- test create apple 2
apple = apiEndPoint.cmd("POST", '/api/apples/', {weight: 20, color: "green"}, headers)
result = halson(apple.data)
expect(result.weight).to.be(20)

//- test create apple 3 - full page size
apple = apiEndPoint.cmd("POST", '/api/apples/', {weight: 30, color: "orange"}, headers)
result = halson(apple.data)
expect(result.weight).to.be(30)

//- test create apple 4 - page 2
apple = apiEndPoint.cmd("POST", '/api/apples/', {weight: 40, color: "blue"}, headers)
result = halson(apple.data)
expect(result.weight).to.be(40)

//- test if create sucessful
var self = apiEndPoint.get('/api/apples/' + result.id, headers)
result = halson(self.data)
expect(result.weight).to.be(40)

//-  test get all - 2 pages
all = apiEndPoint.get('/api/apples/', headers)
expect(all.statusCode).to.be(200)

//- cleanup after
db.clear()
