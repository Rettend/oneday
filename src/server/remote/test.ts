import { action, query } from '@solidjs/router'
import z from 'zod'
import { idSchema, parse } from '~/utils'
import { db } from '../db'
import { Tests } from '../db/schema'

// #region GET Tests
const getTestsId = 'test:get'

export const getTests = query(async () => {
  // 'use server'
  const tests = await db
    .select()
    .from(Tests)
  return tests
}, getTestsId)
// #endregion

// #region CREATE Test
const createTestId = 'test:create'
const createTestSchema = z.object({
  id: idSchema.optional(),
})
type CreateTestInput = z.infer<typeof createTestSchema>

export const createTest = action(async (raw: CreateTestInput) => {
  // 'use server'
  const input = parse(createTestSchema, raw, createTestId)
  const [test] = await db
    .insert(Tests)
    .values(input)
    .returning()
  return test
}, createTestId)
// #endregion
