'use strict'

import test from 'ava'
import { Request } from '../src'

test.beforeEach(async t => {
  t.context.objTest = {
    statusCode: 200,
    method: 'POST',
    task: '-LXZGomXhQqGOcnJmdt9',
    payload: {
      method: 'POST',
      data: 'data'
    },
    response: {
      data: 'data',
      statusCode: 200
    }
  }
})

test.afterEach(async t => {
  if (t.context.request) {
    const request = new Request(t.context.request.id)
    await request.delete()
  }
})

test('Send request error response', async t => {
  const req = await Request.send({
    url: 'https://pokeapi.co/api/v2/pokemon/taskio/'
  })

  t.deepEqual(typeof req.id, 'string')
  t.deepEqual(typeof req.statusCode, 'number')
  t.deepEqual(req.method, 'GET')
  t.is(req.statusCode >= 400, true)
})

test('Send request', async t => {
  const req = await Request.send({
    url: 'https://pokeapi.co/api/v2/pokemon/ditto/'
  })

  t.deepEqual(typeof req.id, 'string')
  t.deepEqual(typeof req.statusCode, 'number')
  t.deepEqual(req.method, 'GET')
  t.is(req.statusCode >= 200, true)
})

test('Add request', async t => {
  const requestData = await Request.add(t.context.objTest)
  t.context.request = requestData

  t.deepEqual(t.context.objTest.task, requestData.task)
  t.deepEqual(requestData.statusCode, 200)
  t.truthy(requestData._id, true)
})

test('Error add task data invalid', async t => {
  let err = await t.throwsAsync(() => {
    return Request.add({ email: 'wserna@pimex.co' })
  })
  t.deepEqual(err.output.statusCode, 400)
})

test('Get all request', async t => {
  const requestData = await Request.getAll()
  t.is((typeof requestData === 'object'), true)
})

test('Get all request by query', async t => {
  const requestData = await Request.add(t.context.objTest)
  let res = await Request.getAll({
    task: requestData.task
  })
  t.context.request = requestData
  t.is((res.filter(d => { return d.task === requestData.task }).length > 0), true)
})

test('Get request data by id', async t => {
  const newRequest = await Request.add(t.context.objTest)
  const request = new Request(newRequest.id)
  const requestData = await request.get()
  t.context.request = newRequest
  t.deepEqual(newRequest.id, requestData.id)
})

test('Error Get request id not found', async t => {
  const request = new Request(222)
  let err = await t.throwsAsync(() => {
    return request.get()
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Delete request', async t => {
  const newRequest = await Request.add(t.context.objTest)
  const request = new Request(newRequest.id)
  const requestData = await request.delete()
  t.deepEqual(requestData.id, newRequest.id)
})
