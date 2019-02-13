'use strict'

import test from 'ava'
import { Client, Server } from '../src'
import fixtures from './fixtures'
import uuid from 'uuid'
import Moment from 'moment'

let cli = null

test.before(async t => {
  const whkServer = await fixtures.webhook.server()
  const server = await Server.start('test')

  cli = new Client(server.uri, {
    response: 'all'
  })

  t.context.server = server
  t.context.webhookServer = whkServer

  t.context.taskData = fixtures.task.data(whkServer)
})

test.afterEach(async t => {
  if (t.context.task) {
    await cli.task.delete(t.context.task.data.id)
  }
})

test('add Task', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  t.is(newTask.statusCode, 201)
  t.deepEqual(newTask.data.name, taskData.name)
  t.deepEqual(newTask.data.exect_date, taskData.exect_date)
  t.is(typeof newTask.data.id, 'string')
})

test('Error add Task exect_date is required', async t => {
  const e = await t.throwsAsync(cli.task.add({
    test: 1
  }))

  t.is(e.output.statusCode, 400)
  t.regex(e.message, /The fiel exect_date is required/)
})

test('update Task', async t => {
  const taskData = t.context.taskData
  const newName = uuid.v4()

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const updateTask = await cli.task.update(newTask.data.id, {
    name: newName
  })

  t.is(newTask.statusCode, 201)
  t.is(updateTask.statusCode, 201)
  t.deepEqual(newTask.data.name, taskData.name)
  t.deepEqual(newTask.data.exect_date, taskData.exect_date)
  t.is(typeof newTask.data.id, 'string')
  t.is(updateTask.data.name, newName)
})

test('No update task id', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const updateTask = await cli.task.update(newTask.data.id, {
    id: uuid.v4()
  })

  t.is(newTask.statusCode, 201)
  t.is(updateTask.statusCode, 201)
  t.deepEqual(newTask.data.name, taskData.name)
  t.deepEqual(newTask.data.exect_date, taskData.exect_date)
  t.is(typeof newTask.data.id, 'string')
  t.is(typeof updateTask.data.id, 'undefined')
})

test('Get all tasks', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const tasks = await cli.task.getAll()

  t.is(newTask.statusCode, 201)
  t.is(tasks.statusCode, 200)
  t.is(tasks.data.length > 0, true)
  t.is(tasks.data.filter(i => i.id === newTask.data.id).length > 0, true)
})

test('Remove task', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)

  const removeTask = await cli.task.delete(newTask.data.id)

  const tasks = await cli.task.getAll()

  t.is(newTask.statusCode, 201)
  t.is(tasks.statusCode, 200)
  t.is(removeTask.statusCode, 200)
  t.is(tasks.data.filter(i => i.id === newTask.data.id).length <= 0, true)
})

test('Exec task monitor', async t => {
  const taskData = t.context.taskData
  taskData.exect_date = Moment().add(10, 'second').unix()

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const monitor = await cli.task.execMonitor()

  t.is(newTask.statusCode, 201)
  t.is(monitor.statusCode, 200)
  t.is(monitor.data.filter(i => i.id === newTask.data.id).length > 0, true)
})
