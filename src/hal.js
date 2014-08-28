//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var halson = require('halson');
var log = console.log;

var getPropNames = fn.filter(function(p) { return !p.startsWith('state_') && p !== 'id'; });

function addSelfLink(hal, href) { hal.addLink('self', href); }

function addLink(hal, rel, href, method) { hal.addLink(rel, { href: href, method: method }); }

function addLinks(halRep, result) {
  var links = fn.getLinks(result.data);
  fn.each(function(l) {
      addLink(halRep, l.rel, '/api/' + result.name + 's/' + fn.atob(result.data.id + '/' + l.rel), l.method);
    }, links);
}

function addProperties(full, result) {
  var propNames = getPropNames(Object.keys(result.data));
  return fn.each(function(p) { full[p] = result.data[p]; }, propNames);
}

function createFull(result) {
  var full = halson({});
  addSelfLink(full, '/api/' + result.name + 's/' + fn.atob(result.data.id));
  addProperties(full, result);
  addLinks(full, result);
  return full;
}

function createRoot(typeName) {
  var root = halson({});
  addSelfLink(root, '/api/' + typeName + 's');
  addLink(root, 'create', '/api/' + typeName + 's/' + fn.atob('create'), 'POST');
  return root;
}

function convertArray(result) {
  var halRep = createRoot(result.name);
  var embeds = fn.map(function(e) {
      return addSelfLink(halson({}), '/api/' + result.name + 's/' + fn.atob(e.id)); }, result.data);
  fn.each(function(el, index, array) { halRep.addEmbed(result.name + 's', el); }, embeds);
  return halRep;
}

function convertObject(result) {
  if (Object.keys(result.data).length === 0) {
    return createRoot(result.name);
  }
  return createFull(result);
}

function convert(result) {
  if (result.data instanceof Array) {
    return convertArray(result);
  }
  return convertObject(result);
}

exports.toHal = function(ctx) {
  var halRep = convert(ctx.result);
  ctx.resp.writeHead(ctx.result.statusCode, {"Content-Type": "application/json"});
  ctx.resp.write(JSON.stringify(halRep));
  ctx.resp.end();
  return ctx;
};
