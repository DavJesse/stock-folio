import { readFileSync } from 'fs'
import db from './db'

/**
 * Runs a SQL migration file using the Turso (libSQL) client.
 * Supports multi-statement SQL files.
 *
 * @param path - Path to the migration .sql file
 */
export async function runMigration(path: string) {
  // Read the SQL file
  const schema = readFileSync(path, 'utf8')

  // Execute migration (Turso supports multi-statement SQL)
  await db.execute(schema)
}
