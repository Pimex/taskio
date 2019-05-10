'use strict'

import test from 'ava'
import { Task } from '../../src'
import Moment from 'moment'
import delay from 'delay'
import fixtures from '../fixtures'

test.beforeEach(async t => {
  const whServer = await fixtures.webhook.server()
  t.context.whServer = whServer
  t.context.taskData = fixtures.task.data()
  t.context.reminder = fixtures.task.reminder(whServer)
})

test.afterEach(async t => {
  if (t.context.task) {
    const task = new Task(t.context.task.id)
    await task.delete()
  }
})

test('Exec task reminder', async t => {
  const tData = t.context.taskData
  tData.reminder = t.context.reminder

  const newTaskData = await Task.add(t.context.taskData)

  const task = new Task(newTaskData.id)
  const exect = await task.execute()
  const taskData = await task.get()

  t.context.task = newTaskData

  t.deepEqual(taskData.reminder.state, 'ended')
  t.deepEqual(exect.statusCode, 200)
  t.deepEqual(exect.payload.task.id, newTaskData.id)
  t.deepEqual(newTaskData.id, taskData.id)
})

test('Exec task reminder with repeat', async t => {
  const newTaskData = t.context.taskData
  newTaskData.reminder = t.context.reminder

  newTaskData.reminder.repeat = {
    times: 2,
    intDays: 15
  }

  const taskData = await Task.add(newTaskData)
  const task = new Task(taskData.id)
  const request = await task.execute()
  const taskExecuted = await task.get()

  t.context.task = taskData

  t.deepEqual(taskExecuted.reminder.state, 'active')
  t.deepEqual(taskData.id, request.task)
  t.notDeepEqual(taskData.reminder.exect_date, taskExecuted.reminder.exect_date)
  t.truthy(request.statusCode)
})

test('Error exec task', async t => {
  const newTaskData = t.context.taskData
  newTaskData.reminder = t.context.reminder
  newTaskData.reminder.uri = 'http://test.uri.com'

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)
  const exect = await task.execute()
  const taskData = await task.get()

  t.context.task = taskData

  t.deepEqual(exect.state, 'failed')
  t.deepEqual(taskData.reminder.state, 'failed')
  t.true(taskData.reminder.resend_failed > taskData.reminder.exect_date)
})

test('Error exec task three times and caneled', async t => {
  const exects = []
  const newTaskData = t.context.taskData
  newTaskData.reminder = t.context.reminder
  newTaskData.reminder.uri = 'http://test.uri.com'
  newTaskData.reminder.repeat = { times: 2, intDays: 15 }

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)

  for (let i = 0; i < 3; i++) {
    const te = await task.execute()
    exects.push(te)
  }

  const taskData = await task.get()

  t.context.task = taskData

  t.deepEqual(taskData.reminder.state, 'canceled')
  t.true(exects.length >= 3)
  t.true(exects.filter(e => e.state === 'failed').length >= 3)
})

test('Exec task with error and then succes', async t => {
  const newTaskData = t.context.taskData
  let taskExecuted = null
  newTaskData.reminder = t.context.reminder
  newTaskData.reminder.uri = 'http://test.uri.com'
  newTaskData.reminder.repeat = { times: 2, intDays: 15 }

  const taskData = await Task.add(newTaskData)
  const task = new Task(taskData.id)

  let request = []
  for (let i = 0; i < 2; i++) {
    if (i === 1) {
      taskData.reminder.uri = `${t.context.whServer.uri}/test`
      await task.update(taskData)
    }

    request.push(await task.execute())
  }

  taskExecuted = await task.get()

  t.context.task = taskData
  t.is((request.filter(d => { return d.state === 'failed' }).length > 0), true)
  t.is((request.filter(d => { return d.state === 'success' }).length > 0), true)
  t.deepEqual(taskExecuted.reminder.state, 'active')
  t.notDeepEqual(taskData.reminder.exect_date, taskExecuted.reminder.exect_date)
})

test('Monitor task', async t => {
  const newTaskData = t.context.taskData

  await Task.add(newTaskData)
  await delay(100)

  const timeInit = Moment().unix()

  for (let i = 0; i < 5; i++) {
    await Task.add(newTaskData)
    await delay(1000)
    if (i === 3) newTaskData.name = 'John'
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
