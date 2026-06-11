/// <reference types="vite/client" />

import type * as fs from 'node:fs'
import type {
  AppEventChannel,
  AppEventPayloadMap,
  AppInvokeChannel,
  AppInvokePayloadMap,
  AppInvokeResultMap,
} from './electron/shared/ipc'

interface FsProxy {
  readFile: typeof fs.readFile
  writeFile: typeof fs.writeFile
  appendFile: typeof fs.appendFile
  mkdir: typeof fs.mkdir
  readdir: typeof fs.readdir
  stat: typeof fs.stat
  rmdir: typeof fs.rmdir
  rename: typeof fs.rename
  copyFile: typeof fs.copyFile
  access: typeof fs.access
  chmod: typeof fs.chmod
  chown: typeof fs.chown
  fstat: typeof fs.fstat
}

interface AppUpdate {
  onUpdateMsg: (callback: (data: unknown) => void) => void
  setUrl: (url: string) => Promise<void>
  checkUpdate: () => void
  startDownload: () => void
  quitAndInstall: () => void
}

interface Logger {
  warn: (msg: unknown) => Promise<void>
  error: (msg: unknown) => Promise<void>
  info: (msg: unknown) => Promise<void>
  verbose: (msg: unknown) => Promise<void>
  debug: (msg: unknown) => Promise<void>
  silly: (msg: unknown) => Promise<void>
}

interface WindowControl {
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  close: () => Promise<void>
  getState: () => Promise<{
    isMaximized: boolean
    platform: NodeJS.Platform
  }>
}

interface AppIpcBridge {
  invoke: <TChannel extends AppInvokeChannel>(
    channel: TChannel,
    payload?: AppInvokePayloadMap[TChannel],
  ) => Promise<AppInvokeResultMap[TChannel]>
  on: <TChannel extends AppEventChannel>(
    channel: TChannel,
    callback: (payload: AppEventPayloadMap[TChannel]) => void,
  ) => () => void
}

declare global {
  interface Window {
    electronAPI?: {
      env: string
      fs: FsProxy
      ipc: AppIpcBridge
      update: AppUpdate
      logger: Logger
      windowControl: WindowControl
    }
  }
}

export {}
