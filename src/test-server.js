//---------------------------------------------------------------------------------
//- tests server
//---------------------------------------------------------------------------------
const halson = require('halson')
const expect = require('expect.js')
const fn = require('./fn')
const httpRequest = require('./http-mock').request
const httpResponse = require('./http-mock').response
const log = console.log

exports.create = function(pipeline) {
  return {
    get(url, headers) {
      let request = new httpRequest('GET', url, {}, headers)
      let response = new httpResponse()
      pipeline.process(request, response)
      return { data: halson(response.body), statusCode: response.statusCode }
    },

    cmd(method, url, newResource, headers) {
      let request = new httpRequest(method, url, newResource, headers)
      let response = new httpResponse()
      pipeline.process(request, response)
      return { data: halson(response.body), statusCode: response.statusCode }
    }
  }
}

