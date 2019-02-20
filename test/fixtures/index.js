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
      return {
        title: 'Create a simple task',
        owner: `${uuid.v4()}@test.com`,
        description: 'This is the description for a simple task',
        type: uuid.v4(),
        start_date: Moment().unix(),
        end_date: Moment().add(1, 'days').unix(),
        account: uuid.v4()
      }
    },
    reminder: (whServer = {}) => {
      whServer = defaults(whServer, {
        uri: 'localhost'
      })
      return {
        state: 'active',
        repeat: {
          times: 1
        },
        exect_date: Moment().add(1, 'days').unix(),
        uri: `${whServer.uri}/test`,
        method: 'POST',
        data: {
          test: 'testvalue'
        }
      }
    }
  }
}
