'use strict'

const test = require('ava')
const Request = require('../src/lib/request/index.js')
const fixtures = require('./fixtures')
const uuid = require('uuid')

test.beforeEach(async t => {
  const server = await fixtures.webhook.server()
  t.context.server = server
})

test.afterEach(async t => {
  if (t.context.request) {
    const request = new Request(t.context.request.id)
    await request.delete()
  }
})

test('Send request error response', async t => {
  const req = await Request.send({
    url: `${t.context.server.uri}/error/400`
  })

  t.deepEqual(typeof req.id, 'string')
  t.deepEqual(typeof req.statusCode, 'number')
  t.deepEqual(req.method, 'POST')
  t.is(req.statusCode >= 400, true)
})

test('Send request', async t => {
  const req = await Request.send({
    url: `${t.context.server.uri}`
  })

  t.deepEqual(typeof req.id, 'string')
  t.deepEqual(typeof req.statusCode, 'number')
  t.deepEqual(req.method, 'POST')
  t.is(req.statusCode >= 200, true)
})

test('Add request', async t => {
  const requestData = fixtures.request.data()
  const request = await Request.add(requestData)
  t.context.request = request

  t.deepEqual(requestData.task, request.task)
  t.deepEqual(request.statusCode, requestData.statusCode)
})

test('Error add task data invalid', async t => {
  let err = await t.throwsAsync(() => {
    return Request.add({ email: 'invalidemail' })
  })
  t.deepEqual(err.output.statusCode, 400)
})

test('Get all request', async t => {
  const requestData = fixtures.request.data()
  const request = await Request.add(requestData)
  const reqts = await Request.getAll()

  t.context.request = request

  t.true((typeof requestData === 'object'))
  t.true(reqts.filter(r => r.id === request.id).length > 0)
})

test('Get all request by query', async t => {
  const requestData = fixtures.request.data()
  const request = await Request.add(requestData)

  let requests = await Request.getAll({
    task: request.task
  })

  t.context.request = request
  t.true((requests.filter(d => { return d.task === request.task }).length > 0))
})

test('Get request data by id', async t => {
  const newRequest = await Request.add(fixtures.request.data())
  const request = new Request(newRequest.id)
  const requestData = await request.get()
  t.context.request = newRequest

  t.deepEqual(newRequest.id, requestData.id)
})

test('Error Get request id not found', async t => {
  const request = new Request(uuid.v4())

  let err = await t.throwsAsync(() => {
    return request.get()
  })

  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Delete request', async t => {
  const requestData = fixtures.request.data()
  const newRequest = await Request.add(requestData)
  const request = new Request(newRequest.id)
  const requestDelete = await request.delete()

  const requests = await Request.getAll()

  t.true(requests.filter(r => r.id === request.id).length < 1)
  t.deepEqual(requestDelete.id, newRequest.id)
})

test('Delete many request', async t => {
  const requestData = fixtures.request.data()
  await Request.add(requestData)
  await Request.add(requestData)

  const reqDel = await Request.deleteMany({
    task: requestData.task
  })

  t.true(reqDel.deletedCount > 1)
})
