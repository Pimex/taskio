'use strict'

const routes = [
  /**
   * GET tasks
   * Get all tasks
   */
  {
    method: 'GET',
    path: '/tasks',
    handler: async (request, h) => {
      let res

      try {
        res = {
          data: [],
          statusCode: 200
        }
      } catch (e) {
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  }
]

module.exports = routes
