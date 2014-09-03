var R = require('ramda');
var Either = require('data.either');
var Failure = Either.Left;
var Success = Either.Right;
var log = console.log;


//-------------------------------------------------------------------------
//-lib
Either.from = function(a) {
  return a !== null || typeof a === 'undefined' ? Success(a)
                                                : Failure(a);
};

function map(monad, transformation) {
  return monad.chain(function(value) {
    return monad.of(transformation(value));
  });
}
// Monad(a), Monad(b), (a, b -> Monad(c)) -> Monad(c)
function lift2M(monadA, monadB, transformation) {
  return monadA.chain(function(valueA) {
    return map(monadB, function(valueB) {
      return transformation(valueA, valueB);
    });
  });
}

// Int, (a1, a2, ..., aN -> b) -> a1 -> a2 -> ... -> aN -> b
function curry(n, f) {
  return function _curryN(as) {
    return function() {
        var args = as.concat([].slice.call(arguments));
        return args.length < n ? _curryN(args)
                               : f.apply(null, args);
  };}([]);
}

//------------------------------------------------------------------------
//-app
var indxs = [1, 2, 3, 4];
var nums = [11, 22, 33, 44];
var pairs = [[1,1], [2,2], [3,3], [4,4]];

// Int, Int -> Either(Error, Int)
function add(a, b) {
  return isNaN(a) || isNaN(b) ? Failure(new Error('Addition of NaN, a:' + a + ' b:' + b))
                                : Success(a + b);
}
// Int, Int -> Either(Error, Int)
function divide(a, b) {
  return isNaN(a) || isNaN(b) || b === 0 ? Failure(new Error('Division by 0, a:' + a + ' b:' + b))
                                         : Success(a / b);
}

// [a], [b] -> Either(Error, Int)
function multi(a, b) {
  return isNaN(a) || isNaN(b) ? Failure(new Error('Multiplication of NaN, a:' + a + ' b:' + b))
                              : Success(a * b);
}

// [a], [b] -> Either(Error, [(a, b)])
function zip(as, bs) {
  return as.length !== bs.length ? Failure(new Error('Can\'t zip lists of different lengths.'))
                                 : Success(pairs);
}

// [Either(Error, Int)] -> Either(Error, Int)
function sum(ns) {
  var res = ns.reduce(add, []);
  return Either.from(res);
}

// [(Int, Int)] -> [Either(Error, Int)]
function dividePairs(nss) {
  return nss.map(function(a, b) {
    return divide(b+1, b+b+1);
  });
}


//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: app-spike-fn.js');

var add1 = curry(add(1));
var add2 = curry(add(2));
var add3 = curry(add(3));

var res = map(Either.from(1), add1)
  .chain(add2)
  .chain(add3)
  .orElse(function(error) {
    console.log('Error when trying to sum the lists: ' + error.message);
  });
log(res);
// var res = map(Either.from(pairs), dividePairs)
//   .chain(sum)
//   .orElse(function(error) {
//     console.log('Error when trying to sum the lists: ' + error.message);
//   });
// log(res);

// var res = map(zip(fives, odds), dividePairs)
//   // .chain(sum)
//   .orElse(function(error) {
//     console.log('Error when trying to sum the lists: ' + error.message);
//   });
// log(res);

