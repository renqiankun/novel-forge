import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import logger from '../logger'

export const getUUID = (): string => randomUUID()

export const getAppHand = () => app.getPath('appData')

export const getUserDataPath = () => app.getPath('userData')

export const getResourcePath = () => process.resourcesPath

export const isMac = () => process.platform === 'darwin'

export function getDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl))
}

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

export const generateDirPath = (filePath: string) => {
  try {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  } catch (error) {
    logger.error('Failed to create application directory:', error)
    throw error
  }
}
