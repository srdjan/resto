//---------------------------------------------------------------------------------
//- db api
//---------------------------------------------------------------------------------
let datastore   = require('node-persist')
const fn        = require('./fn')
const log       = console.log

function init(path) {
    datastore.initSync({
    dir: path,
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false, // can also be custom logging function
    continuous: true,
    interval: false
  })
}

let milis = 0
function createId() {
  if (milis === 0) milis = new Date().getTime()
  return (milis += 1).toString()
}

function clear() {
  datastore.clearSync()
}

function add(obj) {
  obj.id = createId()
  save(obj)
  return obj
}

function addBatch(objs) {
  objs.forEach(function(obj) {
    obj.id = createId()
    save(obj)
  })
}

function save(obj) {
  datastore.setItem(obj.id, obj)
  return datastore.getItem(obj.id)
}

function get(id) {
  let entity = datastore.getItem(id)
  return entity
}

const pageSize = 3
function getAll(pgNumber) {
  let pageNumber = pgNumber || 0
  let objs = []
  datastore.values(vals => objs = vals)

  if (objs.length === 0 )
    return { pageNumber: 0, pageCount: 0, page: [] }

  if (objs.length <= pageSize)
    return { pageNumber: 0, pageCount: 0, page: objs }

  let pageCount = objs.length % pageSize > 0 ? Math.ceil(objs.length / pageSize) : objs.length / pageSize

  if (pageNumber > pageCount) pageNumber = pageCount

  if (pageNumber === 0) pageNumber += 1
  let page = objs.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
  return { pageNumber: pageNumber, pageCount: pageCount, page: page }
}

function remove(id) {
  let entity = get(id)
  datastore.removeItemSync(id)
  return true
}

module.exports.init = init
module.exports.clear = clear
module.exports.add = add
module.exports.save = save
module.exports.get = get
module.exports.getAll = getAll
module.exports.remove = remove

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  let expect = require('expect.js')
  let hal = require('./hal.js')
  log('testing: db.js')

  init('./datastore-test')
  clear()


  //-- TEST PAGING
  //TEST ZERO records
  // result = getAll()

  let result = getAll()
  let ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  }
  let res = hal.convert(ctx)
  let embeds = res.result.getEmbeds('todos')
  expect(embeds.length).to.be(0)
  expect(fn.contains('self', res.result.listLinkRels())).to.be(true)
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true)

//TEST ONE record
  let todos = []
  todos.push({
              content: '1',
              isDone: false,
              isArchived: false
           })
  addBatch(todos)
  result = getAll()
  ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  }
  res = hal.convert(ctx)
  embeds = res.result.getEmbeds('todos')
  expect(embeds.length).to.be(1)
  expect(fn.contains('self', res.result.listLinkRels())).to.be(true)
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true)

//TEST PAGE SIZE records
  todos = []
  todos.push({
              content: '2',
              isDone: false,
              isArchived: false
             })
  todos.push({
              content: '3',
              isDone: false,
              isArchived: false
              })
  addBatch(todos)
  result = getAll()
  ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  }
  res = hal.convert(ctx)
  embeds = res.result.getEmbeds('todos')
  expect(embeds.length).to.be(3)
  expect(fn.contains('self', res.result.listLinkRels())).to.be(true)
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true)


//TEST MULTI PAGES
  todos = []
  todos.push({
              content: '4',
              isDone: false,
              isArchived: false
              })
  todos.push({
               content: '5',
               isDone: false,
               isArchived: false
              })
  todos.push({
              content: '6',
              isDone: false,
              isArchived: false
              })
  todos.push({
              content: '7',
              isDone: false,
              isArchived: false
              })
  todos.push({
              content: '8',
              isDone: false,
              isArchived: false
              })
  todos.push({
              content: '9',
              isDone: false,
              isArchived: false
              })
  todos.push({
              content: '10',
              isDone: false,
              isArchived: false
              })
  todos.push({
              content: '11',
              isDone: false,
              isArchived: false
              })
  todos.push({
              content: '12',
              isDone: false,
              isArchived: false
              })
  addBatch(todos)

  //- get all - when result is array: createList()
  result = getAll()
  // log(result)
  ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  }
  res = hal.convert(ctx)
  // log(JSON.stringify(res.result))
  embeds = res.result.getEmbeds('todos')
  expect(embeds.length).to.be(3)
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true)
  expect(fn.contains('next', res.result.listLinkRels())).to.be(true)

  let next = res.result.getLink('next')
  // log(next)
//-- clear database after tests
clear()
