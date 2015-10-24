//---------------------------------------------------------------------------------
//- http-server
//---------------------------------------------------------------------------------
const http = require("http")
const file = require("./file-helper")
const fn   = require('./fn')
const log  = console.log

function writeToResp(response, ctx) {
  let contentType = ctx.hal ? {"Content-Type": "application/hal+json"} :
                               {"Content-Type": "application/json" }
  response.writeHead(ctx.statusCode, contentType)
  response.write(JSON.stringify(ctx.result))
  response.end()
}

function process(request, response, pipeline) {
  let ctx = { hal: false, statusCode: 200, result: {} }

  try {
    if (fn.hasBody(request.method)) {
      let body = ''
      request.on('data', chunk => body += chunk.toString())
      request.on('end', () => {
        request.body = JSON.parse(body)
        ctx = pipeline.process(request, ctx)
        writeToResp(response, ctx)
      })
    }
    else {
      ctx = pipeline.process(request, ctx)
      writeToResp(response, ctx)
    }
  }
  catch (e) {
    ctx.statusCode = 500
    if (e.hasOwnProperty('statusCode')) {
      ctx.statusCode = e.statusCode
    }

    ctx.result = 'Fx Exception, statusCode: ' + ctx.statusCode
    if (e.hasOwnProperty('message')) {
      ctx.result += ', Message: ' +  e.message
    }
    writeToResp(response, ctx)
  }
}

exports.createEndPoint = function(pipeline) {
  let server = http.createServer((request, response) => {
                    if (fn.isApiCall(request)) {
                      process(request, response, pipeline)
                    }
                    else {
                      file.get(request, response)
                    }
                  }
                )

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
