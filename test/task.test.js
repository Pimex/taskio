'use strict'

import test from 'ava'
import { Task } from '../src'
import Moment from 'moment'
import delay from 'delay'
import fixtures from './fixtures'
import uuid from 'uuid'

test.beforeEach(async t => {
  const whServer = await fixtures.webhook.server()
  t.context.whServer = whServer
  t.context.objTest = fixtures.task.data(whServer)
})

test.afterEach(async t => {
  if (t.context.task) {
    const task = new Task(t.context.task.id)
    await task.delete()
  }
})

test('Add task', async t => {
  const taskData = await Task.add(t.context.objTest)
  t.context.task = taskData

  t.deepEqual(t.context.objTest.owner, taskData.owner)
  t.deepEqual(taskData.state, 'active')
  t.truthy(taskData._id)
})

test('Add simple task', async t => {
  let taskData = t.context.objTest
  delete taskData.reminder
  delete taskData.account
  delete taskData.type
  delete taskData.description
  delete taskData.owner

  taskData = await Task.add(taskData)

  t.context.task = taskData

  t.deepEqual(t.context.objTest.title, taskData.title)
  t.deepEqual(taskData.state, 'active')
  t.deepEqual(taskData.owner, 'system')
  t.truthy(taskData._id)
})

test('Error add task data invalid', async t => {
  let err = await t.throwsAsync(() => {
    return Task.add({ email: `${uuid.v4()}@gmail.com` })
  })
  t.deepEqual(err.output.statusCode, 400)
})

test('Get task data by id', async t => {
  const newTask = await Task.add(t.context.objTest)
  const task = new Task(newTask.id)
  const taskData = await task.get()
  t.context.task = newTask
  t.deepEqual(newTask.id, taskData.id)
})

test('Error Get task id not found', async t => {
  const task = new Task(222)
  let err = await t.throwsAsync(() => {
    return task.get()
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Update task data', async t => {
  const newTask = await Task.add(t.context.objTest)
  const task = new Task(newTask.id)
  newTask.state = 'paused'
  const taskData = await task.update(newTask)
  t.context.task = newTask
  t.deepEqual(taskData.state, newTask.state)
})

test('Error update task data invalid', async t => {
  const newTask = await Task.add(t.context.objTest)
  const task = new Task(newTask.id)
  newTask.email = `${uuid.v4()}@gmail.com`
  const taskData = await task.update(newTask)
  t.context.task = newTask
  t.is(taskData.email, undefined)
})

test('Delete task', async t => {
  const newTask = await Task.add(t.context.objTest)
  const task = new Task(newTask.id)
  const taskData = await task.delete()
  t.deepEqual(taskData.id, newTask.id)
})

test('Get all tasks', async t => {
  const taskData = await Task.getAll()
  t.is((typeof taskData === 'object'), true)
})

test('Get all task by query', async t => {
  const newTask = await Task.add(t.context.objTest)
  let res = await Task.getAll({
    title: newTask['title']
  })

  t.context.task = newTask
  t.is((res.filter(d => { return d.name === newTask.name }).length > 0), true)
})

test('Exec task without repeat', async t => {
  const taskData = await Task.add(t.context.objTest)
  const task = new Task(taskData.id)
  const request = await task.execute()
  const taskExecuted = await task.get()

  t.context.task = taskData

  t.deepEqual(taskExecuted.reminder.state, 'ended')
  t.truthy(request.statusCode)
  t.deepEqual(taskData.id, request.task)
})

test('Exec task with repeat', async t => {
  let newTask = t.context.objTest

  newTask.reminder.repeat = {
    times: 2,
    intDays: 15
  }
  const taskData = await Task.add(newTask)
  const task = new Task(taskData.id)
  const request = await task.execute()
  t.context.task = taskData
  const taskExecuted = await task.get()

  t.deepEqual(taskExecuted.reminder.state, 'active')
  t.deepEqual(taskData.id, request.task)
  t.notDeepEqual(taskData.reminder.exect_date, taskExecuted.reminder.exect_date)
  t.truthy(request.statusCode)
})

test('Error exec task', async t => {
  const newTask = t.context.objTest
  newTask.reminder.req.webhook.uri = 'http://test.uri.com'
  const taskData = await Task.add(t.context.objTest)
  const task = new Task(taskData.id)
  const request = await task.execute()

  const taskExecuted = await task.get()
  t.context.task = taskData
  t.deepEqual(request.state, 'error')
  t.deepEqual(taskExecuted.reminder.state, 'failed')
  t.truthy(taskExecuted.reminder.resend_failed)
})

test('Error exec task three times and caneled', async t => {
  const newTask = t.context.objTest
  newTask.reminder.req.webhook.uri = 'http://test.uri.com'
  newTask.reminder.repeat = { times: 2, intDays: 15 }

  const taskData = await Task.add(newTask)
  const task = new Task(taskData.id)

  for (let i = 0; i < 3; i++) {
    await task.execute()
  }

  const taskExecuted = await task.get()
  t.context.task = taskData
  t.deepEqual(taskExecuted.reminder.state, 'canceled')
  t.truthy(taskExecuted.reminder.resend_failed)
})

test('Exec task with error and then succes', async t => {
  let taskExecuted = null
  const newTask = t.context.objTest
  newTask.reminder.req.webhook.uri = 'http://test.uri.com'
  newTask.reminder.repeat = { times: 2, intDays: 15 }

  const taskData = await Task.add(t.context.objTest)
  const task = new Task(taskData.id)
  let request = []
  for (let i = 0; i < 2; i++) {
    if (i === 1) {
      taskData.reminder.req.webhook.uri = t.context.whServer.uri
      await task.update(taskData)
    }

    request.push(await task.execute())
  }

  taskExecuted = await task.get()

  t.context.task = taskData
  t.is((request.filter(d => { return d.state === 'error' }).length > 0), true)
  t.is((request.filter(d => { return d.state === 'success' }).length > 0), true)
  t.deepEqual(taskExecuted.reminder.state, 'active')
  t.notDeepEqual(taskData.reminder.exect_date, taskExecuted.reminder.exect_date)
})

test('Monitor task', async t => {
  await Task.add(t.context.objTest)
  await delay(100)
  const timeInit = Moment().unix()
  for (let i = 0; i < 5; i++) {
    await Task.add(t.context.objTest)
    await delay(1000)
    if (i === 3) t.context.objTest.name = 'John'
  }
  const timeEnd = Moment().unix()

  const taskToExec = await Task.monitor({
    _created: {
      range: {
        init: timeInit,
        end: timeEnd
      }
    },
    name: 'John'
  })
  t.is((taskToExec.filter(d => { return d._created < timeInit && d._created > timeEnd }).length <= 0), true)
  t.is((taskToExec.filter(d => { return d.name !== 'John' }).length <= 0), true)
})
