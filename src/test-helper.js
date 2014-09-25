//---------------------------------------------------------------------------------
//- tests helper
//---------------------------------------------------------------------------------
var halson = require('halson');
var expect = require('expect.js');
var fn = require('./fn');
var httpRequest = require('./http-mock').request;
var httpResponse = require('./http-mock').response;
var pipeline = require('./pipeline');

exports.get = function get(url) {
  var request = new httpRequest('GET', url);
  var response = new httpResponse();
  pipeline.process(request, response);
  var result = halson(response.body);
  return { data: result, statusCode: response.statusCode };
};

exports.cmd = function cmd(resource, rel, newResource) {
  var link = resource.getLink(rel);
  var request = new httpRequest(link.method, link.href, newResource);
  var response = new httpResponse();
  pipeline.process(request, response);
  var result = halson(response.body);
  return { data: result, statusCode: response.statusCode };
};

