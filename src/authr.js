//---------------------------------------------------------------------------------
//- auth
//---------------------------------------------------------------------------------
var Either = require('data.either');
var fn = require('./fn');
var log = console.log;

exports.auth = function auth(ctx) {
  return Either.Right(ctx);
};
