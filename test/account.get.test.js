'use strict'

import test from 'ava'
import { Account } from '../src'

test('Get Account data', async t => {
  const account = new Account('test')
  const accountData = await account.get()

  console.log(accountData)
  t.is(true, true)
})
