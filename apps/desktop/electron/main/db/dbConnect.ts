import path from 'node:path'
import { existsSync } from 'node:fs'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'

import * as schema from './schema'
import logger from '../logger'
import { APP_NAME, DB_CONFIG } from '../utils/constants'
import { generateDirPath, getAppHand, getDirname } from '../utils'

const __dirname = getDirname(import.meta.url)
export const dbPath = path.join(getAppHand(), APP_NAME, DB_CONFIG.dbFileName)

generateDirPath(dbPath)

export const sqlite = new Database(dbPath, {
  timeout: DB_CONFIG.timeout,
})

export let db: BetterSQLite3Database<typeof schema>

export const dbConnect = async () => {
  db = drizzle(sqlite, { schema })
  logger.info(`SQLite connected: ${dbPath}`)

  const migrationsFolder = path.join(__dirname, '../../../migrations')
  if (process.env.NODE_ENV === 'production' && existsSync(migrationsFolder)) {
    await migrate(db, { migrationsFolder })
  }
}
