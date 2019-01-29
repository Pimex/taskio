'use strict'

import Boom from 'boom'

class Task {
  constructor (id) {
    this.id = id
  }

  get () {
    try {
      if (!this.id) throw Boom.notFound('Task id not found or invalid')

      return Promise.resolve({
        res: 200
      })
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }
}

module.exports = Task
