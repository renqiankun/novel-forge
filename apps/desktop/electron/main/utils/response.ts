export interface AppResponse<T = unknown> {
  code: number
  msg: string
  data: T | null
}

export const response = {
  ok: <T>(data?: { code?: number; msg?: string; data?: T }): AppResponse<T> => ({
    code: 200,
    msg: '操作成功',
    data: null,
    ...data,
  }),
  error: <T>(data?: { code?: number; msg?: string; data?: T }): AppResponse<T> => ({
    code: 500,
    msg: '操作失败',
    data: null,
    ...data,
  }),
}
