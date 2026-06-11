import type {
  AppEventChannel,
  AppEventPayloadMap,
  AppInvokeChannel,
  AppInvokePayloadMap,
  AppInvokeResultMap,
} from '../../electron/shared/ipc'

const getIpcBridge = () => {
  const bridge = window.electronAPI?.ipc
  if (!bridge) {
    throw new Error('Electron IPC bridge is not available')
  }
  return bridge
}

export const invokeMain = <TChannel extends AppInvokeChannel>(
  channel: TChannel,
  payload?: AppInvokePayloadMap[TChannel],
): Promise<AppInvokeResultMap[TChannel]> => getIpcBridge().invoke(channel, payload)

export const onMainEvent = <TChannel extends AppEventChannel>(
  channel: TChannel,
  callback: (payload: AppEventPayloadMap[TChannel]) => void,
) => getIpcBridge().on(channel, callback)
