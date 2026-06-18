import { app } from 'electron'
import log from 'electron-log'
import os from 'node:os'
import path from 'node:path'

import { APP_NAME } from '../utils/constants'

const fallbackAppDataPath = () => process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')

const hasElectronAppPath = (value: unknown): value is { getPath: (name: string) => string } =>
  Boolean(value && typeof value === 'object' && 'getPath' in value && typeof (value as { getPath?: unknown }).getPath === 'function')

log.transports.file.resolvePathFn = () => path.join(hasElectronAppPath(app) ? app.getPath('appData') : fallbackAppDataPath(), APP_NAME, 'log', 'main.log')

const date = new Date()
const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

log.transports.file.fileName = `${dateStr}.log`
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}][{processType}][{level}]{scope} {text}'
log.transports.file.maxSize = 10 * 1024 * 1024

const isMcpStdioProcess = process.argv.some((item) => item.includes('mcp-stdio'))

if (process.env.NODE_ENV === 'production' || process.env.NOVELFORGE_MCP_STDIO === '1' || isMcpStdioProcess) {
  log.transports.console.level = false
}

export default log
