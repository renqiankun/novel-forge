import { app, ipcMain } from 'electron'

import type { AppInvokePayloadMap, AppInvokeResultMap } from '../../shared/ipc'

export const registerAppIpcHandlers = () => {
  ipcMain.handle(
    'app:ping',
    (_event, payload: AppInvokePayloadMap['app:ping']): AppInvokeResultMap['app:ping'] => ({
      message: payload?.message ?? 'pong',
      receivedAt: new Date().toISOString(),
    }),
  )

  ipcMain.handle('app:getRuntimeInfo', (): AppInvokeResultMap['app:getRuntimeInfo'] => ({
    appName: app.getName(),
    appVersion: app.getVersion(),
    platform: process.platform,
    env: process.env.NODE_ENV ?? 'development',
  }))
}
