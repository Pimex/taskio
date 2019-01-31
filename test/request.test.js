'use strict'

import test from 'ava'
import { Request } from '../src'

test.beforeEach(async t => {
  t.context.objTest = {
    status: 200,
    method: 'POST',
    id_task: '-LXZGomXhQqGOcnJmdt9',
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

test('Add request', async t => {
  const requestData = await Request.add(t.context.objTest)
  t.context.request = requestData

  t.deepEqual(t.context.objTest.id_task, requestData.id_task)
  t.deepEqual(requestData.status, 200)
  t.truthy(requestData._id, true)
})

test('Get all request', async t => {
  const requestData = await Request.getAll()
  t.is((typeof requestData === 'object'), true)
})

test('Get all request by query', async t => {
  const requestData = await Request.add(t.context.objTest)
  let res = await Request.getAll({
    id_task: requestData.id_task
  })
  t.context.request = requestData
  t.is((res.filter(d => { return d.id_task === requestData.id_task }).length > 0), true)
})

test('Get request data by id', async t => {
  const newRequest = await Request.add(t.context.objTest)
  const request = new Request(newRequest.id)
  const requestData = await request.get()
  t.context.request = newRequest
  t.deepEqual(newRequest.id, requestData.id)
})

test('Delete request', async t => {
  const newRequest = await Request.add(t.context.objTest)
  const request = new Request(newRequest.id)
  const requestData = await request.delete()
  t.deepEqual(requestData.id, newRequest.id)
})
