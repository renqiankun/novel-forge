import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type {
  NovelContentStorageSettings,
  NovelContentStorageSyncResult,
} from '../../shared/ipc'
import { dbPath, sqlite } from '../db/dbConnect'
import { getUserDataPath } from '../utils'

type JsonRecord = Record<string, any>

interface ContentBlobRow {
  id: string
  project_id: string
  entity_type: 'chapter' | 'chapter_version'
  entity_id: string
  chapter_id: string | null
  version_id: string | null
  role: 'draft' | 'version'
  status: string | null
  relative_path: string
  content_hash: string
  byte_length: number
  word_count: number
  created_at: number
  updated_at: number
}

const CONTENT_ROOT_KEY = 'content.rootDir'

const asRecord = (value: unknown): JsonRecord => (value && typeof value === 'object' ? (value as JsonRecord) : {})
const getRows = (state: JsonRecord, key: string): JsonRecord[] => (Array.isArray(state[key]) ? state[key] : [])
const nowMs = () => Date.now()

const safeSegment = (value: unknown) =>
  String(value ?? 'unknown')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'unknown'

const wordCount = (content: string) => content.replace(/\s/g, '').length
const contentHash = (content: string) => createHash('sha256').update(content).digest('hex')

const toAbsoluteContentPath = (rootDir: string, relativePath: string) => {
  const absoluteRoot = path.resolve(rootDir)
  const absolutePath = path.resolve(absoluteRoot, ...relativePath.split('/'))
  const prefix = absoluteRoot.endsWith(path.sep) ? absoluteRoot : `${absoluteRoot}${path.sep}`
  if (absolutePath !== absoluteRoot && !absolutePath.startsWith(prefix)) {
    throw new Error(`Content path escaped storage root: ${relativePath}`)
  }
  return absolutePath
}

export const getDefaultNovelContentRoot = () => path.join(getUserDataPath(), 'manuscripts')

export const ensureNovelContentTables = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS novel_app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_content_blobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      chapter_id TEXT,
      version_id TEXT,
      role TEXT NOT NULL,
      status TEXT,
      relative_path TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      byte_length INTEGER NOT NULL,
      word_count INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_novel_content_blobs_project ON novel_content_blobs(project_id);
    CREATE INDEX IF NOT EXISTS idx_novel_content_blobs_chapter ON novel_content_blobs(project_id, chapter_id);
    CREATE INDEX IF NOT EXISTS idx_novel_content_blobs_hash ON novel_content_blobs(content_hash);
  `)
}

const getSetting = (key: string): { value: string; updated_at: number } | undefined => {
  ensureNovelContentTables()
  return sqlite.prepare('SELECT value, updated_at FROM novel_app_settings WHERE key = ?').get(key) as
    | { value: string; updated_at: number }
    | undefined
}

const setSetting = (key: string, value: string) => {
  ensureNovelContentTables()
  sqlite
    .prepare(
      `
      INSERT INTO novel_app_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    )
    .run(key, value, nowMs())
}

const getContentBlobCount = () => {
  ensureNovelContentTables()
  const row = sqlite.prepare('SELECT COUNT(*) AS count FROM novel_content_blobs').get() as { count: number }
  return row.count
}

export const getNovelContentRoot = () => {
  const stored = getSetting(CONTENT_ROOT_KEY)
  return path.resolve(stored?.value || getDefaultNovelContentRoot())
}

export const getNovelContentStorageSettings = async (): Promise<NovelContentStorageSettings> => {
  const defaultRootDir = getDefaultNovelContentRoot()
  const stored = getSetting(CONTENT_ROOT_KEY)
  const rootDir = path.resolve(stored?.value || defaultRootDir)
  return {
    source: 'electron',
    rootDir,
    defaultRootDir,
    isCustom: path.resolve(rootDir) !== path.resolve(defaultRootDir),
    exists: existsSync(rootDir),
    dbPath,
    contentBlobs: getContentBlobCount(),
    updatedAt: stored?.updated_at ? new Date(stored.updated_at).toISOString() : undefined,
  }
}

export const setNovelContentRoot = async (rootDir?: string | null): Promise<NovelContentStorageSettings> => {
  const nextRoot = path.resolve(rootDir?.trim() || getDefaultNovelContentRoot())
  await mkdir(nextRoot, { recursive: true })
  setSetting(CONTENT_ROOT_KEY, nextRoot)
  return getNovelContentStorageSettings()
}

const upsertContentBlob = (payload: {
  id: string
  projectId: string
  entityType: 'chapter' | 'chapter_version'
  entityId: string
  chapterId?: string
  versionId?: string
  role: 'draft' | 'version'
  status?: string
  relativePath: string
  content: string
}) => {
  const createdAt = nowMs()
  sqlite
    .prepare(
      `
      INSERT INTO novel_content_blobs (
        id,
        project_id,
        entity_type,
        entity_id,
        chapter_id,
        version_id,
        role,
        status,
        relative_path,
        content_hash,
        byte_length,
        word_count,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        entity_type = excluded.entity_type,
        entity_id = excluded.entity_id,
        chapter_id = excluded.chapter_id,
        version_id = excluded.version_id,
        role = excluded.role,
        status = excluded.status,
        relative_path = excluded.relative_path,
        content_hash = excluded.content_hash,
        byte_length = excluded.byte_length,
        word_count = excluded.word_count,
        updated_at = excluded.updated_at
    `,
    )
    .run(
      payload.id,
      payload.projectId,
      payload.entityType,
      payload.entityId,
      payload.chapterId ?? null,
      payload.versionId ?? null,
      payload.role,
      payload.status ?? null,
      payload.relativePath,
      contentHash(payload.content),
      Buffer.byteLength(payload.content, 'utf8'),
      wordCount(payload.content),
      createdAt,
      createdAt,
    )
}

const writeAtomicText = async (filePath: string, content: string) => {
  await mkdir(path.dirname(filePath), { recursive: true })
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempPath, content, 'utf8')
  await rename(tempPath, filePath)
}

export const writeNovelEntityContent = async (payload: {
  id: string
  projectId: string
  entityType: 'chapter' | 'chapter_version'
  entityId: string
  chapterId?: string
  versionId?: string
  role: 'draft' | 'version'
  status?: string
  relativePath: string
  content: string
}) => {
  ensureNovelContentTables()
  const rootDir = getNovelContentRoot()
  const filePath = toAbsoluteContentPath(rootDir, payload.relativePath)
  await writeAtomicText(filePath, payload.content)
  upsertContentBlob(payload)
}

const listContentBlobs = () => {
  ensureNovelContentTables()
  return sqlite.prepare('SELECT * FROM novel_content_blobs').all() as ContentBlobRow[]
}

const readContentBlobText = async (rootDir: string, row: ContentBlobRow) =>
  readFile(toAbsoluteContentPath(rootDir, row.relative_path), 'utf8')

export const readNovelEntityContent = async (blobId?: string | null) => {
  if (!blobId) return ''
  ensureNovelContentTables()
  const row = sqlite.prepare('SELECT * FROM novel_content_blobs WHERE id = ?').get(blobId) as ContentBlobRow | undefined
  if (!row) return ''
  return readContentBlobText(getNovelContentRoot(), row)
}

export const syncNovelStateContent = async (state: unknown): Promise<NovelContentStorageSyncResult> => {
  const rootDir = getNovelContentRoot()
  await mkdir(rootDir, { recursive: true })

  const projectState = asRecord(state)
  let written = 0
  let skipped = 0

  for (const chapter of getRows(projectState, 'chapters')) {
    if (typeof chapter.projectId !== 'string' || typeof chapter.id !== 'string' || typeof chapter.draft !== 'string') {
      skipped += 1
      continue
    }
    if (!chapter.draft.trim()) continue

    const relativePath = [
      'projects',
      safeSegment(chapter.projectId),
      'chapters',
      safeSegment(chapter.id),
      'draft.md',
    ].join('/')
    await writeNovelEntityContent({
      id: `chapter:${chapter.projectId}:${chapter.id}:draft`,
      projectId: chapter.projectId,
      entityType: 'chapter',
      entityId: chapter.id,
      chapterId: chapter.id,
      role: 'draft',
      status: typeof chapter.status === 'string' ? chapter.status : undefined,
      relativePath,
      content: chapter.draft,
    })
    written += 1
  }

  for (const version of getRows(projectState, 'chapterVersions')) {
    if (
      typeof version.projectId !== 'string' ||
      typeof version.chapterId !== 'string' ||
      typeof version.id !== 'string' ||
      typeof version.body !== 'string'
    ) {
      skipped += 1
      continue
    }
    if (!version.body.trim()) continue

    const relativePath = [
      'projects',
      safeSegment(version.projectId),
      'chapters',
      safeSegment(version.chapterId),
      'versions',
      `${safeSegment(version.id)}.md`,
    ].join('/')
    await writeNovelEntityContent({
      id: `chapter-version:${version.projectId}:${version.id}`,
      projectId: version.projectId,
      entityType: 'chapter_version',
      entityId: version.id,
      chapterId: version.chapterId,
      versionId: version.id,
      role: 'version',
      status: typeof version.status === 'string' ? version.status : undefined,
      relativePath,
      content: version.body,
    })
    written += 1
  }

  return {
    ok: true,
    rootDir,
    dbPath,
    written,
    skipped,
    contentBlobs: getContentBlobCount(),
  }
}

export const hydrateNovelStateContent = async (state: unknown): Promise<{ hydrated: number; missing: number }> => {
  const projectState = asRecord(state)
  const rootDir = getNovelContentRoot()
  const rows = listContentBlobs()
  const byId = new Map(rows.map((row) => [row.id, row]))
  let hydrated = 0
  let missing = 0

  for (const chapter of getRows(projectState, 'chapters')) {
    if (typeof chapter.projectId !== 'string' || typeof chapter.id !== 'string') continue
    const row = byId.get(`chapter:${chapter.projectId}:${chapter.id}:draft`)
    if (!row) continue
    try {
      chapter.draft = await readContentBlobText(rootDir, row)
      hydrated += 1
    } catch {
      missing += 1
    }
  }

  for (const version of getRows(projectState, 'chapterVersions')) {
    if (typeof version.projectId !== 'string' || typeof version.id !== 'string') continue
    const row = byId.get(`chapter-version:${version.projectId}:${version.id}`)
    if (!row) continue
    try {
      version.body = await readContentBlobText(rootDir, row)
      hydrated += 1
    } catch {
      missing += 1
    }
  }

  return { hydrated, missing }
}
