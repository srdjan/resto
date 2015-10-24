//---------------------------------------------------------------------------------
//- tests server
//---------------------------------------------------------------------------------
const halson = require('halson')
const expect = require('expect.js')
const fn = require('./fn')
const log = console.log

exports.createEndPoint = function(pipeline) {
  return {
    GET(url, headers) {
      return httpCmd('GET', url, {}, headers, pipeline)
    },
    POST(url, headers, newResource) {
      return httpCmd('POST', url, newResource, headers, pipeline)
    },
    PUT(url, headers, newResource) {
      return httpCmd('PUT', url, newResource, headers, pipeline)
    },
    DELETE(url, headers) {
      return httpCmd('DELETE', url, {}, headers, pipeline)
    }
  }
}

function httpCmd(method, url, newResource, headers, pipeline) {
  let request = new Request(method, url, newResource, headers)
  let ctx = { hal: false, statusCode: 200, result: {} }
  ctx = pipeline.process(request, ctx)
  return { data: halson(ctx.result), statusCode: ctx.statusCode }
}

//note: taken from: https://github.com/vojtajina/node-mocks
var Request = function(method, url, body, headers) {
  this.method = method
  this.url = url
  this.body = body || {}
  this.headers = headers || {}
}

var Response = function() {
  let bodySent = false
  this.headers = {}
  this.body = null
  this.statusCode = null

  this.setHeader = function(name, value) {
    // if (this.headerSent) {
    //   throw new Error("Can't set headers after they are sent.")
    // }

    this.headers[name] = value
  }

  this.getHeader = function(name) {
    return this.headers[name]
  }

  this.removeHeader = function(name) {
    delete this.headers[name]
  }

  this.writeHead = function(status) {
    // if (this.headerSent) {
    //   throw new Error("Can't render headers after they are sent to the client.")
    // }

    // this.headerSent = true
    this.statusCode = status
  }

  this.write = function(content) {
    if (bodySent) {
      throw new Error("Can't write to already finished response.")
    }
    this.body = this.body ? this.body + content.toString() : content.toString()
  }

  this.end = function(content) {
    if (content) {
      this.write(content )
    }

    bodySent = true
    // this.emit('end')
  }
}
