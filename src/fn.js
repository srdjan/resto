//---------------------------------------------------------------------------------
//- functions
//---------------------------------------------------------------------------------
'use strict;'
var R = require('ramda');
var log = console.log;

function atob(str) {
  var res = new Buffer(str, 'ascii').toString('base64');
  return res.replace('+', '-').replace('/', '_').replace('=', ',');
}

function btoa(str) {
  var res = new Buffer(str, 'base64').toString('ascii');
  return res.replace('-', '+').replace('_', '/').replace(',', '=');
}

function trimLeftAndRight(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "");
}

exports.atob = atob;
exports.btoa = btoa;
exports.trimLeftAndRight = trimLeftAndRight;
exports.contains = R.contains;
exports.filter = R.filter;
exports.each = R.each;
exports.some = R.some;
exports.diff = R.difference;
exports.map = R.map;


