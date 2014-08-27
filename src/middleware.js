//---------------------------------------------------------------------------------
//- middleware pipeline definition
//---------------------------------------------------------------------------------
'use strict;'
var resolver = require('./resolver.js');
var hal = require('./hal.js');
var fn = require('./fn.js');
var log = console.log;

exports.pipeline = fn.compose(resolver.handle);
