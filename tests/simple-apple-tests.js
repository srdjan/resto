//---------------------------------------------------------------------------------
//- tests using apple-farm model
//---------------------------------------------------------------------------------
const test_source = '../src' //'../lib'

const expect   = require('expect.js')
const fn       = require(test_source + '/fn')
const db       = require(test_source + '/db')
const server   = require(test_source + '/http-mock')
const Pipeline = require(test_source + '/pipeline')
const authn    = require(test_source + '/authn')
const authr    = require(test_source + '/authr')
const resolver = require(test_source + '/resolver')
const invoker  = require(test_source + '/invoker')
const hal      = require(test_source + '/hal')
const Apple     = require('./SimpleApple')
const log       = console.log

//- prepare
db.clear()

log('------ configure pipeline --------')
const pipeline = Pipeline.expose(Apple)
                      .use(authn.func)
                      .use(resolver.func)
                      .use(authr.func)
                      .use(invoker.func)//, true)
                      .use(hal.func)//, true)

const apiEndPoint = server.createEndPoint(pipeline)
const headers = {accept: 'application/json'}

log('------ run SimpleApple tests -----')
//-  test bad get all
var all = apiEndPoint.GET('bad', headers)
expect(all.statusCode).to.be(500)
// expect(all.data.Error).to.be('type resolver error')

//-  test get all - empty set
all = apiEndPoint.GET('/api/apples/', headers)
expect(all.statusCode).to.be(200)

//- test create apple 1
var apple = apiEndPoint.POST('/api/apples/', headers, {weight: 10, color: "red"})
expect(apple.data.weight).to.be(10)

//- test create apple 2
apple = apiEndPoint.POST('/api/apples/', headers, {weight: 20, color: "green"})
expect(apple.data.weight).to.be(20)

//- test create apple 3 - full page size
apple = apiEndPoint.POST('/api/apples/', headers, {weight: 30, color: "orange"})
expect(apple.data.weight).to.be(30)

//- test create apple 4 - page 2
apple = apiEndPoint.POST('/api/apples/', headers, {weight: 40, color: "blue"})
expect(apple.data.weight).to.be(40)

//- test if create sucessful
var self = apiEndPoint.GET('/api/apples/' + apple.data.id, headers)
expect(apple.data.weight).to.be(40)

//-  test get all - 2 pages
all = apiEndPoint.GET('/api/apples/', headers)
expect(all.statusCode).to.be(200)

//- cleanup after
db.clear()
