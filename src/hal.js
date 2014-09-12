//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
var halson = require('halson');
var fn = require('./fn.js');
var log = console.log;

// && Object.keys(prop).length === 1 && isSub(Object.keys(prop)[0])
function isNotFunc(obj) { return !(obj instanceof Function);}
function isObject(obj) { return obj instanceof Object;}
function isEmbed(prop) { return isObject(prop) && prop.hasOwnProperty('has'); }
function isNotEmbed(prop) { return ! isEmbed(prop);}
function isNotId(propName) { return propName !== 'id';}
//--------

function addProperties(halRep, result) {
  var propNames = fn.filter(function(propName) { return isNotId(propName) && isNotEmbed(result[propName]) && isNotFunc(result[propName]); }, Object.keys(result));
  return fn.each(function(propName) { halRep[propName] = result[propName]; }, propNames);
}

function addEmbed(halRep, typeName, result) {
  log(result)
  var embed = halson({}).addLink('self', '/api/' + typeName.toLowerCase() + 's/' + fn.atob(result.id));
  addProperties(embed, result);
  halRep.addEmbed(typeName.toLowerCase() + 's', embed);
}

function addEmbeds(halRep, typeName, result) {
  var propNames = fn.filter(function(propName) { return isNotFunc(result[propName]) && isEmbed(result[propName]); }, Object.keys(result));
  return propNames.forEach(function(propName) { addEmbed(halRep, typeName, result[propName].has); });
}

function addLinks(halRep, typeName, result) {
  halRep.addLink('self', '/api/' + typeName.toLowerCase() + 's/' + fn.atob(result.id));
  var links = result.getLinks();
  links.forEach(function(l) { halRep.addLink(l.rel, { href: '/api/' + typeName + 's/' + fn.atob(result.id + '/' + l.rel), method: l.method}); });
  return halRep;
}

//todo: add paging
function createListRoot(typeName) {
  var halRep = halson({});
  halRep.addLink('self', '/api/' + typeName + 's');
  halRep.addLink('create', { href: '/api/' + typeName + 's/' + fn.atob('create'), method: 'POST'});
  return halRep;
}

function createList(typeName, result) {
  var halRep = createListRoot(typeName.toLowerCase());
  if (result.length > 0) {
    result.forEach(function(el, index, array) { addEmbed(halRep, typeName, el); });
  }
  return halRep;
}

//todo: add resursion (inner resources)
function createResource(ctx) {
  var halRep = halson({});
  addProperties(halRep, ctx.result);
  addLinks(halRep, ctx.typeName, ctx.result);
  addEmbeds(halRep, ctx.typeName, ctx.result);
  return halRep;
}

exports.convert = function convert(ctx) {
  if (ctx.result instanceof Array) {
    ctx.result = createList(ctx.typeName, ctx.result);
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

  var apples = [{
                id: 3333,
                weight: 30,
                color: "red",
                possibleColors: ['green', 'red', 'orange'],
                // checkList: { has: [{id:1, checked: 11}, {id:2,checked: 22}] },
                assigned: { has: { id:33, initials: 'ss'} },
                getLinks: function() {
                                  if (this.weight > 0.0 && this.weight < 200.0) {
                                    return [{ rel: 'grow', method: "POST" },
                                            { rel: 'toss', method: "DELETE"}];
                                  }
                                  return false;
                                }
              },
              {
                id: 4444,
                weight: 40,
                color: "orange",
                possibleColors: ['green', 'red', 'orange'],
                checkList: { has: [{id: 1, checked: 11}, {id: 2, checked: 22}, {id: 3,checked: 33}] },
                assigned: { has: { id: 1, initials: 'pp'} },
                getLinks: function() {
                                  if (this.weight > 0.0 && this.weight < 200.0) {
                                    return [{ rel: 'grow', method: "POST" },
                                            { rel: 'toss', method: "DELETE"}];
                                  }
                                  return false;
                                }
              }
            ];

  //test isEmbed()
  // var result = isEmbed(apples[0].weight);
  // log(Object.keys(apples[0].assigned));
  // log(apples[0].assigned);
  // var result = isObject(apples[0].assigned);
  // log(result);
  // var result = (apples[0].assigned).hasOwnProperty('has');
  // log(result);
  // var result = isEmbed(apples[0].assigned);
  // log(result);

  //- get all - when result is one obj
  //-----------------------------------
  var ctx = {
    typeName: 'Apple',
    result: apples[0]
  };
  var res = exports.convert(ctx);
  log(res);

  //- get all - when result is array
  //-----------------------------------
  // var ctx = {
  //   typeName: 'Apple',
  //   result: apples
  // };
  // var res = exports.convert(ctx);
  // log(res);
