import { isProxy, isReactive, isRef, toRaw } from 'vue'

type PlainValue = null | undefined | string | number | boolean | PlainValue[] | { [key: string]: PlainValue }

const toPlainValue = (value: unknown, seen = new WeakSet<object>()): PlainValue | unknown => {
  if (value === null || value === undefined || typeof value !== 'object') return value
  if (value instanceof Date) return value.toISOString()
  if (isRef(value)) return toPlainValue(value.value, seen)

  const raw = isProxy(value) || isReactive(value) ? toRaw(value) : value
  if (!raw || typeof raw !== 'object') return raw
  if (seen.has(raw)) return undefined
  seen.add(raw)

  if (Array.isArray(raw)) return raw.map((item) => toPlainValue(item, seen)) as PlainValue[]

  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .filter(([, entryValue]) => typeof entryValue !== 'undefined')
      .map(([key, entryValue]) => [key, toPlainValue(entryValue, seen)]),
  ) as PlainValue
}

export const queryDB = async <T = unknown>(path: string, params?: unknown): Promise<T> => {
  if (!window.electronAPI?.queryDB) throw new Error('Electron queryDB bridge is not available')
  return window.electronAPI.queryDB<T>({
    path,
    params: toPlainValue(params),
  })
}
