/* eslint-disable no-console */
import type { Client as DatabaseType } from '@libsql/client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { clientEnv } from '~/env/client'
import * as schema from './schema'

let _sqlite: DatabaseType | null = null
let _devDb: LibSQLDatabase<typeof schema> | null = null
const pendingOperations = new Map<string, Promise<any>>()

function getDevDb() {
  if (!_devDb || !_sqlite) {
    _sqlite = createClient({ url: `file:${clientEnv.VITE_DB_FILE}` })
    _devDb = drizzle(_sqlite, { schema, casing: 'snake_case' })
  }
  return {
    sqlite: _sqlite,
    devDb: _devDb,
  }
}

export async function syncDevDb(operation: { sql: string, params: any[] }) {
  'use server'

  if (!import.meta.env.DEV)
    throw new Error('Only available in development')

  const opKey = JSON.stringify(operation)

  if (pendingOperations.has(opKey)) {
    console.log('[DEV] Skipping duplicate operation:', operation)
    return pendingOperations.get(opKey)
  }

  console.log('[DEV] Syncing local db operation:', operation)

  const operationPromise = (async () => {
    try {
      const { sqlite } = getDevDb()
      await new Promise(resolve => setTimeout(resolve, 50))
      const tx = await sqlite.transaction('write')
      try {
        await tx.execute({ sql: operation.sql, args: operation.params })
        await tx.commit()
        console.log('[DEV] Operation executed successfully')
        return { success: true }
      }
      catch (error) {
        await tx.rollback()
        console.error('Error in transaction:', error)
        throw error
      }
    }
    catch (error) {
      console.error('Error syncing to local db:', error)
      throw error
    }
    finally {
      pendingOperations.delete(opKey)
    }
  })()

  pendingOperations.set(opKey, operationPromise)
  return operationPromise
}

export async function copyDBFile(file: File) {
  'use server'

  if (!import.meta.env.DEV)
    throw new Error('Only available in development')

  console.log('[DEV] Copying database file:', file)

  try {
    const buffer = await file.arrayBuffer()

    await mkdir(dirname(clientEnv.VITE_DB_FILE), { recursive: true })
    fs.writeFileSync(clientEnv.VITE_DB_FILE, Buffer.from(buffer))

    console.log('[DEV] Database file copied successfully')
    return { success: true }
  }
  catch (error) {
    console.error('Error copying database file:', error)
    throw error
  }
}
