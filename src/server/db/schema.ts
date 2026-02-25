import { relations } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { uuidV7Base58 } from '~/utils/ids'

export const Users = sqliteTable('users', {
  id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
  name: text(),
  email: text().unique(),
  emailVerified: integer({ mode: 'boolean' }),
  image: text(),
  defaultModelProviderId: text('default_model_provider_id'),
  defaultModelId: text('default_model_id'),
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

export const ActivityLogs = sqliteTable(
  'activity_logs',
  {
    id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
    userId: text()
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    timestamp: integer({ mode: 'timestamp' }).notNull(),
    appName: text('app_name').notNull(),
    windowTitle: text('window_title').notNull(),
    browserUrl: text('browser_url'),
    category: text(),
    isIdle: integer('is_idle', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  activityLogs => [
    index('activity_logs_user_timestamp_idx').on(activityLogs.userId, activityLogs.timestamp),
  ],
)

export type SelectActivityLog = typeof ActivityLogs.$inferSelect
export type InsertActivityLog = typeof ActivityLogs.$inferInsert

export const CategoryRules = sqliteTable(
  'category_rules',
  {
    id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
    userId: text()
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    pattern: text().notNull(),
    matchField: text('match_field', { enum: ['app_name', 'window_title', 'browser_url'] }).notNull(),
    category: text().notNull(),
    priority: integer().notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  categoryRules => [
    index('category_rules_user_priority_idx').on(categoryRules.userId, categoryRules.priority),
  ],
)

export type SelectCategoryRule = typeof CategoryRules.$inferSelect
export type InsertCategoryRule = typeof CategoryRules.$inferInsert

export const Contracts = sqliteTable(
  'contracts',
  {
    id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
    userId: text()
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    date: text().notNull(),
    status: text({ enum: ['draft', 'active', 'complete'] }).notNull().default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  contracts => [
    uniqueIndex('contracts_user_date_unique_idx').on(contracts.userId, contracts.date),
  ],
)

export type SelectContract = typeof Contracts.$inferSelect
export type InsertContract = typeof Contracts.$inferInsert

export const ContractBlocks = sqliteTable(
  'contract_blocks',
  {
    id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
    contractId: text('contract_id')
      .notNull()
      .references(() => Contracts.id, { onDelete: 'cascade' }),
    label: text().notNull(),
    category: text().notNull(),
    targetMinutes: integer('target_minutes').notNull(),
    completedMinutes: integer('completed_minutes').notNull().default(0),
    order: integer().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  contractBlocks => [
    index('contract_blocks_contract_order_idx').on(contractBlocks.contractId, contractBlocks.order),
  ],
)

export type SelectContractBlock = typeof ContractBlocks.$inferSelect
export type InsertContractBlock = typeof ContractBlocks.$inferInsert

export const Goals = sqliteTable('goals', {
  id: text().primaryKey().$defaultFn(() => uuidV7Base58()),
  userId: text()
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  type: text({ enum: ['countdown', 'counter', 'tracker'] }).notNull(),
  metadata: text().notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type SelectGoal = typeof Goals.$inferSelect
export type InsertGoal = typeof Goals.$inferInsert

// --- Relations ---

export const usersRelations = relations(Users, ({ many }) => ({
  conversations: many(Conversations),
  activityLogs: many(ActivityLogs),
  categoryRules: many(CategoryRules),
  contracts: many(Contracts),
  goals: many(Goals),
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

export const activityLogsRelations = relations(ActivityLogs, ({ one }) => ({
  user: one(Users, {
    fields: [ActivityLogs.userId],
    references: [Users.id],
  }),
}))

export const categoryRulesRelations = relations(CategoryRules, ({ one }) => ({
  user: one(Users, {
    fields: [CategoryRules.userId],
    references: [Users.id],
  }),
}))

export const contractsRelations = relations(Contracts, ({ one, many }) => ({
  user: one(Users, {
    fields: [Contracts.userId],
    references: [Users.id],
  }),
  blocks: many(ContractBlocks),
}))

export const contractBlocksRelations = relations(ContractBlocks, ({ one }) => ({
  contract: one(Contracts, {
    fields: [ContractBlocks.contractId],
    references: [Contracts.id],
  }),
}))

export const goalsRelations = relations(Goals, ({ one }) => ({
  user: one(Users, {
    fields: [Goals.userId],
    references: [Users.id],
  }),
}))
