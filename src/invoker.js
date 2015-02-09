//---------------------------------------------------------------------------------
//- method resolver
//---------------------------------------------------------------------------------
const fn        = require('./fn.js')
const resource  = require('./resource.js')
const log       = console.log

function invoke(ctx) {
  let handler = resource[ctx.method]
  if ( ! typeof handler) {
    ctx.result = { Error: 'method resolver error' }
    ctx.statusCode = 500
    return ctx
  }
  ctx = handler(ctx)
  return ctx
}

module.exports.invoke = invoke

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  let expect = require('expect.js')
  log('testing: method-resolver.js')

  // let ctx = invoke({ method: 'bad method name'})
  // expect(ctx.statusCode).to.be(500)

  // ctx = invoke({method: 'get'})
  // expect(typeof ctx.handler).to.be('function')
