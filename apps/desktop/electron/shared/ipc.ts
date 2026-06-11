export const APP_INVOKE_CHANNELS = ['app:ping', 'app:getRuntimeInfo'] as const
export const APP_EVENT_CHANNELS = ['app:status'] as const

export type AppInvokeChannel = (typeof APP_INVOKE_CHANNELS)[number]
export type AppEventChannel = (typeof APP_EVENT_CHANNELS)[number]

export interface AppPingPayload {
  message?: string
}

export interface AppPingResult {
  message: string
  receivedAt: string
}

export interface AppRuntimeInfo {
  appName: string
  appVersion: string
  platform: string
  env: string
}

export interface AppStatusEvent {
  status: 'ready' | 'busy' | 'error'
  detail?: string
}

export interface AppInvokePayloadMap {
  'app:ping': AppPingPayload | undefined
  'app:getRuntimeInfo': undefined
}

export interface AppInvokeResultMap {
  'app:ping': AppPingResult
  'app:getRuntimeInfo': AppRuntimeInfo
}

export interface AppEventPayloadMap {
  'app:status': AppStatusEvent
}

export const isAppInvokeChannel = (channel: string): channel is AppInvokeChannel =>
  (APP_INVOKE_CHANNELS as readonly string[]).includes(channel)

export const isAppEventChannel = (channel: string): channel is AppEventChannel =>
  (APP_EVENT_CHANNELS as readonly string[]).includes(channel)
