'use strict'

import Boom from 'boom'
import Db from '../db'
import schemaTemplate from './schema'
import { Schema } from 'schemio'
import Moment from 'moment'
import request from 'request'

const db = Db.init({ dbName: 'db_taskio', collection: 'requests' })

class Request {
  constructor (id) {
    this.id = id
  }

  static async send (data) {
    let res = {}

    data.method = data.method || 'GET'
    data.uri = data.uri || data.url

    try {
      data = Schema.validate(data, schemaTemplate.send)

      res = await new Promise((resolve, reject) => {
        request(data, (err, res) => {
          if (err) {
            resolve(err)
          }

          resolve({
            headers: res.headers,
            statusCode: res.statusCode,
            body: res.body
          })
        })
      })

      let req = await Request.add({
        statusCode: res.statusCode,
        headers: data.headers,
        method: data.method,
        payload: data.body,
        response: res,
        task: data.task || null,
        webhook: data.task || null
      })

      return Promise.resolve(req)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async add (data) {
    try {
      data._created = Moment().unix()
      data = Schema.validate(data, schemaTemplate.add)

      let res = await db.add(data)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async getAll (query = {}) {
    try {
      let res = await db.getAll(query)

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
}

module.exports = Request
