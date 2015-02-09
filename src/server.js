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
              server.listen(port)
              log("Apple Farm Service running at port: " + port + "\nCTRL + SHIFT + C to shutdown")
              return this
            }
    //todo: add stop,restart
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
