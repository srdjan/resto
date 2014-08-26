var R = require('ramda');
var log = console.log;

var reqctx = { req: {}, resp: {}};

function func1(reqctx) {
  log('func-1');
  reqctx.resp.result1 += 'func-1';
  return reqctx;
}

function func2(reqctx) {
  log('func-2');
  reqctx.resp.result1 += 'func-2';
  return reqctx;
}

function func3(reqctx) {
  log('func-3');
  reqctx.resp.result1 = 'func-3';
  return reqctx;
}

var pipeline = R.compose(func1, func2, func3);


function server(request, response) {
  log('resp before: ' + JSON.stringify(response));
  var result = pipeline({req: request, resp: response});
  log('resp after: ' + JSON.stringify(response));
}

var result = server({}, {});
