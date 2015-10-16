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

log('------ run SimpleApple tests -----')
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

//- test create apple 1
var apple = apiEndPoint.cmd(all.data, 'create', {weight: 10, color: "red"})
log(apple.toString())
expect(apple.data.listLinkRels().length).to.be(4)
expect(apple.data.weight).to.be(10)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('put', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('post', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('delete', apple.data.listLinkRels())).to.be(true)

//- test create apple 2
apple = apiEndPoint.cmd(all.data, 'create', {weight: 20, color: "green"})
expect(apple.data.listLinkRels().length).to.be(4)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('put', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('post', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('delete', apple.data.listLinkRels())).to.be(true)

//- test create apple 3 - full page size
apple = apiEndPoint.cmd(all.data, 'create', {weight: 20, color: "orange"})
expect(apple.data.listLinkRels().length).to.be(4)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('put', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('post', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('delete', apple.data.listLinkRels())).to.be(true)

//- test create apple 4 - page 2
var apple = apiEndPoint.cmd(all.data, 'create', {weight: 20, color: "blue"})
expect(apple.data.listLinkRels().length).to.be(4)
expect(apple.data.weight).to.be(20)
expect(fn.contains('self', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('put', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('post', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('delete', apple.data.listLinkRels())).to.be(true)

//- test if create sucessful
var self = apiEndPoint.get(apple.data.getLink('self').href)
expect(self.data.weight).to.be(20)
expect(self.data.listLinkRels().length).to.be(4)
expect(fn.contains('self', self.data.listLinkRels())).to.be(true)
expect(fn.contains('put', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('post', apple.data.listLinkRels())).to.be(true)
expect(fn.contains('delete', apple.data.listLinkRels())).to.be(true)

//-  test get all - 2 pages
all = apiEndPoint.get('/api/apples/')
expect(all.statusCode).to.be(200)
expect(all.data.listLinkRels().length).to.be(5)
expect(fn.contains('create', all.data.listLinkRels())).to.be(true)


//- cleanup after
db.clear()
