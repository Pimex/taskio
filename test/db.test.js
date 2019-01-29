'use strict'

import test from 'ava'
import { Db } from '../src'

test('Init database', async t => {
  let obj = { dbName: 'db_taskio', collection: 'task' }
  const db = await Db.init(obj)
  t.deepEqual(obj.dbName, db.db.s.databaseName)
})

test('Add document', async t => {
  const db = await Db.init({ dbName: 'db_taskio', collection: 'task' })
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  t.deepEqual(obj.email, document.email)
  t.truthy(document._id, true)
})

test('Update document', async t => {
  const db = await Db.init({ dbName: 'db_taskio', collection: 'task' })
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  obj.lastname = 'serna'
  let res = await db.update(document.id, obj)
  let newObj = await db.get(res.id)
  t.deepEqual(newObj.lastname, obj.lastname)
})

test('Get document by id', async t => {
  const db = await Db.init({ dbName: 'db_taskio', collection: 'task' })
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.get(document.id)
  t.deepEqual(res.id, document.id)
})

test('Error Get document id not found', async t => {
  const db = await Db.init({ dbName: 'db_taskio', collection: 'task' })
  let err = await t.throwsAsync(() => {
    return db.get(222)
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Delete document of collection', async t => {
  const db = await Db.init({ dbName: 'db_taskio', collection: 'task' })
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.delete(document.id)
  t.deepEqual(res.id, document.id)
})
