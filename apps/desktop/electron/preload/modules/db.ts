import { ipcRenderer } from 'electron'

export interface QueryDbConfig {
  path: string
  params?: unknown
}

export const dbProxy = {
  queryDB: <T = unknown>(config: QueryDbConfig): Promise<T> => ipcRenderer.invoke(config.path, config.params),
}
