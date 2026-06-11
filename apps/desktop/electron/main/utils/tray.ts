import path from 'node:path'
import { app, BrowserWindow, Menu, Tray } from 'electron'

type MainWindowGetter = () => BrowserWindow | null

let tray: Tray | null = null

export const addTray = (rootDir: string, getMainWindow: MainWindowGetter) => {
  const iconPath = path.join(rootDir, './assets/icon/tray.png')
  tray = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([{ label: '退出', click: () => app.quit() }])
  tray.setToolTip('NovelForge')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    const win = getMainWindow()
    win?.show()
    win?.focus()
  })
}
