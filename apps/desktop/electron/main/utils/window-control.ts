import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'

type MainWindowGetter = () => BrowserWindow | null

const getWindowFromEvent = (event: IpcMainInvokeEvent, getMainWindow: MainWindowGetter) => {
  return BrowserWindow.fromWebContents(event.sender) ?? getMainWindow()
}

export const registerWindowControls = (getMainWindow: MainWindowGetter) => {
  ipcMain.handle('window-control:minimize', event => {
    getWindowFromEvent(event, getMainWindow)?.minimize()
  })

  ipcMain.handle('window-control:toggle-maximize', event => {
    const win = getWindowFromEvent(event, getMainWindow)
    if (!win) return false

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }

    return win.isMaximized()
  })

  ipcMain.handle('window-control:close', event => {
    const win = getWindowFromEvent(event, getMainWindow)
    if (!win) return

    if (process.platform === 'win32') {
      win.hide()
      return
    }

    win.close()
  })

  ipcMain.handle('window-control:get-state', event => {
    const win = getWindowFromEvent(event, getMainWindow)
    return {
      isMaximized: Boolean(win?.isMaximized()),
      platform: process.platform
    }
  })
}
