//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
'use strict;'
var fn = require('./fn.js');
var halson = require('halson');
var log = console.log;

var getPropNames = fn.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; });

function addRootProps(typeName, entity) {
  var root = {};
  fn.each(function(propName) { root[propName] = entity[propName]; }, getPropNames(Object.keys(entity)));
  return halson(JSON.stringify(root)).addLink('self', '/api/' + typeName + 's/' + fn.atob(entity.id));
}

function createRoot(typeName) {
  var root = halson({})
      .addLink('self', '/api/' + typeName + 's')
      .addLink('create', { href: '/api/' + typeName + 's/' + fn.atob('create'), method: 'POST'});
  return root;
}

function createFull(typeName, entity) {
  var links = exports.getLinksForCurrentState(entity);
  var halRep = addRootProps(typeName, entity);
  fn.each(function(el) {
    halRep.addLink(el.rel, { href: '/api/' + typeName + 's/' + fn.atob(entity.id + '/' + el.rel), method: el.method });
  }, links);
  return halRep;
}

exports.getLinksForCurrentState = function(entity) {
  var states = fn.filter(function(m) { return m.startsWith('state_') }, Object.keys(entity));
  for (var i = 0; i < states.length; i++) {
    var links = entity[states[i]]();
    if (links !== false) {
      return links;
    }
  }
  throw { statusCode: 500, message: 'Internal Server Error', log: 'Invalid state invariants: ' + JSON.stringify(entity) };
}

exports.convert = function(typeName, data) {
  if (data instanceof Array) {
    var halRep = createRoot(typeName);
    var embeds = fn.map(function(e) { halson({}).addLink('self', '/api/' + typeName + 's/' + fn.atob(e.id)); }, data);
    fn.each(function(el, index, array) { halRep.addEmbed(typeName + 's', el); }, embeds);
    return halRep;
  }
  return createFull(typeName, data);
}
