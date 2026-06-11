import path from 'node:path'
import { app, BrowserWindow, Menu } from 'electron'

import './auto-update/index'
import { dbInit } from './dbInit'
import { registerAppIpcHandlers } from './ipc'
import logger from './logger'
import { createDesktopMcpPlaceholder } from './mcp/server-placeholder'
import { getDirname } from './utils'
import { addTray } from './utils/tray'
import { registerWindowControls } from './utils/window-control'

const __dirname = getDirname(import.meta.url)
const rootDir = path.join(__dirname, '../../')
const electronDist = path.join(__dirname, '../../dist')
const preloadDir = path.join(__dirname, '../preload')

let mainWindow: BrowserWindow | null = null
let isQuitting = false

const showMainWindow = () => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

const createWindow = () => {
  const iconPath = path.join(rootDir, './assets/icon/tray.png')

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 820,
    minWidth: 1024,
    minHeight: 640,
    center: true,
    icon: iconPath,
    frame: process.platform !== 'win32',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(preloadDir, 'index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.resolve(electronDist, './index.html'))
  }

  mainWindow.on('close', (event) => {
    if (process.platform !== 'win32' || isQuitting) return
    event.preventDefault()
    mainWindow?.hide()
  })

  Menu.setApplicationMenu(null)
}

const hasSingleInstanceLock = app.requestSingleInstanceLock()

if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', showMainWindow)

  app.whenReady().then(async () => {
    logger.info('NovelForge main process starting')
    await dbInit()
    const mcp = createDesktopMcpPlaceholder()
    logger.info(`MCP placeholder ready with ${mcp.tools.length} tools`)

    registerAppIpcHandlers()
    registerWindowControls(() => mainWindow)
    createWindow()
    addTray(rootDir, () => mainWindow)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  isQuitting = true
})
