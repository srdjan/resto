//---------------------------------------------------------------------------------
//- db api
//---------------------------------------------------------------------------------
var datastore = require('node-persist');
var fn = require('./fn');
var log = console.log;

function init(path) {
    datastore.initSync({
    dir: path,
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false, // can also be custom logging function
    continuous: true,
    interval: false
  });
}

var milis = 0;
function createId() {
  if (milis === 0) milis = new Date().getTime();
  return (milis += 1).toString();
}

function clear() {
  datastore.clear();
}

function add(obj) {
  obj.id = createId();
  save(obj);
  return obj;
}

function addBatch(objs) {
  objs.forEach(function(obj) {
    obj.id = createId();
    save(obj);
  });
}

function save(obj) {
  datastore.setItem(obj.id, obj);
  return datastore.getItem(obj.id);
}

function get(id) {
  var entity = datastore.getItem(id);
  if (typeof entity === 'undefined') {
    throw { statusCode: 404, message: 'Not Found'};
  }
  return entity;
}

var pageSize = 3;
function getAll(pgNumber) {
  var pageNumber = pgNumber || 0;
  var objs = [];
  datastore.values(function(vals) {
    objs = vals;
  });
  if (objs.length === 0 ) return { pageNumber: 0, pageCount: 0, page: [] };
  if (objs.length <= pageSize) return { pageNumber: 0, pageCount: 0, page: objs };

  if (pageNumber === 0) pageNumber += 1;
  var pageCount = objs.length % pageSize > 0 ? Math.ceil(objs.length / pageSize) : objs.length / pageSize;

  if (pageNumber > pageCount) pageNumber = pageCount;
  var page = objs.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  return { pageNumber: pageNumber, pageCount: pageCount, page: page };
}

function remove(id) {
  var entity = get(id);
  datastore.removeItem(id);
  return entity;
}

module.exports.init = init;
module.exports.clear = clear;
module.exports.add = add;
module.exports.save = save;
module.exports.get = get;
module.exports.getAll = getAll;
module.exports.remove = remove;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  var hal = require('./hal.js');
  log('testing: db.js');

init('../../../../datastore-test');
clear();

//-- TEST PAGING
//TEST ZERO records
  var todos = [];
  var result = getAll();
  var ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  };
  var res = hal.convert(ctx);
  var embeds = res.result.getEmbeds('todos');
  expect(embeds.length).to.be(0);
  expect(fn.contains('self', res.result.listLinkRels())).to.be(true);
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true);

//TEST ONE record
  //...
  todos.push({
              content: '1',
              isDone: false,
              isArchived: false
           });
  addBatch(todos);
  var result = getAll();
  var ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  };
  var res = hal.convert(ctx);
  var embeds = res.result.getEmbeds('todos');
  expect(embeds.length).to.be(1);
  expect(fn.contains('self', res.result.listLinkRels())).to.be(true);
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true);

//TEST PAGE SIZE records
  todos = [];
  todos.push({
              content: '2',
              isDone: false,
              isArchived: false
             });
  todos.push({
              content: '3',
              isDone: false,
              isArchived: false
              });
  addBatch(todos);
  var result = getAll();
  var ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  };
  var res = hal.convert(ctx);
  var embeds = res.result.getEmbeds('todos');
  expect(embeds.length).to.be(3);
  expect(fn.contains('self', res.result.listLinkRels())).to.be(true);
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true);


//TEST MULTI PAGES
  todos = [];
  todos.push({
              content: '4',
              isDone: false,
              isArchived: false
              });
  todos.push({
               content: '5',
               isDone: false,
               isArchived: false
              });
  todos.push({
              content: '6',
              isDone: false,
              isArchived: false
              });
  todos.push({
              content: '7',
              isDone: false,
              isArchived: false
              });
  todos.push({
              content: '8',
              isDone: false,
              isArchived: false
              });
  todos.push({
              content: '9',
              isDone: false,
              isArchived: false
              });
  todos.push({
              content: '10',
              isDone: false,
              isArchived: false
              });
  todos.push({
              content: '11',
              isDone: false,
              isArchived: false
              });
  todos.push({
              content: '12',
              isDone: false,
              isArchived: false
              });
  addBatch(todos);

  //- get all - when result is array: createList()
  var result = getAll();
  // log(result)
  var ctx = {
    typeName: 'Todo',
    pageNumber: result.pageNumber,
    pageCount: result.pageCount,
    result: result.page
  };
  var res = hal.convert(ctx);
  log(JSON.stringify(res.result));
  var embeds = res.result.getEmbeds('todos');
  expect(embeds.length).to.be(3);
  expect(fn.contains('create', res.result.listLinkRels())).to.be(true);
  expect(fn.contains('next', res.result.listLinkRels())).to.be(true);

  var next = res.result.getLink('next');
  log(next);
//-- clear database after tests
clear();
