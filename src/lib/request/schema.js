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
    state: {
      type: 'string'
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
      type: 'object'
    },
    query: {
      type: 'object'
    }
  },

  send: {
    uri: {
      type: 'string',
      require: true
    },
    method: {
      default: 'POST'
    },
    headers: {
      type: 'object'
    },
    body: {
      type: 'object'
    },
    params: {
      type: 'object'
    },
    json: {
      value: true
    },
    qs: {
      type: 'object'
    },
    resolveWithFullResponse: {
      value: true
    }
  }
}
