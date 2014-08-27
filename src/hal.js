//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var halson = require('halson');
var log = console.log;

var getPropNames = fn.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; });

function createFull(result) {
  var links = fn.getLinks(result.data);
  var halRep = addRootProps(result);
  fn.each(function(el) {
    halRep.addLink(el.rel, { href: '/api/' + result.name + 's/' + fn.atob(result.data.id + '/' + el.rel), method: el.method });
  }, links);
  return halRep;
}

function addRootProps(result) {
  var root = {};
  fn.each(function(propName) { root[propName] = result.data[propName]; }, getPropNames(Object.keys(result.data)));
  return halson(JSON.stringify(root)).addLink('self', '/api/' + result.name + 's/' + fn.atob(result.data.id));
}

function createRoot(typeName) {
  var root = halson({})
      .addLink('self', '/api/' + typeName + 's')
      .addLink('create', { href: '/api/' + typeName + 's/' + fn.atob('create'), method: 'POST'});
  return root;
}

function convert(result) {
 if (result.data instanceof Array) {
    var halRep = createRoot(result.name);
    var embeds = fn.map(function(e) { return halson({}).addLink('self', '/api/' + result.name + 's/' + fn.atob(e.id)); },
                                result.data);
    fn.each(function(el, index, array) { halRep.addEmbed(result.name + 's', el); }, embeds);
    return halRep;
  }
  if (Object.keys(result.data).length === 0) return createRoot(result.name);
  return createFull(result);
}

exports.toHal = function(ctx) {
  var halRep = convert(ctx.result);
  ctx.resp.writeHead(ctx.result.statusCode, {"Content-Type": "application/json"});
  ctx.resp.write(JSON.stringify(halRep));
  ctx.resp.end();
  return ctx;
};

