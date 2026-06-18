import { queryDB } from '../_queryDB'
import type { McpToolDefinition, NovelContentStorageSettings, NovelContentStorageSyncResult } from '../novelPreview'

export const novelSettingsApi = {
  listMcpTools: () => queryDB<McpToolDefinition[]>('db/novel/settings/mcp/tool-definitions'),

  callMcpTool: (name: string, args: Record<string, unknown> = {}) =>
    queryDB('db/novel/settings/mcp/call', { name, arguments: args }),

  getContentStorageSettings: () => queryDB<NovelContentStorageSettings>('db/novel/settings/content/get'),

  chooseContentStorageDirectory: () => queryDB<NovelContentStorageSettings>('db/novel/settings/content/choose'),

  resetContentStorageDirectory: () => queryDB<NovelContentStorageSettings>('db/novel/settings/content/reset'),

  syncContentStorage: (state?: unknown) => queryDB<NovelContentStorageSyncResult>('db/novel/settings/content/sync', { state }),
}
