import { contextBridge } from 'electron'

import { dbProxy } from './modules/db'
import { fsProxy } from './modules/fs'
import { ipcBridge } from './modules/ipc'
import { logger } from './modules/logger'
import { update } from './modules/update'
import { windowControl } from './modules/window-control'

contextBridge.exposeInMainWorld('electronAPI', {
  env: process.env.NODE_ENV,
  fs: fsProxy,
  queryDB: dbProxy.queryDB,
  ipc: ipcBridge,
  logger,
  update,
  windowControl,
})
