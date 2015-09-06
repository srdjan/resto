//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
const urlParser = require('url')
const fn        = require('./fn')
const db        = require('./db')
const log       = console.log

db.init('../../../datastore')
db.clear()

function writeToResp(response, statusCode, result) {
  response.writeHead(statusCode, {"Content-Type": "application/json"})
  response.write(JSON.stringify(result))
  response.end()
}

function getId(tokens) {
  let id = fn.btoa(tokens[tokens.length - 1])
  if (isNaN(id)) {
    return { id: 0, rel: ''}
  }
  return { id: id, rel: ''}
}

function getIdAndRel(url) {
  let tokens = fn.getTokens(url)
  if(tokens.length === 2) {
    return {id: 0, rel: ''}
  }
  let idAndRel = getId(tokens)
  if(idAndRel.id !== 0) {
    return idAndRel
  }
  tokens = fn.btoa(tokens[tokens.length - 1]).split('/')
  if (tokens.length === 2) {
    idAndRel.id = tokens[0]
    idAndRel.rel = tokens[1]
  }
  else {
    idAndRel.rel = tokens[0]
  }
  return idAndRel
}

function extract(request) {
  let ctx = {}
  let idAndRel = getIdAndRel(request.url)
  ctx.id = idAndRel.id
  ctx.rel = idAndRel.rel
  ctx.method = request.method.toLowerCase()
  ctx.body = request.body
  let urlParts = urlParser.parse(request.url, true, true)
  ctx.url = urlParts.pathname
  ctx.pageNumber = urlParts.query.hasOwnProperty('page') ? urlParts.query.page : 0
  return ctx
}

let handlers = []
exports.use = function(f, t) {
  handlers.push({ func: f, trace: t || false})
  return this
}

let appModel
exports.expose = function(model) {
  appModel = model
  return this
}

exports.process = function(request, response) {
  try {
    let ctx = extract(request)
    ctx.model = appModel
    ctx.statusCode = 200
    ctx = fn.runAll(handlers, d => d.statusCode !== 200, ctx)
    writeToResp(response, ctx.statusCode, ctx.result)
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500
    }
    if ( ! e.hasOwnProperty('message')) {
      e.message = ''
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' message: ' + e.message)
    writeToResp(response, e.statusCode, e.message)
  }
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  let expect = require('expect.js')
  log('testing: pipeline.js')

  //test: getTokens(url):- api/apples/
  let url = '/api/apples/'
  let tokens = fn.getTokens(url)
  expect(tokens.length).to.be(2)

  //test: getId(tokens):- api/apples
  let idAndRel = getId(tokens)
  expect(idAndRel.id).to.be(0)

  //test: getTokens(url):- api/apples/123456
  url = 'api/apples/' + fn.atob('123456')
  tokens = fn.getTokens(url)
  expect(tokens.length).to.be(3)

  //test: getId(tokens):- api/apples || api/apples/abc3b4=1
  idAndRel = getId(tokens)
  expect(idAndRel.id).to.be('123456')

  //test: getIdAndRel(url):- api/apples/
  url = 'api/apples/'
  idAndRel = getIdAndRel(url)
  expect(idAndRel.id).to.be(0)
  expect(idAndRel.rel).to.be('')

  //test: getTokens(url):- api/apples/123456
  url = 'api/apples/' + fn.atob('123456')
  idAndRel = getIdAndRel(url)
  expect(idAndRel.id).to.be('123456')
  expect(idAndRel.rel).to.be('')

  //test: getIdAndRel(url):- api/apples/123456/create
  url = 'api/apples/' + fn.atob(123456 + '/' + 'create')
  idAndRel = getIdAndRel(url)
  expect(idAndRel.id).to.be('123456')
  expect(idAndRel.rel).to.be('create')
