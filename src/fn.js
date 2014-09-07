//---------------------------------------------------------------------------------
//- functions
//---------------------------------------------------------------------------------
var Either = require('data.either');
exports.Success = Either.Right;
exports.Next = Either.Right;
exports.Fail = Either.Left;

var R = require('ramda');
exports.compose = R.compose;
exports.contains = R.contains;
exports.filter = R.filter;
exports.each = R.each;
exports.some = R.some;
exports.diff = R.difference;
exports.map = R.map;
exports.chain = R.chain;

var log = console.log;

exports.filterEmpty = R.filter(function(e) { return Object.getOwnPropertyNames(e).length > 0; });

trimLeftAndRight = function(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "");
};
exports.trimLeftAndRight = trimLeftAndRight;

exports.atob = function(str) {
  var res = new Buffer(str, 'ascii').toString('base64');
  return res.replace('+', '-').replace('/', '_').replace('=', ',');
};

exports.btoa = function(str) {
  var res = new Buffer(str, 'base64').toString('ascii');
  return res.replace('-', '+').replace('_', '/').replace(',', '=');
};

exports.propsMatch = function (obj1, obj2) {
  return R.difference(Object.keys(obj1), Object.keys(obj2)).length === 0;
};

exports.propsDontMatch = function (obj1, obj2) {
  return ! exports.propsMatch(obj1, obj2);
};

exports.propsExist = function (obj1, obj2) {
  return R.difference(Object.keys(obj1), Object.keys(obj2)).length > 0;
};

exports.propsDontExist = function (obj1, obj2) {
  return ! propsExist(obj1, obj2);
};

exports.hasProp = function (obj, prop) {
  return obj.hasOwnProperty(prop);
};

exports.getLinks = function(entity) {
  var states = R.filter(function(m) { return m.startsWith('state_'); }, Object.keys(entity));
  for (var i = 0; i < states.length; i++) {
    var links = entity[states[i]]();
    if (links !== false) {
      return links;
    }
  }
  throw { statusCode: 500, message: 'Internal Server Error (invalid links?'};
};

exports.isApiCall = function(request) { return request.url.indexOf('/api') !== -1; };
exports.hasBody = function(method) { return method === 'POST' || method === 'PUT' || method === 'PATCH'; };

exports.getObjType = function(obj){
  var text = Function.prototype.toString.call(obj.constructor);
  return text.match(/function (.*)\(/)[1];
};

exports.getFnName = function(func) {
  var isFunc = typeof func == 'function';
  var s = isFunc && ((func.name && ['', func.name]) || func.toString().match(/function ([^\(]+)/));
  return (!isFunc && 'not a function') || (s && s[1] || 'anonymous');
};

exports.getTokens = function(url) {
  var path = url.substring(url.indexOf('api'), url.length);
  return trimLeftAndRight(path, '/').split('/');
};

exports.extend = function(proto, literal) {
    var result = Object.create(proto);
    Object.keys(literal).forEach(function(key) {
        result[key] = literal[key];
    });
    return result;
};

// Monad(a), (a -> b) -> Monad(b)
function mapM(monad, transformation) {
  return monad.chain(function(value) {
    return transformation(value);
  });
}

exports.run = function(f, data) { return mapM(Either.of(data), f).orElse(function(err) {return err.swap().get();});};

exports.runAll = function(ctx, handlers) {
  var result = Either.of(ctx);
  handlers.forEach(function(handler) { result = mapM(result, handler.func); });
  return result.orElse(function(err) {return err;});
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: fn.js');

  expect(10 > 2).to.be(true);
