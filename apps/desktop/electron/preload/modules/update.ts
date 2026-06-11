import { ipcRenderer } from 'electron'

import { UPDATE_CHANNEL } from '../../main/utils/constants'

export const update = {
  onUpdateMsg: (callback: (response: unknown) => void) => {
    ipcRenderer.send(UPDATE_CHANNEL.MSG)
    ipcRenderer.on(UPDATE_CHANNEL.MSG, (_event, response) => callback(response))
  },
  setUrl: async (url: string) => ipcRenderer.invoke(UPDATE_CHANNEL.SET_URL, url),
  checkUpdate: () => ipcRenderer.send(UPDATE_CHANNEL.CHECK_UPDATE),
  startDownload: () => ipcRenderer.send(UPDATE_CHANNEL.DOWNLOAD_UPDATE),
  quitAndInstall: () => ipcRenderer.send(UPDATE_CHANNEL.EXIT_AND_INSTALL),
}
