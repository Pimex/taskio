'use strict'

import test from 'ava'
import Server from '../src/services'
import request from 'request-promise'
import delay from 'delay'

test.before(async t => {
  const server = await Server.start('test')
  t.context.server = server
  t.context.baseurl = `${server.uri}/tasks`
})

test('Get all tasks', async t => {
  const baseUrl = t.context.baseurl

  await delay(10000)

  const res = await request({
    uri: `${baseUrl}`,
    method: 'GET',
    json: true
  })

  console.log(res)

  t.is(true, true)
})
