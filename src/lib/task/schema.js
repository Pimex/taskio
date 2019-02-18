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
    owner: {
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
      type: 'object'
      /**
       state: 'disabled',
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
       req: {
         type: 'object'
       }
       **/
    }
  },

  update: {
    account: {
      default: null
    },
    state: {
      type: 'string'
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
    }
  }
}
