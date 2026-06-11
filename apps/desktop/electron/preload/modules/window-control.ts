import { ipcRenderer } from 'electron'

export const windowControl = {
  minimize: () => ipcRenderer.invoke('window-control:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window-control:toggle-maximize'),
  close: () => ipcRenderer.invoke('window-control:close'),
  getState: () => ipcRenderer.invoke('window-control:get-state'),
}
