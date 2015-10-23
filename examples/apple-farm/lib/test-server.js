//---------------------------------------------------------------------------------
//- tests server
//---------------------------------------------------------------------------------
'use strict';

var halson = require('halson');
var expect = require('expect.js');
var fn = require('./fn');
var httpRequest = require('./http-mock').request;
var httpResponse = require('./http-mock').response;
var log = console.log;

exports.create = function (pipeline) {
  return {
    get: function get(url, headers) {
      var request = new httpRequest('GET', url, {}, headers);
      var response = new httpResponse();
      pipeline.process(request, response);
      var result = halson(response.body);
      // let result = response.body
      return { data: result, statusCode: response.statusCode };
    },

    cmd: function cmd(method, url, newResource, headers) {
      var request = new httpRequest(method, url, newResource, headers);
      var response = new httpResponse();
      pipeline.process(request, response);
      var result = halson(response.body);
      // let result = response.body
      return { data: result, statusCode: response.statusCode };
    }
  };
};