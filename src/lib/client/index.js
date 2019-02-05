'use strict'

import Boom from 'boom'
import request from 'request-promise'

class Client {
  constructor (idTask, urlServer) {
    this.id = idTask
    this.baseUrl = urlServer
  }

  async addTask (data) {
    try {
      const res = await request({
        uri: `${this.baseUrl}`,
        method: 'POST',
        json: true,
        body: data
      })

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async updateTask (data) {
    try {
      const res = await request({
        uri: `${this.baseUrl}/${this.id}`,
        method: 'POST',
        json: true,
        body: data
      })

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async getTask () {
    try {
      const res = await request({
        uri: `${this.baseUrl}/${this.id}`,
        method: 'GET',
        json: true
      })

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async getAllTask () {
    try {
      const res = await request({
        uri: `${this.baseUrl}`,
        method: 'GET',
        json: true
      })

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async deleteTask () {
    try {
      const res = await request({
        uri: `${this.baseUrl}/${this.id}`,
        method: 'DELETE',
        json: true
      })

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async execMonitorTask (query = null) {
    try {
      const res = await request({
        uri: `${this.baseUrl}/monitor`,
        method: 'POST',
        json: true,
        body: query
      })

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }
}

module.exports = Client
