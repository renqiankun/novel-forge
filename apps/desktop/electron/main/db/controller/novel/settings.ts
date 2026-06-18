import { BrowserWindow, dialog, type OpenDialogOptions } from 'electron'

import { NovelSettingsService } from '../../services/novel/settings-service'
import { objectParam, registerNovelRoute, stringParam } from './route-utils'

export const registerNovelSettingsRoutes = () => {
  registerNovelRoute('db/novel/settings/mcp/tools', () => NovelSettingsService.listMcpToolNames())

  registerNovelRoute('db/novel/settings/mcp/tool-definitions', () => NovelSettingsService.listMcpTools())

  registerNovelRoute('db/novel/settings/mcp/call', (params) =>
    NovelSettingsService.callMcpTool({
      name: stringParam(params, 'name'),
      arguments: objectParam(params, 'arguments'),
    }),
  )

  registerNovelRoute('db/novel/settings/content/get', () => NovelSettingsService.getContentStorageSettings())

  registerNovelRoute('db/novel/settings/content/reset', () => NovelSettingsService.setContentStorageRoot(null))

  registerNovelRoute('db/novel/settings/content/choose', async (_params, event) => {
    const owner = BrowserWindow.fromWebContents(event.sender) ?? undefined
    const current = await NovelSettingsService.getContentStorageSettings()
    const options: OpenDialogOptions = {
      title: '选择正文文件存储目录',
      defaultPath: current.rootDir,
      properties: ['openDirectory', 'createDirectory'],
    }
    const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options)
    if (result.canceled || !result.filePaths[0]) return current
    return NovelSettingsService.setContentStorageRoot(result.filePaths[0])
  })

  registerNovelRoute('db/novel/settings/content/sync', (params) =>
    NovelSettingsService.syncContentStorage(params.state),
  )
}
