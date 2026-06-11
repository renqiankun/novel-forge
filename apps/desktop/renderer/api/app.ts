import { invokeMain } from './ipc'

export const appApi = {
  ping: (message?: string) => invokeMain('app:ping', message ? { message } : undefined),
  getRuntimeInfo: () => invokeMain('app:getRuntimeInfo'),
}
