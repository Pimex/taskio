'use strict'

const Boom = require('boom')
const Db = require('../db')
const schemaTemplate = require('./schema')
const { Schema } = require('schemio')
const Moment = require('moment')
const Request = require('../request')

const db = Db.init({ dbName: 'db_taskio', collection: 'task' })

class Task {
  constructor (id) {
    if (!id) throw Boom.notFound('Task id not found or invalid')

    this.id = id
  }

  static async checkExpired (params = {}) {
    try {
      const date = Moment().unix()

      const tasks = await this.getAll({
        end_date: {
          $lt: date
        },
        state: 'active'
      })

      for (const taskData of tasks) {
        const task = new Task(taskData.id)
        await task.update({
          state: 'expired'
        })
      }

      return Promise.resolve(tasks)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async add (data = {}) {
    try {
      data._created = Moment().unix()

      if (data.users) {
        if (typeof data.users === 'string') {
          data.users = [data.users]
        }
      }

      if (data.start_date && !data.end_date) {
        data.end_date = Moment.unix(data.start_date).endOf('day').unix()
      }

      data = Schema.validate(data, schemaTemplate.add)

      if (data.reminder) {
        data.reminder.uri = data.reminder.uri || data.reminder.url
        data.reminder = Schema.validate(data.reminder, schemaTemplate.reminder)
      }

      let res = await db.add(data)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async getAll (query = {}) {
    try {
      let queryDb = {}

      for (let i in query) {
        if (query[i].range) {
          queryDb[i] = { $gt: query[i].range.init, $lt: query[i].range.end }
          continue
        }
        queryDb[i] = query[i]
      }

      let res = await db.getAll(queryDb)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async update (data) {
    try {
      const taskData = await this.get()
      let users = taskData.users

      if (data.users) {
        switch (typeof data.users) {
          case 'string':
            users.push(data.users)
            break
          case 'object':
            users = users.concat(data.users)
            break
          case 'number':
            users.push(String(data.users))
            break
          default:
            data.users = []
        }
        data.users = Array.from(new Set(users))
      }

      data = Schema.validate(data, schemaTemplate.update)

      let res = await db.update(this.id, data)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async get () {
    try {
      let res = await db.get(this.id)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async delete (params = false) {
    try {
      const taskData = await this.get()
      let res = []
      if (!params) {
        await Request.deleteMany({
          task: this.id
        })
        res = await db.delete(this.id)
      } else {
        params = Schema.validate(params, schemaTemplate.delete)

        if (params.users) {
          let users = taskData.users
          let index = users.indexOf(params.users)
          if (index > -1) {
            users.splice(index, 1)
            res = await db.update(this.id, {
              users
            })
          }
        }
      }

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async execute () {
    try {
      let taskData = await db.get(this.id)

      if (!taskData.reminder || taskData.reminder.state === 'ended') {
        return Promise.resolve({})
      }

      const res = await Request.send({
        uri: taskData.reminder.uri,
        method: taskData.reminder.method || 'POST',
        body: {
          data: taskData.reminder.data || null,
          task: taskData
        },
        task: this.id
      })

      let query = { task: this.id }

      if (res.state === 'success') query.state = 'success'

      let cantRequest = await Request.getAll(query, {
        limit: res.state === 'success' ? 0 : 3,
        sort: { _id: -1 }
      })

      if (res.state === 'failed') {
        if (cantRequest.filter(d => { return d.state === 'failed' }).length < 3) {
          let newDate = taskData.reminder.resend_failed || taskData.reminder.exect_date
          newDate = Moment.unix(newDate).add(1, 'hour').unix()
          taskData.reminder.resend_failed = newDate
          taskData.reminder.state = res.state
          await db.update(this.id, {
            reminder: taskData.reminder
          })
        } else {
          taskData.reminder.state = 'canceled'
          await db.update(this.id, {
            reminder: taskData.reminder
          })
        }
      } else {
        if (taskData.reminder.repeat && taskData.reminder.repeat.times > 1 && cantRequest.length < taskData.reminder.repeat.times) {
          const newDate = Moment.unix(taskData.reminder.exect_date).add(taskData.reminder.repeat.intDays, 'day').unix()

          await db.update(this.id, {
            'reminder.state': 'active',
            'reminder.exect_date': newDate
          })
        } else {
          await db.update(this.id, {
            'reminder.state': 'ended'
          })
        }
      }
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  static async monitor (query = {}) {
    try {
      const allTask = await this.getAll(query)

      let taskExecuted = []
      for (const item of allTask) {
        const task = new Task(item.id)
        taskExecuted.push(item)
        await task.execute()
      }

      return Promise.resolve(taskExecuted)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }
}

module.exports = Task
