'use strict'

import getfig from 'getfig'
import Boom from 'boom'
import { MongoClient } from 'mongodb'

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
      const res = await this.db.collection(this.collection).insertOne(data)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }
}

module.exports = Db
