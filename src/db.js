//---------------------------------------------------------------------------------
//- db api
//---------------------------------------------------------------------------------
var datastore = require('node-persist');
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

function save(obj) {
  datastore.setItem(obj.id, obj);
  datastore.getItem(obj.id);
}

function get(id) {
  return datastore.getItem(id);
}

function getAll() {
  var objs = [];
  datastore.values(function(vals) {
    objs = vals;
  });
  return objs;
}

function remove(id) {
  datastore.removeItem(id);
}

module.exports.createId = createId;
module.exports.clear = clear;
module.exports.save = save;
module.exports.get = get;
module.exports.getAll = getAll;
module.exports.remove = remove;
