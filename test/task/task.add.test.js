'use strict'

const test = require('ava')
const { Task } = require('../../src')
const fixtures = require('../fixtures')
const uuid = require('uuid')

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

test('add task with reminder valid defaults', async t => {
  const data = t.context.objTest
  const reminder = t.context.reminder

  delete reminder.state
  delete reminder.repeat
  reminder.method = 'TestMethod'

  data.reminder = reminder

  const taskData = await Task.add(data)

  t.context.task = taskData

  t.deepEqual(data.title, taskData.title)
  t.deepEqual(taskData.state, 'active')
  t.deepEqual(taskData.reminder.method, 'POST')
  t.deepEqual(taskData.reminder.repeat.times, 1)
  t.deepEqual(taskData.reminder.state, 'active')
  t.deepEqual(taskData.reminder.uri, reminder.uri)
})

test('add task with reminder', async t => {
  const data = t.context.objTest
  const reminder = t.context.reminder
  data.reminder = reminder

  const taskData = await Task.add(data)

  t.context.task = taskData

  t.deepEqual(data.title, taskData.title)
  t.deepEqual(taskData.state, 'active')
  t.deepEqual(taskData.reminder.method, reminder.method)
  t.deepEqual(taskData.reminder.uri, reminder.uri)
})

test('Add task, assign users Array', async t => {
  let newTaskData = t.context.objTest

  const users = [`${uuid.v4()}@test.com`, `${uuid.v4()}@test.com`]
  newTaskData.users = users

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)

  const taskData = await task.get()

  t.context.task = newTask
  t.deepEqual(taskData.users, users)
})

test('Add task, assign user string', async t => {
  let newTaskData = t.context.objTest

  const user = `${uuid.v4()}@test.com`
  newTaskData.users = user

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)

  const taskData = await task.get()

  t.context.task = newTask
  t.is(taskData.users.indexOf(user) < 0, false)
})

test('Add task default user', async t => {
  let newTaskData = t.context.objTest

  const newTask = await Task.add(newTaskData)
  const task = new Task(newTask.id)

  const taskData = await task.get()

  t.context.task = newTask
  t.is(taskData.users.length, 0)
})

test('Add single task without end_date', async t => {
  const taskData = t.context.objTest
  delete taskData.end_date
  const newTaskData = await Task.add(taskData)
  t.context.task = newTaskData

  t.deepEqual(t.context.objTest.owner, taskData.owner)
  t.deepEqual(newTaskData.state, 'active')
  t.truthy(typeof newTaskData.end_date)
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
