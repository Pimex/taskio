'use strict'

import getfig from 'getfig'
import Boom from 'boom'
import { MongoClient } from 'mongodb'
import Utils from '../utils'

const config = getfig.get('modules.db')
let instance = false

class Db {
  constructor ({ collection, dbName = null, host = null }) {
    const client = Db.connect({
      host,
      dbName
    })

    this.collection = collection
    this.dbName = dbName
    this.client = client
  }

  static getUrl ({ host = null, dbName = null, url = null }) {
    try {
      url = url || config.url

      if (!url) {
        dbName = dbName || config.dbName
        host = host || config.host
        url = `mongodb://${host}/${dbName}`
      }

      return url
    } catch (e) {
      return new Boom(e)
    }
  }

  async getInstance (data = {}) {
    try {
      let client = null

      if (!instance) {
        client = await this.client
        const db = await client.db()
        instance = db
      }

      return Promise.resolve(instance)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static init (data = {}) {
    try {
      return new Db(data)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async connect (data = {}) {
    try {
      const url = Db.getUrl(data)
      const i = await MongoClient.connect(url, { useNewUrlParser: true })

      return Promise.resolve(i)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async getAll (query = {}) {
    try {
      const res = await this.db.collection(this.collection).find(query).toArray()
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async add (data) {
    try {
      if (!data || typeof data !== 'object') throw Boom.notFound('data not found or invalid')

      const db = await this.getInstance()

      data.id = Db.keyGen()
      await db.collection(this.collection).insertOne(data)
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async update (id, data) {
    try {
      if (!data || typeof data !== 'object') throw Boom.notFound('data not found or invalid')

      const db = await this.getInstance()
      const item = await this.get(id)

      await db.collection(this.collection).updateOne({ id: item.id }, { $set: data })

      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async get (id) {
    try {
      if (!id) throw Boom.notFound('id not found or invalid')

      const db = await this.getInstance()

      const res = await db.collection(this.collection).find({ id: id }).toArray()

      if (res.length <= 0) throw Boom.notFound('id not found')

      return Promise.resolve(res[0])
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async delete (id) {
    try {
      const db = await this.getInstance()
      const item = await this.get(id)

      await db.collection(this.collection).deleteOne({
        id: id
      })

      return Promise.resolve(item)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static keyGen (as = 'random') {
    const alphabet = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
    let lastTimestamp = 0
    let timestamp = Date.now()
    let result = new Array(9)

    if (timestamp <= lastTimestamp) {
      timestamp = lastTimestamp + 1
    }

    lastTimestamp = timestamp

    for (let i = 7; i >= 0; --i) {
      result[i] = alphabet.charAt(timestamp % 64)
      timestamp = Math.floor(timestamp / 64)
    }

    if (timestamp !== 0) {
      throw new Error('Unexpected timestamp.')
    }

    switch (as) {
      case 'max':
        result[8] = 'zzzzzzzzzzzz'
        break
      case 'min':
        result[8] = '------------'
        break
      default:
        result[8] = Utils.randomString(12, alphabet)
    }

    return result.join('')
  }
}

module.exports = Db
