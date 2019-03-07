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

test('Exec task reminder', async t => {
  const taskData = t.context.objTest
  taskData.reminder = t.context.reminder

  const newTaskData = await Task.add(t.context.objTest)

  const task = new Task(newTaskData.id)
  const request = await task.execute()
  const taskExecuted = await task.get()

  t.context.task = newTaskData

  t.deepEqual(taskExecuted.reminder.state, 'ended')
  t.truthy(request.statusCode)
  t.deepEqual(newTaskData.id, request.task)
})

test('Exec task reminder with repeat', async t => {
  const newTask = t.context.objTest
  newTask.reminder = t.context.reminder

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
  newTask.reminder = t.context.reminder
  newTask.reminder.uri = 'http://test.uri.com'

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
  newTask.reminder = t.context.reminder
  newTask.reminder.uri = 'http://test.uri.com'
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
  newTask.reminder = t.context.reminder
  newTask.reminder.uri = 'http://test.uri.com'
  newTask.reminder.repeat = { times: 2, intDays: 15 }

  const taskData = await Task.add(t.context.objTest)
  const task = new Task(taskData.id)
  let request = []
  for (let i = 0; i < 2; i++) {
    if (i === 1) {
      taskData.reminder.uri = t.context.whServer.uri
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
