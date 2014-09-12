//---------------------------------------------------------------------------------
//- auth
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var Either = require('data.either');
var log = console.log;

exports.auth = function auth(ctx) {
  return Either.Right(ctx);
};
