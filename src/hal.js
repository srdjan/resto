//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var halson = require('halson');
var log = console.log;

function addSelfLink(hal, href) {
  return hal.addLink('self', href);
}

function addLink(hal, rel, href, method) { hal.addLink(rel, { href: href, method: method }); }

function addLinks(halRep, result) {
  var links = fn.getLinks(result.data);
  fn.each(function(l) {
      addLink(halRep, l.rel, '/api/' + result.name + 's/' + fn.atob(result.data.id + '/' + l.rel), l.method);
    }, links);
}

function addProperties(halRep, result) {
  var propNames = fn.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; }, Object.keys(result.data));
  return fn.each(function(p) { halRep[p] = result.data[p]; }, propNames);
}

function createRoot(typeName) {
  var halRep = halson({});
  addSelfLink(halRep, '/api/' + typeName + 's');
  addLink(halRep, 'create', '/api/' + typeName + 's/' + fn.atob('create'), 'POST');
  return halRep;
}

function createList(result) {
  var halRep = createRoot(result.name.toLowerCase());
  if (result.data.length > 0) {
    result.data.forEach(function(el, index, array) {
      var link = addSelfLink(halson({}), '/api/' + result.name.toLowerCase() + 's/' + fn.atob(el.id));
      halRep.addEmbed(result.name.toLowerCase() + 's', link);
    }
    );
  }
  return halRep;
}

function createOne(result) {
  var halRep = halson({});
  addProperties(halRep, result);
  addSelfLink(halRep, '/api/' + result.name + 's/' + fn.atob(result.data.id));
  addLinks(halRep, result);
  return halRep;
}

function toHal(ctx) {
  var halRep;
  if (ctx.result.data instanceof Array) {
      halRep = createList(ctx.result);
  }
  else {
    halRep = createOne(ctx.result);
  }
  ctx.resp.writeHead(ctx.result.statusCode, {"Content-Type": "application/json"});
  ctx.resp.write(JSON.stringify(halRep));
  ctx.resp.end();
  return ctx;
}
module.exports.toHal = toHal;


//- tests

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
