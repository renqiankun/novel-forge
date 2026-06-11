import { ipcMain } from 'electron'
import updater from 'electron-updater'

import { UPDATE_CHANNEL, UPDATE_CODE } from '../utils/constants'

const { autoUpdater } = updater

let updateWebContents: Electron.WebContents | null = null

autoUpdater.forceDevUpdateConfig = false
autoUpdater.autoDownload = false

const sendStatus = (code: UPDATE_CODE, data?: unknown) => {
  updateWebContents?.send?.(UPDATE_CHANNEL.MSG, { code, data })
}

autoUpdater.on('error', (err) => sendStatus(UPDATE_CODE.error, err.message))
autoUpdater.on('checking-for-update', () => sendStatus(UPDATE_CODE.checking))
autoUpdater.on('update-available', () => sendStatus(UPDATE_CODE.updateAvailable))
autoUpdater.on('update-not-available', () => sendStatus(UPDATE_CODE.updateNotAvailable))
autoUpdater.on('download-progress', (progress) => sendStatus(UPDATE_CODE.downloadProgress, progress))
autoUpdater.on('update-downloaded', () => sendStatus(UPDATE_CODE.updateDownloaded))

ipcMain.on(UPDATE_CHANNEL.MSG, (event) => {
  updateWebContents = event.sender
})

ipcMain.handle(UPDATE_CHANNEL.SET_URL, (_event, url: string) => autoUpdater.setFeedURL(url))
ipcMain.on(UPDATE_CHANNEL.CHECK_UPDATE, () => autoUpdater.checkForUpdates())
ipcMain.on(UPDATE_CHANNEL.DOWNLOAD_UPDATE, () => autoUpdater.downloadUpdate())
ipcMain.on(UPDATE_CHANNEL.EXIT_AND_INSTALL, () => autoUpdater.quitAndInstall())
