//---------------------------------------------------------------------------------
//- functions
//---------------------------------------------------------------------------------
'use strict;'
var R = require('ramda');
var log = console.log;

exports.atob = function(str) {
  var res = new Buffer(str, 'ascii').toString('base64');
  return res.replace('+', '-').replace('/', '_').replace('=', ',');
}

exports.btoa = function(str) {
  var res = new Buffer(str, 'base64').toString('ascii');
  return res.replace('-', '+').replace('_', '/').replace(',', '=');
}

exports.trimLeftAndRight = function(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "");
}

exports.getLinks = function(entity) {
  var states = R.filter(function(m) { return m.startsWith('state_') }, Object.keys(entity));
  for (var i = 0; i < states.length; i++) {
    var links = entity[states[i]]();
    if (links !== false) {
      return links;
    }
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Invalid state invariants: ' + JSON.stringify(entity) };
}

exports.getPath = function(url) {
  var path = url.substring(url.indexOf('api'), url.length);
  return exports.trimLeftAndRight(path, '/');
}

exports.contains = R.contains;
exports.filter = R.filter;
exports.each = R.each;
exports.some = R.some;
exports.diff = R.difference;
exports.map = R.map;
