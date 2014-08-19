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

exports.createRoot = function(typeName) {
  var root = halson({})
      .addLink('self', '/api/' + typeName + 's')
      .addLink('create', { href: '/api/' + typeName + 's/' + fn.atob('create'), method: 'POST'});
  return root;
}

exports.createFull = function(typeName, entity, links) {
  var halRep = addRootProps(typeName, entity);
  fn.each(function(el) {
    halRep.addLink(el.rel, { href: '/api/' + typeName + 's/' + fn.atob(entity.id + '/' + el.rel), method: el.method });
  }, links);
  return halRep;
}

exports.addEmbeds = function(typeName, halRep, entities) {
  var embeds = fn.map(function(e) { halson({}).addLink('self', '/api/' + typeName + 's/' + fn.atob(e.id)); }, entities);
  fn.each(function(el, index, array) { halRep.addEmbed(typeName + 's', el); }, embeds);
  return halRep;
}

