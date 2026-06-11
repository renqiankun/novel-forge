import { ipcRenderer } from 'electron'

const sendLog = async (level: string, msg: unknown) =>
  ipcRenderer.send('__ELECTRON_LOG__', {
    data: [msg],
    level,
    variables: { processType: 'renderer' },
  })

export const logger = {
  error: (msg: unknown) => sendLog('error', msg),
  warn: (msg: unknown) => sendLog('warn', msg),
  info: (msg: unknown) => sendLog('info', msg),
  verbose: (msg: unknown) => sendLog('verbose', msg),
  debug: (msg: unknown) => sendLog('debug', msg),
  silly: (msg: unknown) => sendLog('silly', msg),
}
