'use strict'

import test from 'ava'
import { Task } from '../src'
import Moment from 'moment'
import delay from 'delay'

test.beforeEach(async t => {
  t.context.objTest = {
    name: 'Willy',
    owner: 'wsernalaverde@gmail.com',
    state: 'paused',
    exect_date: Moment().unix(),
    req: {
      webhook: {
        uri: 'http://localhost:3003/test',
        method: 'POST',
        body: {
          title: 'Tarea de prueba',
          description: 'Realizar llamada al cliente'
        }
      }
    }
  }
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

test('Error add task data invalid', async t => {
  let err = await t.throwsAsync(() => {
    return Task.add({ email: 'wserna@pimex.co' })
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
  newTask.email = 'wserna@pimex.co'
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
    name: newTask['name']
  })
  t.context.task = newTask
  t.is((res.filter(d => { return d.name === newTask.name }).length > 0), true)
})

test('Exec task without repeat', async t => {
  const taskData = await Task.add(t.context.objTest)
  const task = new Task(taskData.id)
  const request = await task.execute()
  t.context.task = taskData
  const taskExecuted = await task.get()
  t.deepEqual(taskExecuted.state, 'ended')
  t.truthy(request.statusCode)
  t.deepEqual(taskData.id, request.task)
})

test('Exec task with repeat', async t => {
  t.context.objTest.repeat = {
    times: 2,
    intDays: 15
  }
  const taskData = await Task.add(t.context.objTest)
  const task = new Task(taskData.id)
  const request = await task.execute()
  t.context.task = taskData
  const taskExecuted = await task.get()

  t.deepEqual(taskExecuted.state, 'active')
  t.deepEqual(taskData.id, request.task)
  t.notDeepEqual(taskData.exect_date, taskExecuted.exect_date)
  t.truthy(request.statusCode)
})

// test('Exec task multiple times', async t => {
// t.context.objTest.repeat = {
//   times: 2,
//   intDays: 15
// }
//   const taskData = await Task.add(t.context.objTest)
//   const task = new Task(taskData.id)
//   let request = []
//   for (let i = 0; i < 4; i++) {
//     // if (i === 1) {
//     //   taskData.req.webhook.uri = 'http://localhost:3003/test'
//     //   await task.update(taskData)
//     // } else if (i === 2) {
//     //   taskData.req.webhook.uri = 'http://localhost:3003/teste'
//     //   await task.update(taskData)
//     // }
//     request.push(await task.execute())
//   }
//   // console.log(request)
//   t.is(true, true)
//   // t.truthy(request.statusCode)
//   // t.deepEqual(taskData.id, request.task)
// })

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
