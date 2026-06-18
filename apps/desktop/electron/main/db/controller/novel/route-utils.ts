import { ipcMain, type IpcMainInvokeEvent } from 'electron'

export type RouteParams = Record<string, unknown>
export type NovelRouteHandler = (params: RouteParams, event: IpcMainInvokeEvent) => unknown | Promise<unknown>

export const asRecord = (value: unknown): RouteParams =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as RouteParams) : {}

export const stringParam = (params: RouteParams, key: string) => String(params[key] ?? '')

export const optionalStringParam = (params: RouteParams, key: string) => {
  const value = params[key]
  return value === undefined || value === null || value === '' ? undefined : String(value)
}

export const objectParam = (params: RouteParams, key: string) => asRecord(params[key])

export const stringArrayParam = (params: RouteParams, key: string) => {
  const value = params[key]
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

export const booleanParam = (params: RouteParams, key: string) => Boolean(params[key])

export const registerNovelRoute = (route: string, handler: NovelRouteHandler) => {
  ipcMain.handle(route, (event, params: unknown) => handler(asRecord(params), event))
}
