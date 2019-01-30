'use strict'

module.exports = {
  add: {
    _created: {
      type: 'number',
      require: true
    },
    account: {
      default: null
    },
    state: {
      value: 'active'
    },
    exect_date: {
      require: true,
      type: 'number'
    },
    repeat: {
      type: 'object',
      default: {
        times: 1
      }
    },
    owner: {
      default: null
    },
    expirate: {
      default: 'never'
    },
    type: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    req: {
      type: 'object'
    }
  },

  update: {
    account: {
      default: null
    },
    state: {
      type: 'string'
    },
    exect_date: {
      type: 'number'
    },
    repeat: {
      type: 'object'
    },
    owner: {
      default: null
    },
    expirate: {
      default: 'never'
    },
    type: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    req: {
      type: 'object'
    }
  }
}
