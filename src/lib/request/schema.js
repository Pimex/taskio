'use strict'

module.exports = {
  add: {
    time: {
      type: 'number',
      require: true
    },
    task: {
      default: null,
      require: true
    },
    statusCode: {
      type: 'number'
    },
    payload: {
      type: 'object'
    },
    response: {
      type: 'object'
    },
    method: {
      type: 'string'
    }
  }
}
