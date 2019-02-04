'use strict'

module.exports = {
  add: {
    _created: {
      type: 'number',
      require: true
    },
    _state: {
      value: 'active'
    },
    _used: {
      value: null
    },
    _updated: {
      type: 'number',
      require: true
    },
    event: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    url: {
      type: 'string'
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
    method: {
      default: 'POST'
    },
    query: {
      type: 'object'
    }
  },
  update: {
    _used: {
      type: 'number'
    },
    _updated: {
      type: 'number',
      require: true
    },
    event: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    headers: {
      type: 'object'
    },
    body: {
      type: 'object'
    },
    params: {
      type: 'array'
    },
    method: {
      type: 'string'
    },
    query: {
      type: 'object'
    }
  }
}
