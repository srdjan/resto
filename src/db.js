//---------------------------------------------------------------------------------
//- db api
//---------------------------------------------------------------------------------
var datastore = require('node-persist');
var fn = require('./fn.js');
var log = console.log;

datastore.initSync({
  dir: '../../../../datastore',
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: 'utf8',
  logging: false, // can also be custom logging function
  continuous: true,
  interval: false
});

var milis = 0;
function createId() {
  milis = new Date().getTime();
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

function getAll() {
  var objs = [];
  datastore.values(function(vals) {
    objs = vals;
  });
  if (objs.length >= 1) {
    objs = fn.filterEmpty(objs);
  }
  return objs;
}

function remove(id) {
  var entity = get(id);
  // if(typeof entity !== 'undefined') {
    datastore.removeItem(id);
  // }
  return entity;
}

module.exports.clear = clear;
module.exports.add = add;
module.exports.save = save;
module.exports.get = get;
module.exports.getAll = getAll;
module.exports.remove = remove;
