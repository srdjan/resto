//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
var halson = require('halson');
var fn = require('./fn.js');
var log = console.log;

function addSelfLink(hal, href) {
  return hal.addLink('self', href);
}

function addLink(hal, rel, href, method) {
  return hal.addLink(rel, { href: href, method: method });
}

function addLinks(halRep, ctx) {
  var links = fn.getLinks(ctx.result);
  fn.each(function(l) {
      addLink(halRep, l.rel, '/api/' + ctx.typeName + 's/' + fn.atob(ctx.result.id + '/' + l.rel), l.method);
    }, links);
  return halRep;
}

function addProperties(halRep, result) {
  var propNames = fn.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; }, Object.keys(result));
  return fn.each(function(p) { halRep[p] = result[p]; }, propNames);
}

function createRoot(typeName) {
  var halRep = halson({});
  addSelfLink(halRep, '/api/' + typeName + 's');
  addLink(halRep, 'create', '/api/' + typeName + 's/' + fn.atob('create'), 'POST');
  return halRep;
}

function createList(ctx) {
  var halRep = createRoot(ctx.typeName.toLowerCase());
  if (ctx.result.length > 0) {
    ctx.result.forEach(function(el, index, array) {
        var link = addSelfLink(halson({}), '/api/' + ctx.typeName.toLowerCase() + 's/' + fn.atob(el.id));
        halRep.addEmbed(ctx.typeName.toLowerCase() + 's', link);
      }
    );
  }
  return halRep;
}

function createOne(ctx) {
  var halRep = halson({});
  addProperties(halRep, ctx.result);
  addSelfLink(halRep, '/api/' + ctx.typeName.toLowerCase() + 's/' + fn.atob(ctx.result.id));
  addLinks(halRep, ctx);
  return halRep;
}

exports.toHal = function toHal(ctx) {
  // if (fn.plainJsonObj(ctx.rel)) {
  //   ctx.resp.writeHead(ctx.result.statusCode, {"Content-Type": "application/json"});
  //   ctx.resp.write(JSON.stringify(ctx.result));
  //   ctx.resp.end();
  //   return ctx;
  // }

  var halRep;
  if (ctx.result instanceof Array) {
    halRep = createList(ctx);
  }
  else {
    halRep = createOne(ctx);
  }

  ctx.resp.writeHead(ctx.statusCode, {"Content-Type": "application/hal+json"});
  ctx.resp.write(JSON.stringify(halRep));
  ctx.resp.end();
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: hal.js');

  expect(10 > 2).to.be(true);
  //- get all - when result empty set
  //-----------------------------------
  // var ctx = {
  //   result: { name: 'Apple', data: [] },
  //   resp: {
  //     data: '',
  //     writeHead: function() {},
  //     write: function(hal) { this.data = hal;},
  //     end: function() {}
  //   }
  // };
  // var res = exports.toHal(ctx);
  // log(res);

  //- get all - when result on obj
  //-----------------------------------
  // var ctx = {
  //   result: { name: 'Apple', data: {
  //                                   weight: 10,
  //                                   color: "red",
  //                                   state_growing: function() {
  //                                                     if (this.weight > 0.0 && this.weight < 200.0) {
  //                                                       return [{ rel: 'grow', method: "POST" },
  //                                                               { rel: 'toss', method: "DELETE"}];
  //                                                     }
  //                                                     return false;
  //                                                   }
  //                                   }
  //                               },
  //   resp: {
  //     data: '',
  //     writeHead: function() {},
  //     write: function(hal) { this.data = hal;},
  //     end: function() {}
  //   }
  // };
  // var res = exports.toHal(ctx);
  // log(res);
