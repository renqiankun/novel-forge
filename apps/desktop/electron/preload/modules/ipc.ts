import { ipcRenderer, type IpcRendererEvent } from 'electron'

import {
  isAppEventChannel,
  isAppInvokeChannel,
  type AppEventChannel,
  type AppEventPayloadMap,
  type AppInvokeChannel,
  type AppInvokePayloadMap,
  type AppInvokeResultMap,
} from '../../shared/ipc'

export const ipcBridge = {
  invoke: <TChannel extends AppInvokeChannel>(
    channel: TChannel,
    payload?: AppInvokePayloadMap[TChannel],
  ): Promise<AppInvokeResultMap[TChannel]> => {
    if (!isAppInvokeChannel(channel)) {
      return Promise.reject(new Error(`Unsupported IPC invoke channel: ${channel}`))
    }
    return ipcRenderer.invoke(channel, payload)
  },

  on: <TChannel extends AppEventChannel>(
    channel: TChannel,
    callback: (payload: AppEventPayloadMap[TChannel]) => void,
  ) => {
    if (!isAppEventChannel(channel)) {
      throw new Error(`Unsupported IPC event channel: ${channel}`)
    }

    const listener = (_event: IpcRendererEvent, payload: AppEventPayloadMap[TChannel]) => {
      callback(payload)
    }

    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
}
