var R = require('ramda');
var Either = require('data.either');
var Failure = Either.Left;
var Success = Either.Right;
var log = console.log;

// //  read : ctx -> Either(Error, String)
function process(f, ctx) {
  return ctx.statusCode === 200 ? Success(f(ctx))
                                : Failure("Error: " + ctx.statusCode);
}

var resolve = function(ctx) {
  log('resolve');
  ctx.val = 1;
};
var invoke = function(ctx) {
  log('invoke');
  ctx.statusCode = 300;
};
var convert = function(ctx) {
  log('convert');
  ctx.statusCode = 3;
};
var stash = [];
stash.push(resolve);
stash.push(invoke);
stash.push(convert);

var ctx = {statusCode:200};
stash.forEach(function(h) {
  var r = process(h, ctx).orElse(log);
});

// function concatenate(monadA, monadB) {
//   // We take the value of the `monadA`
//   return monadA.chain(function(valueA) {
//     // And the value of the `monadB`
//     return monadB.chain(function(valueB) {
//       // And place the concatenated value in a new monad of the same type as the `monadB`
//       // The `of` operator allows us to put things inside a monad.
//       return monadB.of(valueA + valueB);
//     });
//   });
// }
// var resolve = process(function(ctx) {log(ctx.val =1);}, {statusCode:200});  // => Right(...)
// var invoke = process(function(ctx) {log(ctx.val = 2);}, {statusCode:404});  // => Right(...)
// var convert = process(function(ctx) {log(ctx.val = 3);}, {statusCode:300});  // => Right(...)
// var pipeline = concatenate(resolve, invoke);
// pipeline = concatenate(pipeline, convert);
// pipeline.orElse(log);

// //  read : ctx -> Either(Error, String)
// function resolve(ctx) {
//   return ctx.statusCode === 200 ? Success(function(ctx) {ctx.val = 1;})
//                                 : Failure("Error: " + ctx.statusCode);
// }
// function invoke(ctx) {
//   return ctx.statusCode === 200 ? Success(function(ctx) {ctx.val = 2;})
//                                 : Failure("Error: " + ctx.statusCode);
// }
// // var pipeline = R.pipe(resolve, invoke);
// // log(pipeline({statusCode:200}).orElse(log));

// // var resolve = process(function(ctx) {log(ctx.val =1);}, {statusCode:200});  // => Right(...)
// // var invoke = process(function(ctx) {log(ctx.val = 2);}, {statusCode:404});  // => Right(...)
// // var convert = process(function(ctx) {log(ctx.val = 3);}, {statusCode:300});  // => Right(...)
// var pipeline = concatenate(resolve({statusCode:200}), invoke({statusCode:200}));
// // pipeline = concatenate(pipeline, convert);
// // pipeline.orElse(log);

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: spike-railway.js');

