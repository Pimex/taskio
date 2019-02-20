'use strict'

import Boom from 'boom'
import Db from '../db'
import schemaTemplate from './schema'
import { Schema } from 'schemio'
import Moment from 'moment'
import Request from '../request'
import $request from 'request-promise'

const db = Db.init({ dbName: 'db_taskio', collection: 'task' })

class Task {
  constructor (id) {
    if (!id) throw Boom.notFound('Task id not found or invalid')

    this.id = id
  }

  static async add (data) {
    try {
      data._created = Moment().unix()
      data = Schema.validate(data, schemaTemplate.add)

      if (data.start_date && !data.end_date) {
        data.end_date = Moment.unix(data.start_date).endOf('day').unix()
      }

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

  async delete () {
    try {
      await Request.deleteMany({
        task: this.id
      })
      let res = await db.delete(this.id)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(new Boom(error))
    }
  }

  async execute () {
    let resExec = {}

    let task = await db.get(this.id)

    if (!task.reminder) {
      return Promise.resolve({})
    }

    const webhook = {
      uri: task.reminder.uri,
      method: task.reminder.method,
      body: {
        data: task.reminder.data,
        task
      }
    }
    let state = 'active'
    try {
      webhook.body.task = task
      webhook.json = true
      webhook.resolveWithFullResponse = true
      resExec = await $request(webhook)
      resExec = {
        headers: resExec.headers,
        statusCode: resExec.statusCode,
        body: resExec.body
      }
    } catch (error) {
      state = 'failed'
      resExec = {
        headers: error.response ? error.response.headers : '',
        statusCode: error.statusCode || 500,
        body: error.response ? error.response.body : error.message
      }
    }
    try {
      delete webhook.body.task

      let res = await Request.add({
        statusCode: resExec.statusCode,
        method: webhook.method,
        task: task.id,
        payload: webhook,
        response: resExec,
        state: resExec.statusCode >= 300 ? 'error' : 'success'
      })

      let query = { task: this.id }
      if (state !== 'failed') query.state = 'success'
      let cantRequest = await Request.getAll(query, {
        limit: state === 'active' ? 0 : 3,
        sort: { _id: -1 }
      })
      // console.log(cantRequest)
      if (state === 'failed') {
        if (cantRequest.filter(d => { return d.state === 'error' }).length < 3) {
          let newDate = task.reminder.resend_failed || task.reminder.exect_date
          newDate = Moment.unix(newDate).add(1, 'hour').unix()
          task.reminder.resend_failed = newDate
          task.reminder.state = state
          await db.update(this.id, {
            reminder: task.reminder
          })
        } else {
          task.reminder.state = 'canceled'
          await db.update(this.id, {
            reminder: task.reminder
          })
        }
      } else {
        if (task.reminder.repeat && task.reminder.repeat.times > 1 && cantRequest.length < task.reminder.repeat.times) {
          const newDate = Moment.unix(task.reminder.exect_date).add(task.reminder.repeat.intDays, 'day').unix()

          await db.update(this.id, {
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
        taskExecuted.push(item)
        const $task = new Task(item.id)
        await $task.execute()
      }
      return taskExecuted
    } catch (error) {
      return new Boom(error)
    }
  }
}

module.exports = Task
