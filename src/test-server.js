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
      let result = halson(response.body)
      return { data: result, statusCode: response.statusCode }
    },

    cmd(resource, rel, newResource, headers) {
      let link = resource.getLink(rel)
      let request = new httpRequest(link.method, link.href, newResource, headers)
      let response = new httpResponse()
      pipeline.process(request, response)
      let result = halson(response.body)
      return { data: result, statusCode: response.statusCode }
    }
  }
}

