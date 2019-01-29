'use strict'

import test from 'ava'
import { Db } from '../src'

test('Init database', async t => {
  const db = await Db.init({ dbName: 'db_taskio', collection: 'task' })
  // await Db.connect()
  // const db = new Db({ dbName: 'db_taskio', collection: 'task' })
  await db.add({ hola: 'willy'})
  let res = await db.getAll()
  console.log(res)
  t.is(true, true)
})