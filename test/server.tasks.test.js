'use strict'

import test from 'ava'
import Server from '../src/services'
import request from 'request-promise'
import { Task } from '../src'
import Moment from 'moment'

test.before(async t => {
  const server = await Server.start('test')
  t.context.server = server
  t.context.baseurl = `${server.uri}/tasks`
})

test.beforeEach(async t => {
  t.context.objTest = {
    name: 'Willy',
    owner: 'wsernalaverde@gmail.com',
    state: 'paused',
    exect_date: Moment().unix()
  }
})

test.afterEach(async t => {
  if (t.context.task) {
    const task = new Task(t.context.task.id)
    await task.delete()
  }
})

test('Add task', async t => {
  const baseUrl = t.context.baseurl

  const res = await request({
    uri: `${baseUrl}`,
    method: 'POST',
    json: true,
    body: t.context.objTest
  })

  t.context.task = res.data
  t.deepEqual(res.statusCode, 201)
  t.deepEqual(t.context.objTest.owner, res.data.owner)
  t.deepEqual(res.data.state, 'active')
  t.truthy(res.data._id, true)
})

test('Error add task', async t => {
  const baseUrl = t.context.baseurl

  let err = await t.throwsAsync(() => {
    return request({
      uri: `${baseUrl}`,
      method: 'POST',
      json: true,
      body: { email: 'wserna@pimex.co' }
    })
  })
  t.deepEqual(err.statusCode, 400)
})

test('Update task by id', async t => {
  const baseUrl = t.context.baseurl
  let newTask = await Task.add(t.context.objTest)
  newTask.lastname = 'Serna'
  delete newTask._id

  const res = await request({
    uri: `${baseUrl}/${newTask.id}`,
    method: 'PUT',
    json: true,
    body: newTask
  })

  t.context.task = newTask
  t.deepEqual(res.statusCode, 201)
  t.deepEqual(res.data.state, newTask.state)
})

test('Error update task data invalid', async t => {
  const baseUrl = t.context.baseurl
  let newTask = await Task.add(t.context.objTest)
  newTask.lastname = 'Serna'
  delete newTask._id
  const res = await request({
    uri: `${baseUrl}/${newTask.id}`,
    method: 'PUT',
    json: true,
    body: newTask
  })
  t.context.task = newTask
  t.is(res.lastname, undefined)
})

test('Get task by id', async t => {
  const baseUrl = t.context.baseurl
  let newTask = await Task.add(t.context.objTest)

  const res = await request({
    uri: `${baseUrl}/${newTask.id}`,
    method: 'GET',
    json: true
  })

  t.context.task = newTask
  t.deepEqual(res.statusCode, 200)
  t.deepEqual(res.data.id, newTask.id)
})

test('Error Get task id not found', async t => {
  const baseUrl = t.context.baseurl

  let err = await t.throwsAsync(() => {
    return request({
      uri: `${baseUrl}/222`,
      method: 'GET',
      json: true
    })
  })
  t.deepEqual(err.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Get all tasks', async t => {
  const baseUrl = t.context.baseurl

  const res = await request({
    uri: `${baseUrl}`,
    method: 'GET',
    json: true
  })

  t.is((typeof res.data === 'object'), true)
})

test('Get all tasks by query', async t => {
  const baseUrl = t.context.baseurl
  let nameQuery = 'Ana'

  const res = await request({
    uri: `${baseUrl}`,
    method: 'GET',
    json: true,
    qs: {
      name: nameQuery
    }
  })

  t.is((res.data.filter(d => { return d.name !== nameQuery }).length <= 0), true)
})

test('Delete task by id', async t => {
  const baseUrl = t.context.baseurl
  let newTask = await Task.add(t.context.objTest)

  const res = await request({
    uri: `${baseUrl}/${newTask.id}`,
    method: 'DELETE',
    json: true
  })

  t.deepEqual(res.statusCode, 200)
  t.deepEqual(res.data.id, newTask.id)
})
