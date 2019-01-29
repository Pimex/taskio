'use strict'

import test from 'ava'
import { Task } from '../src'

test('Get task data', async t => {
  const task = new Task(2)

  const taskData = await task.get()

  t.is(taskData.res, 200)
})

test('Error task not found', async t => {
  const task = new Task()

  const taskData = await t.throwsAsync(() => {
    return task.get()
  })

  t.regex(taskData.output.payload.message, /not found/)
  t.deepEqual(taskData.output.statusCode, 404)
})
