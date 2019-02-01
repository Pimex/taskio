'use strict'

import Boom from 'boom'
import Db from '../db'
import schemaTemplate from './schema'
import { Schema } from 'schemio'
import Moment from 'moment'
import Request from '../request'
import $request from 'request-promise'

const db = Db.init({ dbName: 'db_taskio', collection: 'task' })

class Task {
  constructor (id) {
    this.id = id
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

  async update (data) {
    try {
      data = Schema.validate(data, schemaTemplate.update)

      let res = await db.update(this.id, data)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async get () {
    try {
      if (!this.id) throw Boom.notFound('Task id not found or invalid')

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

  async execute () {
    let resExec = {}

    let task = await db.get(this.id)

    if (task.req.webhook) {
      const webhook = task.req.webhook
      try {
        webhook.json = true
        webhook.resolveWithFullResponse = true
        resExec = await $request(webhook)
        resExec = {
          headers: resExec.headers,
          statusCode: resExec.statusCode,
          body: resExec.body
        }
      } catch (error) {
        resExec = error
      }
      try {
        let res = await Request.add({
          statusCode: resExec.statusCode,
          method: webhook.method,
          task: task.id,
          payload: webhook,
          response: resExec
        })
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(new Boom(error))
      }
    }
  }
}

module.exports = Task
