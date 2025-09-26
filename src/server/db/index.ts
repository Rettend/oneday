/* eslint-disable no-console */
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import type { SQLocalDrizzle } from 'sqlocal/drizzle'
import { isServer } from 'solid-js/web'
import { clientEnv } from '~/env/client'
import { copyDBFile, syncDevDb } from './dev'
import * as schema from './schema'

interface ClientDb extends SqliteRemoteDatabase {
  connect: () => Promise<SqliteRemoteDatabase>
  reset: () => Promise<boolean>
}

let _db: SqliteRemoteDatabase<typeof schema> | null = null
let _sqlocal: SQLocalDrizzle | null = null
let _sql: any = null
let _connectPromise: Promise<SqliteRemoteDatabase<typeof schema>> | null = null

export const db = new Proxy({} as ClientDb & typeof schema, {
  get(_, prop) {
    if (prop === 'connect')
      return connect

    if (prop === 'reset')
      return reset

    if (Object.prototype.hasOwnProperty.call(schema, prop))
      return Reflect.get(schema, prop)

    if (!_db)
      throw new Error('Database not initialized. Call db.connect() first')

    return Reflect.get(_db, prop)
  },
})

async function reset() {
  if (isServer)
    throw new Error('Database can only be reset in browser environment')

  if (!_sqlocal) {
    const [{ SQLocalDrizzle }] = await Promise.all([
      import('sqlocal/drizzle'),
    ])
    _sqlocal = new SQLocalDrizzle(clientEnv.VITE_DB_FILE)
  }

  _db = null
  _sql = null

  await _sqlocal.deleteDatabaseFile(async () => {
    console.log('Database deleted, preparing to initialize...')
  })

  _sqlocal = null

  console.log('Database reset completed. Refreshing page...')
  window.location.reload()

  return true
}

async function connect() {
  if (_db)
    return _db

  if (_connectPromise)
    return _connectPromise

  if (isServer)
    throw new Error('Database can only be initialized in browser environment')

  _connectPromise = (async () => {
    const [{ drizzle }, { SQLocalDrizzle }, migrations] = await Promise.all([
      import('drizzle-orm/sqlite-proxy'),
      import('sqlocal/drizzle'),
      import('../../../drizzle/migrations/migrations.json'),
    ])

    _sqlocal = new SQLocalDrizzle(clientEnv.VITE_DB_FILE)
    const { driver, batchDriver, sql } = _sqlocal

    _db = drizzle(driver, batchDriver, {
      casing: 'snake_case',
      logger: import.meta.env.DEV
        ? {
            logQuery: (query: string, params: any[]) => {
              const operationType = query.trim().split(' ')[0].toUpperCase()
              if (['INSERT', 'UPDATE', 'DELETE'].includes(operationType))
                syncDevDb({ sql: query, params }).catch(console.error)
            },
          }
        : false,
    })

    _sql = sql

    await initDb(migrations.default)

    if (import.meta.env.DEV)
      await copyInitialDb(_sqlocal)

    return _db
  })()

  try {
    return await _connectPromise
  }
  finally {
    _connectPromise = null
  }
}

async function copyInitialDb(sqlocal: SQLocalDrizzle) {
  try {
    const dbFile = await sqlocal.getDatabaseFile()
    await copyDBFile(dbFile)
  }
  catch (error: any) {
    if (error?.name === 'NotFoundError')
      console.log('[DEV] Initial database sync skipped (file not found yet)')
    else
      console.error('[DEV] Initial database sync failed:', error)
  }
}

async function initDb(migrations: any[]) {
  if (!_sql)
    throw new Error('SQL not initialized')

  await _sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      tag TEXT NOT NULL
    )
  `

  const result = await _sql`
    SELECT created_at 
    FROM __drizzle_migrations 
    ORDER BY created_at DESC 
    LIMIT 1
  `
  const lastMigration = result[0]?.created_at ?? 0

  for (const migration of migrations) {
    if (migration.when > lastMigration) {
      console.log(`Applying migration: ${migration.tag}`)

      for (const statement of migration.sql)
        await _sql(statement)

      await _sql`
        INSERT INTO __drizzle_migrations (hash, created_at, tag)
        VALUES (${migration.tag}, ${migration.when}, ${migration.tag})
      `
    }
  }
}
