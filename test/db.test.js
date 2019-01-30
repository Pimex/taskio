'use strict'

import test from 'ava'
import { Db } from '../src'

test.before(t => {
  t.context.dbName = 'db_taskio'
  t.context.collection = 'task'
})

test('Init database', async t => {
  let obj = { dbName: t.context.dbName, collection: t.context.collection }
  const db = await Db.init(obj)
  t.deepEqual(obj.dbName, db.db.s.databaseName)
})

test('Add document', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  await db.delete(document.id)
  t.deepEqual(obj.email, document.email)
  t.truthy(document._id, true)
})

test('Error Add document data not found or invalid', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let obj = 'willy'
  let err = await t.throwsAsync(() => {
    return db.add(obj)
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Update document', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  obj.lastname = 'serna'
  let res = await db.update(document.id, obj)
  let newObj = await db.get(res.id)
  await db.delete(document.id)
  t.deepEqual(newObj.lastname, obj.lastname)
})

test('Error Update document data not found or invalid', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  obj = null
  let err = await t.throwsAsync(() => {
    return db.update(document.id, obj)
  })
  await db.delete(document.id)
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Get document by id', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.get(document.id)
  await db.delete(document.id)
  t.deepEqual(res.id, document.id)
})

test('Error Get document id not found', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let err = await t.throwsAsync(() => {
    return db.get(222)
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Delete document of collection', async t => {
  const db = await Db.init({ dbName: t.context.dbName, collection: t.context.collection })
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.delete(document.id)
  t.deepEqual(res.id, document.id)
})
