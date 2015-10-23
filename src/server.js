//---------------------------------------------------------------------------------
//- http-server
//---------------------------------------------------------------------------------
const http = require("http")
const file = require("./file-helper")
const fn   = require('./fn')
const log  = console.log

exports.create = function(pipeline) {
  let server = http.createServer((request, response) => {
                      if (fn.isApiCall(request)) {
                        processApi(pipeline, request, response)
                      }
                      else {
                        file.get(request, response)
                      }
                    })
  return {
    start(port) {
              server.port = port;
              server.listen(server.port)
              log("API running at port: " + port + "\nCTRL + SHIFT + C to shutdown")
              return this
            },
    stop() {
              server.stop()
              log("API at port: " + server.port + "stopping...")
              return this
            }
  }
}

function processApi(pipeline, request, response) {
  if (fn.hasBody(request.method)) {
    let body = ''
    request.on('data', chunk => body += chunk.toString())
    request.on('end', () => {
      request.body = JSON.parse(body)
      pipeline.process(request, response)
    })
  }
  else {
    pipeline.process(request, response)
  }
}
