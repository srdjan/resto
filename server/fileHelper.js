//---------------------------------------------------------------------------------
//- file helper
//---------------------------------------------------------------------------------
"use strict"

const path = require("path")
const fs   = require("fs")
const url  = require("url")
const fn   = require('../core').fn
const log  = console.log

function getFile(fileName, response) {
  fs.readFile(fileName, "binary", (err, file) => {
    if (err) {
      response.writeHead(500, {"Content-Type": "text/plain"})
      response.write(err + "\n")
    }
    else {
      response.writeHead(200)
      response.write(file, "binary")
    }
    response.end()
  })
}

exports.get = function(request, response) {
  let hostname = url.parse(request.url, false, true).hostname
  let pathname = url.parse(request.url).pathname
  pathname = fn.trimLeftAndRight(pathname, '/')
  if(hostname !== null && hostname !== 'hal-browser') pathname = pathname.slice(hostname.length)

  let tokens = []
  if(pathname.length > 0) tokens = pathname.split('/')

  if(tokens.length === 0) {
    tokens.push('hal-browser')
    tokens.push('index.html')
  }

  let fileName = path.join(process.cwd(), tokens.join('/'))
  fs.exists(fileName, exists => {
    if (exists) {
      return getFile(fileName, response)
    }
    log('Not found, hostname: ' + hostname + ' pathname: ' + pathname + ' fileName: ' + fileName)
    response.writeHead(404, {"Content-Type": "application/json"})
    response.end()
  })
}
