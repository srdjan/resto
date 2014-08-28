var log = console.log;

var p = Proxy.create({
  get: function(proxy, name) {
    return 'Hello, '+ name;
  }
});

log(p.World); // should print 'Hello, World'

//-----------------------------

var simpleHandler = {
  get: function(proxy, name) {
    // can intercept access to the 'prototype' of the function
    if (name === 'prototype') return Object.prototype;
    return 'Hello, '+ name;
  }
};
var fproxy = Proxy.createFunction(simpleHandler,
                                  function() { return arguments[0]; }, // call trap
                                  function() { return arguments[1]; }); // construct trap

log(fproxy(1, 2)); // 1
log(new fproxy(1, 2)); // 2
log(fproxy.prototype); // Object.prototype
log(fproxy('foo')); // 'Hello, foo'
