'use strict'

import { Task } from '../../'

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
        const data = await Task.getAll(query)

        res = {
          data,
          statusCode: 200
        }
      } catch (e) {
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
      let res

      try {
        const task = new Task(params.id)
        const data = await task.delete()

        res = {
          data,
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
