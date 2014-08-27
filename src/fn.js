//---------------------------------------------------------------------------------
//- functions
//---------------------------------------------------------------------------------
'use strict;'
var R = require('ramda');
exports.compose = R.compose;
exports.contains = R.contains;
exports.filter = R.filter;
exports.each = R.each;
exports.some = R.some;
exports.diff = R.difference;
exports.map = R.map;

var log = console.log;

function getTokens(url) {
  var path = url.substring(url.indexOf('api'), url.length);
  return exports.trimLeftAndRight(path, '/').split('/');
}

exports.atob = function(str) {
  var res = new Buffer(str, 'ascii').toString('base64');
  return res.replace('+', '-').replace('/', '_').replace('=', ',');
}

exports.btoa = function(str) {
  var res = new Buffer(str, 'base64').toString('ascii');
  return res.replace('-', '+').replace('_', '/').replace(',', '=');
}

//- api/apples || api/apples/abc3b4=1
exports.getId = function(url) {
  var tokens = getTokens(url);
  var id = exports.btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) return 0;
  return id;
}

//- api/apples/123456/create
exports.getIdAndRel = function(url) {
  var tokens = getTokens(url);
  var idAndRel = { id: 0, rel: ''};
  tokens = exports.btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  }
  else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
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

//- api/apples/123456/create
exports.getTypeFromPath = function(url) {
  var tokens = getTokens(url);
  if (tokens.length > 1) {
    return tokens[1].slice(0, -1);
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Not an API call: ' + path };
}

exports.requestWithBody = function(method) {
  return method === 'POST' || method === 'PUT' || method === 'PATCH'
}
