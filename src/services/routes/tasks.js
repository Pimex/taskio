'use strict'

import Task from '../../lib/task'
import Moment from 'moment'

const routes = [
  /**
   * POST task
  **/
  {
    method: 'POST',
    path: '/tasks',
    handler: async (request, h) => {
      let body = request.payload
      let res

      try {
        const data = await Task.add(body)

        res = {
          data,
          statusCode: 201
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },
  /**
   * PUT task by id
  **/
  {
    method: 'PUT',
    path: '/tasks/{id}',
    handler: async (request, h) => {
      let body = request.payload
      const params = request.params
      let res

      try {
        const task = new Task(params.id)
        const data = await task.update(body)

        res = {
          data,
          statusCode: 201
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },
  /**
   * GET tasks
   * Get all tasks
  **/
  {
    method: 'GET',
    path: '/tasks',
    handler: async (request, h) => {
      const query = request.query
      let res

      try {
        Object.keys(query).forEach((k) => {
          let key = k
          let val = query[key]

          if (typeof val !== 'string') {
            return
          }

          if (val.indexOf(',') > -1) {
            val = val.split(',')
            query[key] = {
              $in: val
            }
          }
        })

        const data = await Task.getAll(query)

        res = {
          data,
          statusCode: 200
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },
  /**
   * GET task by id
  **/
  {
    method: 'GET',
    path: '/tasks/{id}',
    handler: async (request, h) => {
      const params = request.params
      let res

      try {
        const task = new Task(params.id)
        const data = await task.get()

        res = {
          data,
          statusCode: 200
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },
  /**
   * DELETE task by id
  **/
  {
    method: 'DELETE',
    path: '/tasks/{id}',
    handler: async (request, h) => {
      const params = request.params
      const body = request.payload
      let res

      try {
        const task = new Task(params.id)
        const data = await task.delete(body)

        res = {
          data,
          statusCode: 200
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },
  /**
   * POST exec monitor
  **/
  {
    method: 'POST',
    path: '/tasks/monitor',
    handler: async (request, h) => {
      const body = request.payload
      const date = Moment().unix()
      let res

      try {
        let query = body || {
          'reminder.exect_date': {
            $lt: date
          },
          'reminder.state': 'active'
        }

        const data = await Task.monitor(query)

        const expired = await Task.checkExpired()

        res = {
          data,
          expired,
          statusCode: 200
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },
  /**
  * POST - tasks.check.expired
  * Check all expired tasks
  **/
  {
    method: 'POST',
    path: '/tasks/check/expired',
    handler: async (request, h) => {
      let res

      try {
        const expired = await Task.checkExpired()

        res = {
          data: expired,
          statusCode: 200
        }
      } catch (e) {
        request.log('error', e)
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  }
]

module.exports = routes
