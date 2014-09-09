//---------------------------------------------------------------------------------
//- functions
//---------------------------------------------------------------------------------
var Either = require('data.either');
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

function trimLeftAndRight(str, ch) {
  return str.replace(new RegExp("^[" + ch + "]+"), "").replace(new RegExp("[" + ch + "]+$"), "");
}
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
  return [];
};

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

// f, ep, m(a) -> m(b)
function run(f, ep, m) {
  return m.chain(function(d) {
    var r = f(d);
    return ep(r) ? Either.Left(r) : Either.Right(r);
  });
}
// hs, ep, a -> b | err
exports.runAll = function(hs, ep, d) {
  var m = Either.of(d);
  hs.forEach(function(h) { m = run(h.func, ep, m); });
  return m.merge();
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: fn.js');

  function f1(ctx) {
    if(ctx.counter > 1) {
      ctx.statusCode = 500;
      return ctx;
    }
    ctx.counter += 1;
    return ctx;
  }
  function f2(ctx) {
    if(ctx.counter > 1) {
      ctx.statusCode = 500;
      return ctx;
    }
    ctx.counter += 1;
    return ctx;
  }
  function f3(ctx) {
    if(ctx.counter > 1) {
      ctx.statusCode = 500;
      return ctx;
    }
    ctx.counter += 1;
    return ctx;
  }

  // setup
  var handlers = [];
  handlers.push({ func: f1, pred: false, trace: false});
  handlers.push({ func: f2, pred: false, trace: false});
  handlers.push({ func: f3, pred: false, trace: false});

  // run until failure
  var ctx = {counter: 1, statusCode: 200};
  ctx = exports.runAll(handlers, function(d) {return d.statusCode !== 200;}, ctx);
  expect(ctx.counter).to.be(2);
  expect(ctx.statusCode).to.be(500);
