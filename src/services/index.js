'use strict'

import Hapi from 'hapi'
import routes from './routes'
import good from 'good'

const portDefault = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || null

module.exports = {
  async start (portCustom, host) {
    const port = (portCustom === 'test') ? null : portCustom || portDefault
    host = host || '0.0.0.0'
    let server = new Hapi.Server({
      host,
      port,
      router: {
        stripTrailingSlash: true
      }
    })

    server.route(routes)

    if (NODE_ENV !== 'test') {
      await server.register({
        plugin: good,
        options: {
          reporters: {
            console: [{
              module: 'good-console'
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
