'use strict'

const Boom = require('boom')
const Db = require('../db')
const schemaTemplate = require('./schema')
const { Schema } = require('schemio')
const Moment = require('moment')
const request = require('request-promise')

const db = Db.init({ dbName: 'db_taskio', collection: 'requests' })

class Request {
  constructor (id) {
    this.id = id
  }

  static async send (data) {
    let res = {}

    data.method = data.method || 'POST'
    data.uri = data.uri || data.url
    data.qs = data.qs || data.query

    try {
      const rqData = Schema.validate(data, schemaTemplate.send)

      res = await new Promise((resolve, reject) => {
        request(rqData)
          .then(res => {
            resolve({
              headers: res.headers,
              statusCode: res.statusCode,
              body: res.body,
              state: 'success'
            })
          })
          .catch(err => {
            resolve({
              headers: err.response.headers || {},
              statusCode: err.statusCode || 500,
              error: err.error,
              state: 'failed'
            })
          })
      })

      let req = await Request.add({
        url: data.uri,
        statusCode: res.statusCode,
        headers: data.headers,
        method: data.method,
        payload: data.body,
        response: res,
        task: data.task,
        webhook: data.webhook,
        query: data.query,
        state: res.state
      })

      return Promise.resolve(req)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async add (data = {}) {
    try {
      data._created = Moment().unix()
      data = Schema.validate(data, schemaTemplate.add)

      let res = await db.add(data)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async getAll (query = {}, options = {}) {
    try {
      let res = await db.getAll(query, options)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async get () {
    try {
      if (!this.id) throw Boom.notFound('Request id not found or invalid')

      let res = await db.get(this.id)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async delete () {
    try {
      let res = await db.delete(this.id)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async deleteMany (query = {}) {
    try {
      let res = await db.deleteMany(query)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }
}

module.exports = Request
