'use strict'

module.exports = {
  add: {
    time: {
      type: 'number',
      require: true
    },
    id_task: {
      default: null,
      require: true
    },
    status: {
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
