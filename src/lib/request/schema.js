'use strict'

module.exports = {
  add: {
    _created: {
      type: 'number',
      require: true
    },
    task: {
      default: null
    },
    statusCode: {
      type: 'number'
    },
    payload: {
      type: 'object'
    },
    response: {
      type: 'object',
      require: true
    },
    method: {
      type: 'string',
      require: true
    },
    webhook: {
      default: null
    },
    headers: {
      type: 'array'
    }
  },

  send: {
    uri: {
      type: 'string',
      require: true
    },
    method: {
      default: 'GET'
    },
    headers: {
      type: 'array'
    },
    body: {
      type: 'object'
    },
    params: {
      type: 'object'
    },
    json: {
      value: true
    }
  }
}
