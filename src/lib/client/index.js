'use strict'

import task from './lib/task'
import defaults from 'defaults'

class Client {
  constructor (urlServer, config = {}) {
    this.baseUrl = `${urlServer}`
    this.config = defaults(config, {
      response: null
    })
    this.task = task(this)
  }
}

module.exports = Client
