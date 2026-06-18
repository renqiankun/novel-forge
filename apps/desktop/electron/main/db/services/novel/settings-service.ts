import type { NovelMcpToolCallPayload } from '../../../../shared/ipc'
import { desktopMcpToolDefinitions } from '../../../mcp/tool-definitions'
import { executeDesktopMcpTool } from '../../../mcp/tool-executor'
import {
  getNovelContentStorageSettings,
  setNovelContentRoot,
  syncNovelStateContent,
} from '../../../storage/novel-content-store'
import { listMcpToolNames, syncContentStorage } from '../../../novel/novel-api-service'

export class NovelSettingsService {
  static listMcpTools() {
    return desktopMcpToolDefinitions
  }

  static listMcpToolNames() {
    return listMcpToolNames()
  }

  static callMcpTool(payload: NovelMcpToolCallPayload) {
    return executeDesktopMcpTool(payload)
  }

  static getContentStorageSettings() {
    return getNovelContentStorageSettings()
  }

  static setContentStorageRoot(rootDir?: string | null) {
    return setNovelContentRoot(rootDir)
  }

  static syncContentStorage(state?: unknown) {
    if (state) return syncNovelStateContent(state)
    return syncContentStorage()
  }
}
