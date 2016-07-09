//---------------------------------------------------------------------------------
//- type resolver
//---------------------------------------------------------------------------------
"use strict"

const fn  = require('./core/fn')
const log = console.log

exports.func = function(ctx) {
  let tokens = fn.getTokens(ctx.url)
  if (tokens.length < 2) {
    ctx.result = {Error: 'type resolver error'}
    ctx.statusCode = 500
    return ctx
  }
  let typeName = tokens[1].slice(0, -1)
  ctx.typeName = typeName.charAt(0).toUpperCase() + typeName.substring(1)
  ctx.typeCtor = ctx.model[ctx.typeName]

  if (! ctx.hal) {
    if (tokens.length === 3) {
      let id = Number(tokens[2])
      if(! isNaN(id)) {
        ctx.id = id //todo: convert to number?
      }
    }
  }
  return ctx
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
let expect = require('expect.js')
log('testing: resolve.js')

// test: resolveType(url):- api/apples/123456/create
let url = '/api/apples/'
let ctx = exports.func({hal: false, url: url, model: {Apple: function() {}}})
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/' + fn.atob('123456')
ctx = exports.func({hal: false, url: url, model: {Apple: function() {}}})
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/'
ctx = exports.func({hal: false, url: url, model: {Apple: function() {}}})
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/' + fn.atob('123456')
ctx = exports.func({hal: false, url: url, model: {Apple: function() {}}})
expect(ctx.typeName).to.be('Apple')

url = 'api/apples/' + fn.atob(123456 + '/' + 'create')
ctx = exports.func({hal: false, url: url, model: {Apple: function() {}}})
expect(ctx.typeName).to.be('Apple')

//should fail
url = 'apples' + fn.atob(123456 + '/' + 'create')
ctx = exports.func({hal: false, url: url, model: {Apple: function() {}}})
expect(ctx.statusCode).to.be(500)
