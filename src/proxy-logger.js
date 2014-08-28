// http://labs.hyperandroid.com/proxying
//

var ForwardingHandler = require('./forwarding-handler');
var log = console.log;

function startStopwatch() {
  var dt = new Date();
  return dt.getTime();
}

function stopStopwatch(begin) {
  var dt = new Date();
  var end = dt.getTime();
  if (begin === end) {
    end += 1;
  }
  return (end - begin);
}

function getProxy(target, handler) {
  var handlerProxy = Proxy.create(handler);
  var proxy;
  if (typeof target === 'function') {
    proxy = Proxy.createFunction(handlerProxy, Function.prototype.apply.call(target, this, arguments), new target()); // FIXME: need Function.prototype.bind to write a var-args 'new'
  }
  else {
    proxy = Proxy.create(handlerProxy, Object.getPrototypeOf(target));
  }
  return proxy;
}

exports.createTracer = function(target) {
  var fwHandler = new ForwardingHandler(target);
  var stash = [];

  var loggingHandler = {
    get: function (rcvr, trapName) {
      return function (var_args) {
        if (trapName === 'get' && arguments[1] === 'toString') {// trap proxy.toString() to avoid infinite loop:
          return target.toString;
        }

        var begin = startStopwatch();
        var res = fwHandler[trapName].apply(fwHandler, arguments);
        var elapsed = stopStopwatch(begin);

        var trace = {
                      op: trapName,
                      obj: Array.prototype.slice.call(arguments, 0, 1),
                      args: Array.prototype.slice.call(arguments, 1),
                      length: elapsed + 'ms',
                      result: res
                    };
        if (typeof trace.args !== 'function') {
          var head = '[trace-' + target + "]";
          log(head + ': ' + trace.obj + '.' + trace.op + '(' + trace.args + ')' + ' in: ' + trace.length + ' returned: ' + trace.result);
        }
        return res;
      };
    }
  };
  return getProxy(target, loggingHandler);
}

// var tuple = createTracer({
//   toString: function () {
//     return 'tuple';
//   },
//   show: function (key) {
//     log('foo');
//   }
// });

// tuple.foo; //- undefined
// tuple.foo = 42; //- true
// tuple.foo;
// tuple.show('foo');
// 'foo' in tuple;
// delete tuple.foo;
// Object.keys(tuple);
// tuple.show('show');
