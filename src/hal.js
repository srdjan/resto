//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
var halson = require('halson');
var fn = require('./fn.js');
var log = console.log;

//todo: add paging
function createListRoot(typeName) {
  var halRep = halson({});
  halRep.addLink('self', '/api/' + typeName + 's');
  halRep.addLink('create', { href: '/api/' + typeName + 's/' + fn.atob('create'), method: 'POST'});
  return halRep;
}

function createList(ctx) {
  var halRep = createListRoot(ctx.typeName.toLowerCase());
  if (ctx.result.length > 0) {
    ctx.result.forEach(function(el, index, array) {
        var embed = halson({}).addLink('self', '/api/' + ctx.typeName.toLowerCase() + 's/' + fn.atob(el.id));
        addProperties(embed, el);
        embed = halRep.addEmbed(ctx.typeName.toLowerCase() + 's', embed);
      }
    );
  }
  return halRep;
}

//--------
//todo: add resursive embeds
function addProperties(halRep, result) {
  var propNames = fn.filter(function(p) { return p !== 'id' &&
                                                 !(result[p] instanceof Array) &&
                                                 !(result[p] instanceof Function); }, Object.keys(result));
  return fn.each(function(p) { halRep[p] = result[p]; }, propNames);
}

function addEmbeds(halRep, result) {
   var propNames = fn.filter(function(p) { return p !== 'id' &&
                                                  (result[p] instanceof Array) &&
                                                  !(result[p] instanceof Function); }, Object.keys(result));
  return fn.each(function(p) { halRep[p] = result[p]; }, propNames);
}

function addLinks(halRep, typeName, result) {
  halRep.addLink('self', '/api/' + typeName.toLowerCase() + 's/' + fn.atob(result.id));
  var links = result.getLinks();
  links.forEach(function(l) {
      halRep.addLink(l.rel, { href: '/api/' + typeName + 's/' + fn.atob(result.id + '/' + l.rel), method: l.method});
    });
  return halRep;
}

function createResource(ctx) {
  var halRep = halson({});
  addProperties(halRep, ctx.result);
  // log(halRep);
  addLinks(halRep, ctx.typeName, ctx.result);
  // addEmbeds(halRep, ctx.result);
  return halRep;
}

exports.convert = function convert(ctx) {
  if (ctx.result instanceof Array) {
    ctx.result = createList(ctx);
  }
  else {
    ctx.result = createResource(ctx);
  }
  return ctx;
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: hal.js');

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
  var ctx = {
    typeName: 'Apple',
    result: {
              id: 3333,
              weight: 10,
              color: "red",
              possibleColors: ['green', 'red', 'orange'],
              checkList: { zeroOrMore : [{checked: 1}, {checked: 2}] },
              assigned: { one : { initials: 'ss'} },
              getLinks: function() {
                                if (this.weight > 0.0 && this.weight < 200.0) {
                                  return [{ rel: 'grow', method: "POST" },
                                          { rel: 'toss', method: "DELETE"}];
                                }
                                return false;
                              }
              }
  };
  var res = exports.convert(ctx);
  log(res);
