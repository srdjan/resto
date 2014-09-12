//---------------------------------------------------------------------------------
//- db api
//---------------------------------------------------------------------------------
var datastore = require('node-persist');
var fn = require('./fn.js');
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
function getAll(pageNumber) {
  log('getAll')
  var objs = [];
  datastore.values(function(vals) {
    objs = vals;
  });
  if (objs.length === 0 || objs.length < pageSize) return { pageNumber: 0, pageCount: 0, page: [] };

  if (pageNumber === 0) pageNumber += 1;
  var pageCount = objs.length % pageSize > 0 ? Math.floor(objs.length / pageSize) + 1 : objs.length / pageSize;

  log('pageSize: ' + pageSize + ' objs.length: ' + objs.length + ' pageCount: ' + pageCount)

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
  log('testing: db.js');

init('../../../../test-datastore');
clear();

//-- test paging
  log('testing: hal.js');  var todos = [{
                content: '1',
                isDone: false,
                isArchived: false
              },
              {
                content: '2',
                isDone: false,
                isArchived: false
              },
              {
                content: '3',
                isDone: false,
                isArchived: false
              },
              {
                content: '4',
                isDone: false,
                isArchived: false
              },
              {
                content: '5',
                isDone: false,
                isArchived: false
              },
              {
                content: '6',
                isDone: false,
                isArchived: false
              },
              {
                content: '7',
                isDone: false,
                isArchived: false
              },
              {
                content: '8',
                isDone: false,
                isArchived: false
              },
              {
                content: '9',
                isDone: false,
                isArchived: false
              },
              {
                content: '10',
                isDone: false,
                isArchived: false
              },
              {
                content: '11',
                isDone: false,
                isArchived: false
              },
              {
                content: '12',
                isDone: false,
                isArchived: false
              }
  ];

  //- load test resords
  todos.forEach(function(t) {
    add(t);
  });

  //- get all - when result is array: createList()
  var result = getAll(4);
  // log(result);



  //-----------------------------------
  // var res = exports.convert(ctx);
  // log(JSON.stringify(res.result));
  // var embeds = res.result.getEmbeds('todos');
  // expect(embeds.length).to.be(12);

//--
clear();
