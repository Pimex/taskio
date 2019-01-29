'use strict'

import Boom from 'boom'

class Account {
  constructor (id) {
    this.id = id
  }

  async get () {
    try {
      return Promise.resolve({
        test: true
      })
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }
}

module.exports = Account
