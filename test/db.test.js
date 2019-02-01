'use strict'

import test from 'ava'
import { Db } from '../src'
import uuid from 'uuid/v4'

test.before(async t => {
  t.context.dbName = 'db_taskio'
  t.context.collection = 'task'
  const obj = { dbName: t.context.dbName, collection: t.context.collection }

  t.context.db = Db.init(obj)
})

test.afterEach(async t => {
  const db = t.context.db
  if (t.context.document) {
    await db.delete(t.context.document.id)
  }
})

test('Key gen method', async t => {
  const long = 25
  const customKey = Db.keyGen(long)
  const key = Db.keyGen()

  t.true(typeof key === 'string')
  t.true(typeof customKey === 'string')
  t.true(key.length > 12)
  t.true(customKey.length > long)
})

test('Get all documents by query', async t => {
  const email = `${uuid()}@taskio.com`
  const db = t.context.db
  let document = await db.add({ name: 'willy', email })
  let res = await db.getAll({
    email
  })

  t.context.document = document

  t.is((res.filter(d => { return d.id === document.id }).length > 0), true)
})

test('Get all documents', async t => {
  const db = t.context.db
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.getAll()

  t.context.document = document

  t.is((res.filter(d => { return d.id === document.id }).length > 0), true)
})

test('Init database', async t => {
  const dbName = t.context.dbName
  const instanse = await t.context.db.getInstance()
  t.deepEqual(dbName, instanse.s.databaseName)
})

test('Add document', async t => {
  const db = t.context.db
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  await db.delete(document.id)
  t.deepEqual(obj.email, document.email)
  t.truthy(document._id, true)
})

test('Error Add document data not found or invalid', async t => {
  const db = t.context.db
  let obj = 'willy'
  let err = await t.throwsAsync(() => {
    return db.add(obj)
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Update document', async t => {
  const db = t.context.db
  let obj = { name: 'willy', email: 'wserna@gmail.com' }
  let document = await db.add(obj)
  obj.lastname = 'serna'
  let res = await db.update(document.id, obj)
  let newObj = await db.get(res.id)
  await db.delete(document.id)
  t.deepEqual(newObj.lastname, obj.lastname)
})

test('Error Update document data not found or invalid', async t => {
  const db = t.context.db
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
  const db = t.context.db
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.get(document.id)
  await db.delete(document.id)
  t.deepEqual(res.id, document.id)
})

test('Error Get document id not found', async t => {
  const db = t.context.db
  let err = await t.throwsAsync(() => {
    return db.get(222)
  })
  t.deepEqual(err.output.statusCode, 404)
  t.regex(err.message, /not found/)
})

test('Delete document of collection', async t => {
  const db = t.context.db
  let document = await db.add({ name: 'willy', email: 'wserna@gmail.com' })
  let res = await db.delete(document.id)
  t.deepEqual(res.id, document.id)
})
