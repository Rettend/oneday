import type { ClassValue } from 'clsx'
import bs58 from 'bs58'
import { clsx } from 'clsx'
import { unoMerge } from 'unocss-merge'
import { v7 } from 'uuid'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return unoMerge(clsx(inputs))
}

export function minify(strings: TemplateStringsArray, ...values: any[]): string {
  let result = strings[0]
  for (let i = 0; i < values.length; i++)
    result += values[i] + strings[i + 1]

  return result
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .trim()
}

export function uuidV7Base58(): string {
  const uuidBytes = new Uint8Array(16)
  v7(undefined, uuidBytes)
  return bs58.encode(uuidBytes)
}

export const idSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{22}$/, 'Invalid id format')

export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown, ctx?: string): z.infer<T> {
  const res = schema.safeParse(data)
  if (!res.success) {
    const pretty = z.prettifyError
      ? z.prettifyError(res.error)
      : JSON.stringify(res.error.issues)
    const prefix = ctx ? `[${ctx}] validation failed` : 'Validation failed'
    throw new Error(`${prefix}: ${pretty}`)
  }
  return res.data
}
