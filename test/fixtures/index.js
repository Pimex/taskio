'use strict'

import Hapi from 'hapi'
import Moment from 'moment'
import uuid from 'uuid'
import defaults from 'defaults'

module.exports = {
  webhook: {
    async server () {
      const server = Hapi.server({
        host: '0.0.0.0'
      })

      server.route({
        method: '*',
        path: '/{params*}',
        handler: (request, h) => {
          const res = {
            payload: request.payload,
            params: request.params,
            query: request.query,
            headers: request.headers
          }

          return h.response(res).code(200)
        }
      })

      await server.start()

      return server.info
    }
  },
  task: {
    data: (whServer = {}) => {
      whServer = defaults(whServer, {
        uri: 'localhost'
      })
      return {
        title: 'Create a simple task',
        owner: `${uuid.v4()}@gmail.com`,
        description: 'This is the description for a simple task',
        type: uuid.v4(),
        reminder: {
          state: 'active',
          repeat: {
            times: 1
          },
          exect_date: Moment().add(1, 'days').unix(),
          req: {
            webhook: {
              uri: `${whServer.uri}/test`,
              method: 'POST',
              body: {
                title: 'Test task webhook title',
                description: 'Add new task in your list'
              }
            }
          }
        }
      }
    }
  }
}
