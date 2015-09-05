const pipeline      = require('./lib/pipeline')
const authenticator = require('./lib/authn').auth
const authorizer    = require('./lib/authr').auth
const resolver      = require('./lib/resolver').resolve
const invoker       = require('./lib/invoker').invoke
const converter     = require('./lib/hal').convert
const server        = require('./lib/server')
const appleResource = require('./resources/apple')

const reqHandler = pipeline.expose(appleResource)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter)

const endPoint = server.create(reqHandler)
endPoint.start(8080)
