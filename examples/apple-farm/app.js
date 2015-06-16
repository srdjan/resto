const pipeline      = require('../../src/pipeline')
const authenticator = require('../../src/authn').auth
const authorizer    = require('../../src/authr').auth
const resolver      = require('../../src/resolver').resolve
const invoker       = require('../../src/invoker').invoke
const converter     = require('../../src/hal').convert
const http          = require('../../src/server')

const apple         = require('./resources/apple')
const log           = console.log

const appleResource = apple

const reqResp = pipeline.expose(appleResource)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter)

const EndPoint = http.create(reqResp)
EndPoint.start(8070)
