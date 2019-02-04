'use strict'

import test from 'ava'
import { Webhook } from '../src'
import Hapi from 'hapi'

const url = 'https://pokeapi.co/api/v2/pokemon/ditto/'

async function startServer () {
  const server = Hapi.server({
    host: '0.0.0.0'
  })

  server.route({
    method: '*',
    path: '/{params*}',
    handler: (request, h) => {
      const res = {
        payload: request.payload,
        params: request.params,
        query: request.query,
        headers: request.headers
      }

      return h.response(res).code(200)
    }
  })

  await server.start()

  return server.info
}

test.afterEach(async t => {
  if (t.context.webhook) {
    const whook = new Webhook(t.context.webhook.id)
    await whook.delete()
  }
})

test('Add new Webhook', async t => {
  const whook = await Webhook.add({
    url
  })

  t.context.webhook = whook

  t.deepEqual(whook.method, 'POST')
  t.deepEqual(whook.url, url)
})

test('Get WebHook data', async t => {
  let whook = await Webhook.add({
    url
  })

  whook = new Webhook(whook.id)
  const whData = await whook.get()

  t.context.webhook = whook

  t.deepEqual(whData.method, 'POST')
  t.deepEqual(whData.url, url)
})

test('Remove WebHook', async t => {
  let whook = await Webhook.add({
    url
  })

  whook = new Webhook(whook.id)
  const whData = await whook.delete()

  t.deepEqual(whData.method, 'POST')
  t.deepEqual(whData.url, url)
})

test('Update WebHook data', async t => {
  let whook = await Webhook.add({
    url
  })

  whook = new Webhook(whook.id)
  await whook.update({
    method: 'GET'
  })

  const whData = await whook.get()

  t.context.webhook = whook

  t.deepEqual(whData.method, 'GET')
  t.deepEqual(whData.url, url)
})

test('Send WebHook', async t => {
  const server = await startServer()

  let whook = await Webhook.add({
    url: server.uri,
    headers: {
      test: 'Test header Content'
    },
    body: {
      test: 'Test conten Body'
    },
    query: {
      test: 'Test param'
    }
  })

  whook = new Webhook(whook.id)
  const req = await whook.send()

  t.context.webhook = whook

  t.deepEqual(req.response.body.headers.test, 'Test header Content')
  t.deepEqual(req.response.body.payload.test, 'Test conten Body')
  t.deepEqual(req.response.body.query.test, 'Test param')
})

test('Get all requests by webhook', async t => {
  let whook = await Webhook.add({
    url
  })

  whook = new Webhook(whook.id)

  await whook.update({
    method: 'GET'
  })

  await whook.send()
  const res = await whook.send()

  const requests = await whook.req.getAll()

  t.context.webhook = whook

  t.deepEqual(requests[0].webhook, whook.id)
  t.is(requests.filter(r => r.id === res.id).length > 0, true)
  t.is(requests.length > 1, true)
})

test('Remove all requests by webhook', async t => {
  let whook = await Webhook.add({
    url
  })

  whook = new Webhook(whook.id)

  await whook.update({
    method: 'GET'
  })

  await whook.send()
  const res = await whook.send()

  await whook.req.removeAll()
  const requests = await whook.req.getAll()

  t.context.webhook = whook

  t.deepEqual(res.webhook, whook.id)
  t.is(requests.length <= 0, true)
})
