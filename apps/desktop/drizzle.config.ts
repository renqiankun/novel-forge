import { defineConfig } from 'drizzle-kit'
import path, { dirname } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import { APP_NAME, DB_CONFIG } from './electron/main/utils/constants'

const databasePath = path.join(process.env.APPDATA ?? '', APP_NAME, DB_CONFIG.dbFileName)

const ensureParentDir = (filePath: string) => {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

ensureParentDir(databasePath)

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/main/db/schema/index.ts',
  out: './migrations',
  dbCredentials: {
    url: databasePath,
  },
})
