'use strict'

import test from 'ava'
import { Task } from '../../src'
import Moment from 'moment'
import fixtures from '../fixtures'
import uuid from 'uuid'

test.beforeEach(async t => {
  const whServer = await fixtures.webhook.server()
  t.context.whServer = whServer
  t.context.objTest = fixtures.task.data()
  t.context.reminder = fixtures.task.reminder(whServer)
})

test.afterEach(async t => {
  if (t.context.task) {
    const task = new Task(t.context.task.id)
    await task.delete()
  }
})

test('Check expired tasks', async t => {
  const date = Moment().subtract(5, 'day').unix()
  const data = t.context.objTest
  data.start_date = date
  delete data.end_date

  let taskData = await Task.add(data)
  const expiredTasks = await Task.checkExpired()
  const task = new Task(taskData.id)
  taskData = await task.get()

  t.context.task = taskData

  t.deepEqual(data.title, taskData.title)
  t.deepEqual(taskData.state, 'expired')
  t.is(expiredTasks.filter(t => t.id === taskData.id).length > 0, true)
})

test('Update task, delete a user ', async t => {
  const newTaskData = t.context.objTest
  const user = `${uuid.v4()}@test.com`
  const users = [user, `${uuid.v4()}@test.com`, `${uuid.v4()}@test.com`]
  newTaskData.users = users

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)
  const updateTask = await task.delete({
    users: user
  })

  const taskData = await task.get()

  t.context.task = newTask
  t.is(typeof newTask.id, 'string')
  t.is(updateTask.users.indexOf(user) < 0, true)
  t.is(taskData.users.indexOf(user) < 0, true)
  t.deepEqual(taskData.users.length, 2)
})

test('Update task users by Array', async t => {
  const newTaskData = t.context.objTest
  const user = `${uuid.v4()}@test.com`
  const users = [user, `${uuid.v4()}@test.com`, `${uuid.v4()}@test.com`]
  newTaskData.users = users

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)

  const updateTask = await task.update({
    users: [user, `${uuid.v4()}@test.com`]
  })

  const taskData = await task.get()

  t.context.task = newTask
  t.is(typeof newTask.id, 'string')
  t.is(updateTask.users.indexOf(user) < 0, false)
  t.is(taskData.users.indexOf(user) < 0, false)
  t.deepEqual(taskData.users.length, 4)
})

test('Update task users by string', async t => {
  const newTaskData = t.context.objTest
  const user = `${uuid.v4()}@test.com`
  const users = [`${uuid.v4()}@test.com`, `${uuid.v4()}@test.com`]
  newTaskData.users = users

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)

  const updateTask = await task.update({
    users: user
  })

  const taskData = await task.get()

  t.context.task = newTask
  t.is(typeof newTask.id, 'string')
  t.is(updateTask.users.indexOf(user) < 0, false)
  t.is(taskData.users.indexOf(user) < 0, false)
  t.is(taskData.users.length === 3, true)
})

test('Get task by user', async t => {
  let newTaskData = t.context.objTest

  const users = [`${uuid.v4()}@test.com`, `${uuid.v4()}@test.com`]
  newTaskData.users = users

  const newTask = await Task.add(newTaskData)

  const tasks = await Task.getAll({
    users: users[0]
  })

  t.context.task = newTask
  t.is(tasks.length > 0, true)
  t.deepEqual(tasks[0].users, users)
})

test('Get by array data', async t => {
  let newTaskData = t.context.objTest
  const account = ['456', 'test@test.com']

  newTaskData.account = account

  const newTask = await Task.add(newTaskData)

  const tasks = await Task.getAll({
    account: 'test@test.com'
  })

  t.context.task = newTask
  t.is(tasks.filter(t => t.id === newTask.id).length > 0, true)
})

test('Update invalid state', async t => {
  const taskData = t.context.objTest
  const newTask = await Task.add(taskData)
  const task = new Task(newTask.id)

  const newTaskData = {
    state: 'any'
  }

  const updateData = await task.update(newTaskData)

  t.context.task = newTask
  t.is(Object.keys(updateData).length, 0)
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
  const newTaskData = {
    state: 'completed'
  }

  const taskData = await task.update(newTaskData)
  t.context.task = newTask
  t.deepEqual(taskData.state, newTaskData.state)
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
