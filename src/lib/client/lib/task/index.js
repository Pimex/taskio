'use strict'

import Boom from 'boom'
import request from 'request-promise'

module.exports = (self) => {
  const baseUrl = `${self.baseUrl}/tasks`
  const config = self.config

  return {
    async add (data, urlServer = false) {
      try {
        const res = await request({
          uri: `${baseUrl}`,
          method: 'POST',
          json: true,
          body: data
        })

        return this.response(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async update (id, data) {
      try {
        const res = await request({
          uri: `${baseUrl}/${id}`,
          method: 'PUT',
          json: true,
          body: data
        })

        return this.response(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async get (id) {
      try {
        const res = await request({
          uri: `${baseUrl}/${this.id}`,
          method: 'GET',
          json: true
        })

        return this.response(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async getAll () {
      try {
        const res = await request({
          uri: `${baseUrl}`,
          method: 'GET',
          json: true
        })

        return this.response(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async delete (id) {
      try {
        const res = await request({
          uri: `${baseUrl}/${id}`,
          method: 'DELETE',
          json: true
        })

        return this.response(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async execMonitor (query = null) {
      try {
        const res = await request({
          uri: `${baseUrl}/monitor`,
          method: 'POST',
          json: true,
          body: query
        })

        return Promise.resolve(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async response (res) {
      try {
        if (config.response !== 'all') {
          res = res.data
        }

        return Promise.resolve(res)
      } catch (error) {
        return this.error(error)
      }
    },

    async error (e) {
      try {
        e = e.error

        return Promise.reject(new Boom(e.message, {
          statusCode: e.statusCode
        }))
      } catch (e) {
        return Promise.reject(new Boom(e))
      }
    }
  }
}
