'use strict'

import getfig from 'getfig'
import Boom from 'boom'
import { MongoClient } from 'mongodb'
import Utils from '../utils'

const config = getfig.get('modules.db')
let instance = false

class Db {
  constructor ({ collection, dbName, client = false }) {
    if (!dbName) throw Boom.notFound('DB name not found or invalid')
    this.collection = collection
    this.dbName = dbName
    this.client = client || instance
    this.db = this.client.db()
  }

  static async init ({ collection, dbName }) {
    try {
      const client = await Db.connect()
      return Promise.resolve(new Db({ collection, dbName, client }))
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async connect (url = config.url) {
    try {
      const i = await MongoClient.connect(url, { useNewUrlParser: true })
      instance = i
      return Promise.resolve(instance)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }
  
  async getAll (query = {}) {
    try {
      const res = await this.db.collection(this.collection).find(query).toArray()
      return Promise.resolve(res)
    } catch (error) {
      console.log(error)
      return Promise.reject(new Boom(error))
    }
  }

  async add (data) {
    try {
      data.id = Db.keyGen()
      const res = await this.db.collection(this.collection).insertOne(data)
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async update () {
    try {
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async get (id) {
    try {
      if (!id) throw Boom.notFound('id not found or invalid')

      const res = await this.db.collection(this.collection).find({ id: id }).toArray()

      if (res.length <= 0) throw Boom.notFound('id not found')

      return Promise.resolve(res[0])
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async delete (id) {
    try {
      const item = await this.get(id)

      await this.db.collection(this.collection).deleteOne({
        id: id
      })

      return Promise.resolve(item)
    } catch (error) {
      console.log(error)
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
