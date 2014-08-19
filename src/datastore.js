//---------------------------------------------------------------------------------
//- datastore
//---------------------------------------------------------------------------------
'use strict;'
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
exports.createId = function() {
  milis = new Date().getTime();
  return (milis += 1).toString();
};

exports.clear = function() {
  datastore.clear();
};

exports.save = function(id, obj) {
  datastore.setItem(id, obj);
  return obj;
}

exports.get = function(id) {
  return datastore.getItem(id);
}

exports.getAll = function() {
  var objs = [];
  datastore.values(function(recs) { objs = recs; });
  return objs;
}
