'use strict'

import Boom from 'boom'
import Request from '../../../request'

module.exports = (webhook) => {
  return {
    async getAll () {
      try {
        const requests = await Request.getAll({
          webhook: webhook.id
        })

        return Promise.resolve(requests)
      } catch (e) {
        return Promise.reject(new Boom(e))
      }
    },

    async removeAll () {
      try {
        const requests = await Request.getAll({
          webhook: webhook.id
        })

        if (requests.length > 0) {
          for (let i in requests) {
            const r = requests[i]
            const req = new Request(r.id)
            await req.delete()
          }
        }

        return Promise.resolve(requests)
      } catch (e) {
        return Promise.reject(new Boom(e))
      }
    }
  }
}
