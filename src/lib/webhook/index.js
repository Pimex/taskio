'use strict'

const Boom = require('boom')
const Db = require('../db')
const schemaTemplate = require('./schema')
const { Schema } = require('schemio')
const Moment = require('moment')
const Request = require('../request')
const lib = require('./lib')

const db = Db.init({ dbName: 'db_taskio', collection: 'webhooks' })

class Webhook {
  constructor (id) {
    if (!id) throw Boom.notFound('WebHook id not found or invalid')

    this.id = id
    this.req = lib.req(this)
  }

  static async add (data) {
    try {
      data._created = Moment().unix()
      data._updated = data._created
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
      data._updated = Moment().unix()
      data = Schema.validate(data, schemaTemplate.update)

      let res = await db.update(this.id, data)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async get () {
    try {
      let res = await db.get(this.id)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async delete () {
    try {
      let res = await db.delete(this.id)

      await this.req.removeAll()

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async send () {
    try {
      const whData = await this.get()
      whData.webhook = whData.id

      const rq = await Request.send(whData)

      return Promise.resolve(rq)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }
}

module.exports = Webhook
