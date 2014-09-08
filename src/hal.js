//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
var halson = require('halson');
var fn = require('./fn.js');
var log = console.log;

function addLinks(halRep, ctx) {
  var links = fn.getLinks(ctx.result);
  links.forEach(function(l) {
      halRep.addLink(l.rel, { href: '/api/' + ctx.typeName + 's/' + fn.atob(ctx.result.id + '/' + l.rel), method: l.method});
    });
  return halRep;
}

function addProperties(halRep, result) {
  var propNames = fn.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; }, Object.keys(result));
  return fn.each(function(p) { halRep[p] = result[p]; }, propNames);
}

function createRoot(typeName) {
  var halRep = halson({});
  halRep.addLink('self', '/api/' + typeName + 's');
  halRep.addLink('create', { href: '/api/' + typeName + 's/' + fn.atob('create'), method: 'POST'});
  return halRep;
}

function createList(ctx) {
  var halRep = createRoot(ctx.typeName.toLowerCase());
  if (ctx.result.length > 0) {
    ctx.result.forEach(function(el, index, array) {
        var link = halson({}).addLink('self', '/api/' + ctx.typeName.toLowerCase() + 's/' + fn.atob(el.id));
        halRep.addEmbed(ctx.typeName.toLowerCase() + 's', link);
      }
    );
  }
  return halRep;
}

function createOne(ctx) {
  var halRep = halson({});
  addProperties(halRep, ctx.result);
  halRep.addLink('self', '/api/' + ctx.typeName.toLowerCase() + 's/' + fn.atob(ctx.result.id));
  addLinks(halRep, ctx);
  return halRep;
}

exports.convert = function convert(ctx) {
  // log('converter');
  if (ctx.result instanceof Array) {
    ctx.result = createList(ctx);
  }
  else {
    ctx.result = createOne(ctx);
  }
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
