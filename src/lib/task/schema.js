'use strict'

module.exports = {
  add: {
    _created: {
      type: 'number',
      require: true
    },
    start_date: {
      type: 'number'
    },
    end_date: {
      type: 'number'
    },
    account: {
      default: null
    },
    state: {
      value: 'active'
    },
    owner: {
      type: 'string',
      default: 'system'
    },
    type: {
      type: 'string'
    },
    title: {
      type: 'string',
      require: 'true'
    },
    description: {
      type: 'string'
    },
    reminder: {
      type: 'object',
      default: false
    },
    category: {
      type: 'string'
    },
    data: {
      default: null
    }
  },

  update: {
    account: {
      default: null
    },
    state: {
      opts: ['active', 'expired', 'completed'],
<<<<<<< HEAD
      type: 'string'
=======
      type: 'array'
>>>>>>> ae7cc0f6e91199316d9509f20675354f21f3e924
    },
    type: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    reminder: {
      type: 'object'
    },
    category: {
      type: 'string'
    },
    data: {
      default: null
    }
  },

  reminder: {
    state: {
      type: 'string',
      default: 'active'
    },
    repeat: {
      type: 'object',
      default: {
        times: 1
      }
    },
    exect_date: {
      require: true,
      type: 'number'
    },
    uri: {
      type: 'string',
      require: true
    },
    method: {
      opts: ['POST', 'GET', 'DELETE', 'PUT'],
      default: 'POST'
    },
    data: {
      type: 'object'
    }
  }
}
