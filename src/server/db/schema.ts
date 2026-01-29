import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { uuidV7Base58 } from '~/utils/ids'

export const Users = sqliteTable('users', {
  id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
  name: text(),
  email: text().unique(),
  emailVerified: integer({ mode: 'boolean' }),
  image: text(),
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type SelectUser = typeof Users.$inferSelect
export type InsertUser = typeof Users.$inferInsert

export const Accounts = sqliteTable(
  'accounts',
  {
    userId: text()
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text(),
    accessToken: text(),
    expiresAt: integer(),
    tokenType: text(),
    scope: text(),
    idToken: text(),
    sessionState: text('session_state'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  account => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
)

export type SelectAccount = typeof Accounts.$inferSelect
export type InsertAccount = typeof Accounts.$inferInsert

export const ApiKeys = sqliteTable(
  'api_keys',
  {
    userId: text()
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    provider: text().notNull(),
    encryptedKey: text('encrypted_key').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  apiKeys => [
    primaryKey({
      columns: [apiKeys.userId, apiKeys.provider],
    }),
  ],
)

export type SelectApiKey = typeof ApiKeys.$inferSelect
export type InsertApiKey = typeof ApiKeys.$inferInsert

export const Conversations = sqliteTable('conversations', {
  id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
  userId: text()
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade' }),
  title: text(),
  modelProviderId: text('model_provider_id'),
  modelId: text('model_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type SelectConversation = typeof Conversations.$inferSelect
export type InsertConversation = typeof Conversations.$inferInsert

export const Messages = sqliteTable('messages', {
  id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => Conversations.id, { onDelete: 'cascade' }),
  role: text({ enum: ['system', 'user', 'assistant', 'data'] }).notNull(),
  content: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type SelectMessage = typeof Messages.$inferSelect
export type InsertMessage = typeof Messages.$inferInsert

// --- Relations ---

export const usersRelations = relations(Users, ({ many }) => ({
  conversations: many(Conversations),
}))

export const conversationsRelations = relations(Conversations, ({ one, many }) => ({
  user: one(Users, {
    fields: [Conversations.userId],
    references: [Users.id],
  }),
  messages: many(Messages),
}))

export const messagesRelations = relations(Messages, ({ one }) => ({
  conversation: one(Conversations, {
    fields: [Messages.conversationId],
    references: [Conversations.id],
  }),
}))
