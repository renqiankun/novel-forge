import pkg from '../../../package.json'

export const APP_NAME = pkg.productName ?? pkg.name

const DB_NAME = process.env.NODE_ENV === 'development' ? 'novel-forge.dev.db' : 'novel-forge.db'

export const DB_CONFIG = {
  dbFileName: DB_NAME,
  timeout: 30 * 1000,
}

export const UPDATE_CHANNEL = {
  INIT: 'update-init',
  SET_URL: 'update-set-url',
  CHECK_UPDATE: 'update-check-update',
  DOWNLOAD_UPDATE: 'update-download-file',
  EXIT_AND_INSTALL: 'update-exit-and-install',
  MSG: 'update-render-msg',
} as const

export enum UPDATE_CODE {
  error = -1,
  checking = 0,
  updateAvailable = 1,
  updateNotAvailable = 2,
  downloadProgress = 3,
  updateDownloaded = 4,
}
