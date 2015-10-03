//---------------------------------------------------------------------------------
//- functions
//---------------------------------------------------------------------------------
const URLSafeBase64 = require('urlsafe-base64')
const Either = require('data.either')
const R = require('ramda')
exports.compose = R.compose
exports.contains = R.contains
exports.filter = R.filter
exports.none = R.none
exports.every = R.every
exports.diff = R.difference
exports.map = R.map
exports.chain = R.chain

let log = console.log
exports.trace = function(obj) {
  log(obj)
  log(new Error().stack)
}

let noop = function() { return this }

function trimLeftAndRight(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "")
}
exports.trimLeftAndRight = trimLeftAndRight

exports.atob = function(str) {
  let buf = new Buffer(str, 'ascii')
  let res = URLSafeBase64.encode(buf)
  return res
}

exports.btoa = function(str) {
  let res = URLSafeBase64.decode(str).toString()
  return res
}

exports.propsMatch = function (obj1, obj2) {
  return R.difference(Object.keys(obj1), Object.keys(obj2)).length === 0
}

exports.propsDontMatch = function (obj1, obj2) {
  return ! exports.propsMatch(obj1, obj2)
}

exports.propsExist = function (obj1, obj2) {
  return R.difference(Object.keys(obj1), Object.keys(obj2)).length > 0
}

exports.propsDontExist = function (obj1, obj2) {
  return ! propsExist(obj1, obj2)
}

exports.getFnName = function(func) {
  let isFunc = typeof func == 'function'
  let s = isFunc && ((func.name && ['', func.name]) || func.toString().match(/function ([^\(]+)/))
  return (!isFunc && 'not a function') || (s && s[1] || 'anonymous')
}

exports.getTokens = function(url) {
  let path = url.substring(url.indexOf('api'), url.length)
  return trimLeftAndRight(path, '/').split('/')
}

exports.isApiCall = function(request) { return request.url.indexOf('/api') !== -1 }
exports.hasBody = function(method) { return method === 'POST' || method === 'PUT' || method === 'PATCH' }

function trace(h, func, ctx) {
  log(h + exports.getFnName(func) + ', ' + JSON.stringify(ctx))
}

// f, ep, m(a) -> m(b)
function run(handler, ep, m) {
  return m.chain(d => {
    if(handler.trace) trace('-> ', handler.func, d)
    let r = handler.func(d)
    if(handler.trace) trace('<- ', handler.func, r)

    var res = ep(r) ? Either.Left(r) : Either.Right(r)
    return res
  })
}

// hs, ep, a -> b | err
exports.runAll = function(handlers, ep, ctx) {
  let mctx = Either.of(ctx)
  handlers.forEach(handler => { mctx = run(handler, ep, mctx) })
  return mctx.merge()
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  let expect = require('expect.js')
  log('testing: fn.js')

  function f1(ctx) {
    if(ctx.counter > 1) {
      ctx.statusCode = 500
      return ctx
    }
    ctx.counter += 1
    return ctx
  }
  function f2(ctx) {
    if(ctx.counter > 1) {
      ctx.statusCode = 500
      return ctx
    }
    ctx.counter += 1
    return ctx
  }
  function f3(ctx) {
    if(ctx.counter > 1) {
      ctx.statusCode = 500
      return ctx
    }
    ctx.counter += 1
    return ctx
  }

  // setup
  let handlers = []
  handlers.push({ func: f1, pred: false, trace: false})
  handlers.push({ func: f2, pred: false, trace: false})
  handlers.push({ func: f3, pred: false, trace: false})

  // run until failure
  let ctx = {counter: 1, statusCode: 200}
  ctx = exports.runAll(handlers, d => d.statusCode !== 200, ctx)
  expect(ctx.counter).to.be(2)
  expect(ctx.statusCode).to.be(500)
