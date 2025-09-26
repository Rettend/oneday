import * as s from 'drizzle-orm/sqlite-core'
import { uuidV7Base58 } from '~/utils'

export const Tests = s.sqliteTable('tests', {
  id: s.text().primaryKey().$defaultFn(() => uuidV7Base58()),
  createdAt: s.integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
}, test => [
  s.primaryKey({
    columns: [test.id],
  }),
])

export type Test = typeof Tests.$inferSelect
export type TestNew = typeof Tests.$inferInsert
