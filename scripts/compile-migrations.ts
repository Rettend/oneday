/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const MIGRATIONS_DIR = path.join(process.cwd(), 'drizzle', 'migrations')
const JOURNAL_FILE = path.join(MIGRATIONS_DIR, 'meta', '_journal.json')

const journal = JSON.parse(
  fs.readFileSync(JOURNAL_FILE, 'utf-8'),
)

export interface MigrationMeta {
  idx: number
  when: number
  tag: string
  sql: string[]
}

const migrations: MigrationMeta[] = []

for (const entry of journal.entries) {
  const { when, idx, tag } = entry
  console.log(`Parsing migration: ${tag}`)

  const migrationFile = fs.readFileSync(
    path.join(MIGRATIONS_DIR, `${tag}.sql`),
    'utf-8',
  )

  migrations.push({
    idx,
    when,
    tag,
    sql: migrationFile
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(Boolean),
  })
}

if (!fs.existsSync(MIGRATIONS_DIR))
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true })

fs.writeFileSync(
  path.join(MIGRATIONS_DIR, 'migrations.json'),
  JSON.stringify(migrations, null, 2),
)
