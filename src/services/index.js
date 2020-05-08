'use strict'

const Hapi = require('hapi')
const routes = require('./routes')
const good = require('good')
const defaults = require('defaults')

const portDefault = process.env.PORT || 3000
// const NODE_ENV = process.env.NODE_ENV || null

module.exports = {
  async start (opts = {}) {
    opts = defaults(opts, {
      host: '0.0.0.0',
      port: (opts.port === 'test') ? null : opts.port || portDefault,
      logs: {
        ops: false,
        args: false
      }
    })

    const { port = portDefault, host, logs = null } = opts

    const server = new Hapi.Server({
      host,
      port,
      router: {
        stripTrailingSlash: true
      }
    })

    server.route(routes)

    if (logs) {
      await server.register({
        plugin: good,
        options: {
          ops: logs.ops || false,
          reporters: {
            console: [{
              module: require('./logger'),
              args: (logs.args) ? [logs.args] : []
            },
            'stdout'
            ]
          }
        }
      })
    }

    await server.start()
    server.log('info', `Taskio server start in port: ${port || server.info.port}`)

    return Promise.resolve(server.info)
  }
}
