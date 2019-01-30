'use strict'

import test from 'ava'
import { Task } from '../src'

test.beforeEach(async t => {
  t.context.objTest = { name: 'Willy', email: 'wsernalaverde@gmail.com' }
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
  t.deepEqual(t.context.objTest.email, taskData.email)
  t.truthy(taskData._id, true)
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
  newTask.lastname = 'Serna'
  const taskData = await task.update(newTask)
  t.context.task = newTask
  t.deepEqual(taskData.lastname, newTask.lastname)
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
