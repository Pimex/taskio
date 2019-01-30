'use strict'

import test from 'ava'
import { Task } from '../src'

let newTask = {}

test.before(async t => {
  t.context.objTest = { name: 'Willy', email: 'wsernalaverde@gmail.com' }
})

test('Add task', async t => {
  const taskData = await Task.add(t.context.objTest)
  newTask = taskData
  t.deepEqual(t.context.objTest.email, taskData.email)
  t.truthy(taskData._id, true)
})

test('Get task data', async t => {
  const task = new Task(newTask.id)
  const taskData = await task.get()
  t.deepEqual(newTask.id, taskData.id)
})

test('Update task data', async t => {
  const task = new Task(newTask.id)
  newTask.lastname = 'Serna'
  const taskData = await task.update(newTask)
  t.deepEqual(taskData.lastname, newTask.lastname)
})

test('Delete task', async t => {
  const task = new Task(newTask.id)
  const taskData = await task.delete()
  t.deepEqual(taskData.id, newTask.id)
})

// test('Get all tasks', async t => {
//   const task = new Task(newTask.id)
//   const taskData = await task.get()
//   t.deepEqual(newTask.id, taskData.data.id)
//   t.is(taskData.status_code, 200)
// })

// test('Error task not found', async t => {
//   const task = new Task()

//   const taskData = await t.throwsAsync(() => {
//     return task.get()
//   })

//   t.regex(taskData.output.payload.message, /not found/)
//   t.deepEqual(taskData.output.statusCode, 404)
// })
