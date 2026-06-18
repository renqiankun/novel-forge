import { randomUUID } from 'node:crypto'

import { sqlite } from '../db/dbConnect'
import { desktopMcpToolDefinitions } from '../mcp/tool-definitions'
import {
  readNovelEntityContent,
  syncNovelStateContent,
  writeNovelEntityContent,
} from '../storage/novel-content-store'

type JsonRecord = Record<string, any>

const nowMs = () => Date.now()
const nowIso = () => new Date().toISOString()
const uid = (prefix: string) => `${prefix}-${randomUUID()}`
const wordCount = (text: string) => text.replace(/\s/g, '').length
const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
const toMs = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return nowMs()
}
const iso = (value: unknown) => new Date(toMs(value)).toISOString()

const ensureNovelApiTables = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS novel_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'planning',
      style_profile_id TEXT,
      target_chapters INTEGER NOT NULL DEFAULT 300,
      current_chapter INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_chapters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      chapter_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      intention TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      draft_blob_id TEXT,
      word_count INTEGER NOT NULL DEFAULT 0,
      scene_cards_json TEXT NOT NULL DEFAULT '[]',
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_chapter_versions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      body_blob_id TEXT,
      summary TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_ai_tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target TEXT NOT NULL,
      status TEXT NOT NULL,
      queue_order INTEGER NOT NULL,
      context_mode TEXT NOT NULL,
      review_mode TEXT NOT NULL,
      fact_strategy TEXT NOT NULL,
      checkpoint_every INTEGER NOT NULL,
      auto_pause TEXT NOT NULL,
      chapter_id TEXT,
      rewrite_task_id TEXT,
      instruction TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_write_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      task_id TEXT,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      actor TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_style_asset_templates (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]',
      source TEXT NOT NULL DEFAULT 'user',
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS novel_project_records (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      record_kind TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_novel_chapters_project ON novel_chapters(project_id, chapter_index);
    CREATE INDEX IF NOT EXISTS idx_novel_versions_chapter ON novel_chapter_versions(project_id, chapter_id);
    CREATE INDEX IF NOT EXISTS idx_novel_tasks_project ON novel_ai_tasks(project_id, queue_order);
    CREATE INDEX IF NOT EXISTS idx_novel_records_project ON novel_project_records(project_id, record_kind);
  `)
}

const projectFromRow = (row: JsonRecord) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  genre: row.genre ?? '',
  status: row.status ?? 'planning',
  styleProfileId: row.style_profile_id ?? undefined,
  targetChapters: Number(row.target_chapters ?? 300),
  currentChapter: Number(row.current_chapter ?? 1),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
})

const chapterFromRow = async (row: JsonRecord) => ({
  id: row.id,
  projectId: row.project_id,
  index: Number(row.chapter_index ?? 1),
  title: row.title,
  status: row.status ?? 'queued',
  intention: row.intention ?? '',
  summary: row.summary ?? '',
  draft: await readNovelEntityContent(row.draft_blob_id),
  wordCount: Number(row.word_count ?? 0),
  sceneCards: parseJson(row.scene_cards_json, []),
  updatedAt: iso(row.updated_at),
})

const versionFromRow = async (row: JsonRecord) => ({
  id: row.id,
  projectId: row.project_id,
  chapterId: row.chapter_id,
  title: row.title,
  kind: row.kind ?? 'external',
  status: row.status ?? 'candidate',
  body: await readNovelEntityContent(row.body_blob_id),
  summary: row.summary ?? '',
  wordCount: Number(row.word_count ?? 0),
  source: row.source ?? '',
  createdAt: iso(row.created_at),
})

const taskFromRow = (row: JsonRecord) => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  target: row.target,
  status: row.status,
  queueOrder: Number(row.queue_order ?? 0),
  contextMode: row.context_mode ?? 'full',
  reviewMode: row.review_mode ?? 'balanced',
  factStrategy: row.fact_strategy ?? 'balanced',
  checkpointEvery: Number(row.checkpoint_every ?? 1),
  autoPause: row.auto_pause ?? 'high_risk',
  chapterId: row.chapter_id ?? undefined,
  rewriteTaskId: row.rewrite_task_id ?? undefined,
  instruction: row.instruction ?? '',
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
})

const writeLogFromRow = (row: JsonRecord) => ({
  id: row.id,
  projectId: row.project_id,
  taskId: row.task_id ?? undefined,
  kind: row.kind,
  title: row.title,
  summary: row.summary ?? '',
  actor: row.actor ?? 'system',
  createdAt: iso(row.created_at),
})

const getProjectOrThrow = (projectId: string) => {
  ensureNovelApiTables()
  const row = sqlite.prepare('SELECT * FROM novel_projects WHERE id = ?').get(projectId) as JsonRecord | undefined
  if (!row) throw new Error(`Project not found: ${projectId}`)
  return projectFromRow(row)
}

const touchProject = (projectId: string) =>
  sqlite.prepare('UPDATE novel_projects SET updated_at = ? WHERE id = ?').run(nowMs(), projectId)

const addWriteLog = (projectId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  const createdAt = nowMs()
  const id = uid('log')
  sqlite
    .prepare(
      'INSERT INTO novel_write_logs (id, project_id, task_id, kind, title, summary, actor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(id, projectId, payload.taskId ?? null, payload.kind ?? 'state_patch', payload.title ?? 'Write log', payload.summary ?? '', payload.actor ?? 'system', createdAt)
  return writeLogFromRow(sqlite.prepare('SELECT * FROM novel_write_logs WHERE id = ?').get(id) as JsonRecord)
}

const recordFromRow = (row: JsonRecord) => {
  const payload = parseJson<JsonRecord>(row.payload_json, {})
  return {
    id: row.id,
    projectId: row.project_id,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    ...payload,
  }
}

const listProjectRecords = (projectId: string, recordKind: string): JsonRecord[] => {
  ensureNovelApiTables()
  return (sqlite
    .prepare('SELECT * FROM novel_project_records WHERE project_id = ? AND record_kind = ? ORDER BY updated_at DESC')
    .all(projectId, recordKind) as JsonRecord[]).map(recordFromRow)
}

const getProjectRecord = (projectId: string, recordKind: string, recordId: string) =>
  listProjectRecords(projectId, recordKind).find((item) => item.id === recordId)

const saveProjectRecord = (projectId: string, recordKind: string, payload: JsonRecord, prefix = 'record') => {
  ensureNovelApiTables()
  getProjectOrThrow(projectId)
  const id = payload.id ?? uid(prefix)
  const createdAt = payload.createdAt ? toMs(payload.createdAt) : nowMs()
  const updatedAt = nowMs()
  const body = { ...payload }
  delete body.id
  delete body.projectId
  delete body.createdAt
  delete body.updatedAt
  sqlite
    .prepare(
      `
      INSERT INTO novel_project_records (id, project_id, record_kind, payload_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        record_kind = excluded.record_kind,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `,
    )
    .run(id, projectId, recordKind, JSON.stringify(body), createdAt, updatedAt)
  touchProject(projectId)
  return getProjectRecord(projectId, recordKind, id)
}

const deleteProjectRecord = (projectId: string, recordKind: string, recordId: string) => {
  ensureNovelApiTables()
  sqlite.prepare('DELETE FROM novel_project_records WHERE project_id = ? AND record_kind = ? AND id = ?').run(projectId, recordKind, recordId)
  touchProject(projectId)
  return true
}

const listWriteLogs = (projectId: string) => {
  ensureNovelApiTables()
  return (sqlite.prepare('SELECT * FROM novel_write_logs WHERE project_id = ? ORDER BY created_at DESC').all(projectId) as JsonRecord[]).map(writeLogFromRow)
}

export const listProjects = () => {
  ensureNovelApiTables()
  return (sqlite.prepare('SELECT * FROM novel_projects ORDER BY updated_at DESC').all() as JsonRecord[]).map(projectFromRow)
}

export const listChapters = async (projectId: string) => {
  ensureNovelApiTables()
  return Promise.all(
    (sqlite.prepare('SELECT * FROM novel_chapters WHERE project_id = ? ORDER BY chapter_index ASC').all(projectId) as JsonRecord[]).map(chapterFromRow),
  )
}

export const listChapterVersions = async (projectId: string, chapterId: string) => {
  ensureNovelApiTables()
  return Promise.all(
    (sqlite
      .prepare('SELECT * FROM novel_chapter_versions WHERE project_id = ? AND chapter_id = ? ORDER BY created_at DESC')
      .all(projectId, chapterId) as JsonRecord[]).map(versionFromRow),
  )
}

const createChapterRow = (projectId: string, index?: number) => {
  ensureNovelApiTables()
  getProjectOrThrow(projectId)
  const nextIndex =
    index ??
    ((sqlite.prepare('SELECT MAX(chapter_index) AS maxIndex FROM novel_chapters WHERE project_id = ?').get(projectId) as { maxIndex?: number }).maxIndex ?? 0) + 1
  const id = uid('chapter')
  const updatedAt = nowMs()
  sqlite
    .prepare(
      'INSERT INTO novel_chapters (id, project_id, chapter_index, title, status, intention, summary, draft_blob_id, word_count, scene_cards_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(id, projectId, nextIndex, `Chapter ${nextIndex}`, 'queued', 'Waiting for AI writing intent.', 'No draft yet.', null, 0, '[]', updatedAt)
  sqlite.prepare('UPDATE novel_projects SET current_chapter = ?, updated_at = ? WHERE id = ?').run(nextIndex, updatedAt, projectId)
  return id
}

export const createChapter = async (projectId: string) => {
  const chapterId = createChapterRow(projectId)
  return (await listChapters(projectId)).find((chapter) => chapter.id === chapterId)
}

export const createProject = async (payload: JsonRecord) => {
  ensureNovelApiTables()
  const id = uid('project')
  const createdAt = nowMs()
  sqlite
    .prepare(
      'INSERT INTO novel_projects (id, title, description, genre, status, target_chapters, current_chapter, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      id,
      String(payload.title ?? '').trim() || 'Untitled Novel',
      String(payload.description ?? '').trim() || 'Local novel project for external AI through MCP.',
      String(payload.genre ?? '').trim() || 'unspecified',
      'planning',
      Number(payload.targetChapters || 300),
      1,
      createdAt,
      createdAt,
    )
  createChapterRow(id, 1)
  return getProjectOrThrow(id)
}

export const updateProject = async (projectId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  getProjectOrThrow(projectId)
  const fields: string[] = []
  const values: unknown[] = []
  const assign = (column: string, value: unknown) => {
    if (value === undefined) return
    fields.push(`${column} = ?`)
    values.push(value)
  }

  assign('title', typeof payload.title === 'string' ? payload.title.trim() || 'Untitled Novel' : undefined)
  assign('description', typeof payload.description === 'string' ? payload.description.trim() : undefined)
  assign('genre', typeof payload.genre === 'string' ? payload.genre.trim() : undefined)
  assign('status', typeof payload.status === 'string' ? payload.status.trim() : undefined)
  assign('target_chapters', payload.targetChapters === undefined ? undefined : Number(payload.targetChapters))
  assign('current_chapter', payload.currentChapter === undefined ? undefined : Number(payload.currentChapter))

  if (!fields.length) return getProjectOrThrow(projectId)
  fields.push('updated_at = ?')
  values.push(nowMs(), projectId)
  sqlite.prepare(`UPDATE novel_projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  addWriteLog(projectId, {
    kind: 'project_state',
    title: 'Project settings updated',
    summary: [payload.title, payload.description].filter(Boolean).join(' / '),
    actor: 'codex',
  })
  return getProjectOrThrow(projectId)
}

export const saveChapterVersion = async (projectId: string, chapterId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  const chapter = (await listChapters(projectId)).find((item) => item.id === chapterId)
  if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
  const body = String(payload.body ?? '').trim()
  const id = uid('version')
  const blobId = `chapter-version:${projectId}:${id}`
  await writeNovelEntityContent({
    id: blobId,
    projectId,
    entityType: 'chapter_version',
    entityId: id,
    chapterId,
    versionId: id,
    role: 'version',
    status: 'candidate',
    relativePath: `projects/${projectId}/chapters/${chapterId}/versions/${id}.md`,
    content: body,
  })
  const createdAt = nowMs()
  sqlite
    .prepare(
      'INSERT INTO novel_chapter_versions (id, project_id, chapter_id, title, kind, status, body_blob_id, summary, word_count, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      id,
      projectId,
      chapterId,
      String(payload.title ?? '').trim() || `AI candidate ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
      payload.kind ?? 'external',
      'candidate',
      blobId,
      String(payload.summary ?? '').trim() || chapter.summary || 'External AI candidate version.',
      wordCount(body),
      String(payload.source ?? '').trim() || 'External AI',
      createdAt,
    )
  sqlite.prepare('UPDATE novel_chapters SET status = ?, updated_at = ? WHERE id = ?').run('draft_complete_signal_received', nowMs(), chapterId)
  touchProject(projectId)
  addWriteLog(projectId, { kind: 'chapter_version', title: 'Candidate version saved', summary: chapter.title, actor: 'codex' })
  return versionFromRow(sqlite.prepare('SELECT * FROM novel_chapter_versions WHERE id = ?').get(id) as JsonRecord)
}

export const generateDraftCandidate = (projectId: string, chapterId: string) =>
  saveChapterVersion(projectId, chapterId, {
    title: 'AI candidate draft',
    body: 'External AI should replace this candidate body through MCP writeback.',
    summary: 'Generated candidate placeholder.',
    source: 'local placeholder',
    kind: 'generated',
  })

export const saveDraft = async (projectId: string, chapterId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  const draft = String(payload.draft ?? '')
  const blobId = `chapter:${projectId}:${chapterId}:draft`
  await writeNovelEntityContent({
    id: blobId,
    projectId,
    entityType: 'chapter',
    entityId: chapterId,
    chapterId,
    role: 'draft',
    status: payload.status ?? 'draft_saved',
    relativePath: `projects/${projectId}/chapters/${chapterId}/draft.md`,
    content: draft,
  })
  sqlite
    .prepare('UPDATE novel_chapters SET title = COALESCE(?, title), summary = COALESCE(?, summary), draft_blob_id = ?, word_count = ?, status = ?, updated_at = ? WHERE id = ? AND project_id = ?')
    .run(payload.title ?? null, payload.summary ?? null, blobId, wordCount(draft), payload.status ?? 'draft_saved', nowMs(), chapterId, projectId)
  touchProject(projectId)
  addWriteLog(projectId, { kind: 'chapter_draft', title: 'Draft saved', summary: payload.title ?? chapterId, actor: 'human' })
  return (await listChapters(projectId)).find((chapter) => chapter.id === chapterId)
}

export const applyChapterVersion = async (projectId: string, chapterId: string, versionId: string) => {
  const version = (await listChapterVersions(projectId, chapterId)).find((item) => item.id === versionId)
  if (!version) throw new Error(`Version not found: ${versionId}`)
  await saveDraft(projectId, chapterId, {
    title: version.title,
    summary: version.summary,
    draft: version.body,
    status: 'committed',
  })
  sqlite.prepare('UPDATE novel_chapter_versions SET status = CASE WHEN id = ? THEN ? ELSE ? END WHERE project_id = ? AND chapter_id = ?').run(versionId, 'applied', 'archived', projectId, chapterId)
  addWriteLog(projectId, { kind: 'chapter_final', title: 'Version applied', summary: version.title, actor: 'human' })
  return true
}

const listTasks = (projectId: string) => {
  ensureNovelApiTables()
  return (sqlite.prepare('SELECT * FROM novel_ai_tasks WHERE project_id = ? ORDER BY queue_order ASC, created_at ASC').all(projectId) as JsonRecord[]).map(taskFromRow)
}

export const taskQueueForProject = (projectId: string) => {
  const tasks = listTasks(projectId)
  const logs = listWriteLogs(projectId)
  const items = tasks.map((task, index) => ({
    task,
    order: task.queueOrder ?? (index + 1) * 10,
    executable: !['completed', 'blocked', 'cancelled'].includes(task.status),
    blockedReason: task.status === 'paused' ? 'Task is paused.' : undefined,
    latestWrite: logs.find((log) => log.taskId === task.id),
    packageUri: `novelforge://projects/${projectId}/tasks/${task.id}`,
  }))
  return {
    projectId,
    generatedAt: nowIso(),
    nextTask: items.find((item) => item.executable),
    items,
    policy: [
      'Queue order controls external AI pickup priority.',
      'External AI reads a task package before writing back.',
      'Completing a task does not automatically finalize chapter text.',
    ],
  }
}

const resourcePreviews = (projectId: string) => [
  { id: 'project', projectId, uri: `novelforge://projects/${projectId}`, kind: 'project', title: '项目基础状态', description: '项目名、题材、简介、当前章、目标章数和写作阶段。', items: 1, contextMode: 'lite', updatedAt: nowIso() },
  { id: 'chapters', projectId, uri: `novelforge://projects/${projectId}/chapters`, kind: 'chapter', title: '章节正文与版本', description: '章节正文文件、候选版本、定稿状态、重写条件和本地检查记录。', items: Number((sqlite.prepare('SELECT COUNT(*) AS count FROM novel_chapters WHERE project_id = ?').get(projectId) as { count?: number }).count ?? 0), contextMode: 'full', updatedAt: nowIso() },
  { id: 'outline', projectId, uri: `novelforge://projects/${projectId}/outline`, kind: 'outline', title: '大纲与故事线', description: '全书承诺、卷目标、章节功能、剧情线、伏笔、代价和主线影响。', items: listProjectRecords(projectId, 'outlineNode').length, contextMode: 'full', updatedAt: nowIso() },
  { id: 'style', projectId, uri: `novelforge://projects/${projectId}/style`, kind: 'style', title: '风格与对白资产', description: '当前风格方案、已应用风格资产、好段落样本、坏模式和禁止项。', items: listProjectRecords(projectId, 'styleAsset').length, contextMode: 'full', updatedAt: nowIso() },
  { id: 'world', projectId, uri: `novelforge://projects/${projectId}/world-facts`, kind: 'world', title: '世界事实库', description: '设定规则、地点、势力、术语、能力和物件等权威事实。', items: listWorldFacts(projectId).length, contextMode: 'full', updatedAt: nowIso() },
  { id: 'character', projectId, uri: `novelforge://projects/${projectId}/characters`, kind: 'character', title: '角色关系与状态', description: '角色目标、知识边界、关系账本、压力值和未来进展。', items: listProjectRecords(projectId, 'character').length, contextMode: 'full', updatedAt: nowIso() },
  { id: 'ledger', projectId, uri: `novelforge://projects/${projectId}/long-state`, kind: 'ledger', title: '长篇状态账本', description: '压力、破声点、伏笔、代价、剧情债务、时间线和消息延迟。', items: Object.values(longStateForProject(projectId)).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0), contextMode: 'deep', updatedAt: nowIso() },
  { id: 'writeback', projectId, uri: `novelforge://projects/${projectId}/writeback`, kind: 'version', title: '外部 AI 回填记录', description: 'Codex 回填的章节版本、风格资产、候选事实、审稿报告和快照记录。', items: listWriteLogs(projectId).length, contextMode: 'deep', updatedAt: nowIso() },
]

export const getAiWorkbenchStats = (projectId: string) => {
  const tasks = listTasks(projectId)
  return {
    queuedTasks: tasks.filter((task) => task.status !== 'completed').length,
    contextResources: resourcePreviews(projectId).length,
    pendingReviews: pendingReviewsForProject(projectId).length,
    recentWrites: listWriteLogs(projectId).length,
  }
}

export const getAiWorkbenchTasks = (projectId: string) => listTasks(projectId)
export const getAiWorkbenchRuns = (projectId: string) => listProjectRecords(projectId, 'aiRun')
export const getAiWorkbenchWriteLogs = (projectId: string) => listWriteLogs(projectId)
export const getAiWorkbenchResourcePreviews = (projectId: string) => resourcePreviews(projectId)

export const getAiWorkbench = (projectId: string) => ({
  project: getProjectOrThrow(projectId),
  stats: getAiWorkbenchStats(projectId),
  tasks: getAiWorkbenchTasks(projectId),
  taskQueue: taskQueueForProject(projectId),
  runs: getAiWorkbenchRuns(projectId),
  writeLogs: getAiWorkbenchWriteLogs(projectId),
  resourcePreviews: getAiWorkbenchResourcePreviews(projectId),
  pendingReviews: pendingReviewsForProject(projectId),
})

export const createAiTask = (projectId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  getProjectOrThrow(projectId)
  const queueOrder =
    ((sqlite.prepare('SELECT MAX(queue_order) AS maxOrder FROM novel_ai_tasks WHERE project_id = ?').get(projectId) as { maxOrder?: number }).maxOrder ?? 0) + 10
  const id = uid('task')
  const createdAt = nowMs()
  sqlite
    .prepare(
      'INSERT INTO novel_ai_tasks (id, project_id, title, target, status, queue_order, context_mode, review_mode, fact_strategy, checkpoint_every, auto_pause, chapter_id, rewrite_task_id, instruction, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      id,
      projectId,
      payload.title ?? 'AI task',
      payload.target ?? 'next_chapter',
      payload.status ?? 'queued',
      queueOrder,
      payload.contextMode ?? 'full',
      payload.reviewMode ?? 'balanced',
      payload.factStrategy ?? 'balanced',
      Number(payload.checkpointEvery ?? 1),
      payload.autoPause ?? 'high_risk',
      payload.chapterId ?? null,
      payload.rewriteTaskId ?? null,
      payload.instruction ?? '',
      createdAt,
      createdAt,
    )
  addWriteLog(projectId, { taskId: id, kind: 'task', title: 'AI task created', summary: payload.title ?? '', actor: 'human' })
  return taskFromRow(sqlite.prepare('SELECT * FROM novel_ai_tasks WHERE id = ?').get(id) as JsonRecord)
}

export const getAiTaskPackage = async (projectId: string, taskId: string) => {
  const task = listTasks(projectId).find((item) => item.id === taskId)
  if (!task) throw new Error(`Task not found: ${taskId}`)
  const queue = taskQueueForProject(projectId)
  const chapterId = task.chapterId || (await listChapters(projectId))[0]?.id
  return {
    id: `package:${taskId}`,
    projectId,
    task,
    taskUri: `novelforge://projects/${projectId}/tasks/${taskId}`,
    queuePosition: queue.items.findIndex((item) => item.task.id === taskId) + 1,
    queuePolicy: queue.policy,
    generatedAt: nowIso(),
    contextPack: chapterId ? await getChapterContextPack(projectId, chapterId, task.contextMode) : undefined,
    rewriteTask: task.rewriteTaskId ? getProjectRecord(projectId, 'rewriteTask', task.rewriteTaskId) : undefined,
    styleLibrary: styleLibraryForProject(projectId),
    expectedReadResources: resourcePreviews(projectId),
    expectedWriteBack: [
      { kind: 'chapter_version', title: 'Candidate chapter version', description: 'Write candidate text, then wait for confirmation.', required: true },
      { kind: 'ledger', title: 'Long state update', description: 'Write pressure, breakpoint, plot debt, or timeline changes when affected.', required: false },
    ],
    mcpHints: ['Read the task package and Context Pack before writing back candidate output.'],
    notes: ['The desktop app does not call model APIs directly; external AI writes through MCP.'],
  }
}

export const completeAiTask = async (projectId: string, taskId: string, payload: JsonRecord = {}) => {
  ensureNovelApiTables()
  sqlite.prepare('UPDATE novel_ai_tasks SET status = ?, updated_at = ? WHERE project_id = ? AND id = ?').run('completed', nowMs(), projectId, taskId)
  addWriteLog(projectId, { taskId, kind: payload.kind ?? 'task', title: 'AI task completed', summary: payload.summary ?? '', actor: 'codex' })
  return listTasks(projectId).find((task) => task.id === taskId)
}

export const reorderAiTaskQueue = (projectId: string, orderedTaskIds: string[]) => {
  ensureNovelApiTables()
  orderedTaskIds.forEach((id, index) => {
    sqlite.prepare('UPDATE novel_ai_tasks SET queue_order = ?, updated_at = ? WHERE project_id = ? AND id = ?').run((index + 1) * 10, nowMs(), projectId, id)
  })
  return taskQueueForProject(projectId)
}

export const deleteAiTask = (projectId: string, taskId: string) => {
  ensureNovelApiTables()
  sqlite.prepare('DELETE FROM novel_ai_tasks WHERE project_id = ? AND id = ? AND status IN (?, ?)').run(projectId, taskId, 'queued', 'paused')
  return true
}

export const listWorldFacts = (projectId: string) => listProjectRecords(projectId, 'worldFact')
export const saveWorldFact = (projectId: string, payload: JsonRecord) => saveProjectRecord(projectId, 'worldFact', { locked: false, source: 'user', ...payload }, 'fact')
export const deleteWorldFact = (projectId: string, factId: string) => deleteProjectRecord(projectId, 'worldFact', factId)

export const listCharacters = (projectId: string) => listProjectRecords(projectId, 'character')
export const saveCharacter = (projectId: string, payload: JsonRecord) => saveProjectRecord(projectId, 'character', payload, 'character')
export const deleteCharacter = (projectId: string, characterId: string) => deleteProjectRecord(projectId, 'character', characterId)
export const listCharacterRelations = (projectId: string) => listProjectRecords(projectId, 'characterRelation')
export const saveCharacterRelation = (projectId: string, payload: JsonRecord) => saveProjectRecord(projectId, 'characterRelation', payload, 'relation')
export const deleteCharacterRelation = (projectId: string, relationId: string) => deleteProjectRecord(projectId, 'characterRelation', relationId)

const longStateKinds: Record<string, { recordKind: string; key: string; prefix: string }> = {
  thread: { recordKind: 'storyThread', key: 'threads', prefix: 'thread' },
  foreshadow: { recordKind: 'foreshadow', key: 'foreshadows', prefix: 'hook' },
  cost: { recordKind: 'cost', key: 'costs', prefix: 'cost' },
  debt: { recordKind: 'plotDebt', key: 'debts', prefix: 'debt' },
  timeline: { recordKind: 'timelineEvent', key: 'timeline', prefix: 'time' },
  message: { recordKind: 'message', key: 'messages', prefix: 'message' },
  pressure: { recordKind: 'pressure', key: 'pressures', prefix: 'pressure' },
  dialogue: { recordKind: 'dialogueProfile', key: 'dialogueProfiles', prefix: 'voice' },
}

export const longStateForProject = (projectId: string) => ({
  threads: listProjectRecords(projectId, 'storyThread'),
  foreshadows: listProjectRecords(projectId, 'foreshadow'),
  costs: listProjectRecords(projectId, 'cost'),
  debts: listProjectRecords(projectId, 'plotDebt'),
  timeline: listProjectRecords(projectId, 'timelineEvent'),
  messages: listProjectRecords(projectId, 'message'),
  pressures: listProjectRecords(projectId, 'pressure'),
  dialogueProfiles: listProjectRecords(projectId, 'dialogueProfile'),
})

export const saveLongStateRecord = (projectId: string, kind: string, payload: JsonRecord) => {
  const target = longStateKinds[kind]
  if (!target) throw new Error(`Unsupported long-state kind: ${kind}`)
  return saveProjectRecord(projectId, target.recordKind, payload, target.prefix)
}

export const deleteLongStateRecord = (projectId: string, kind: string, recordId: string) => {
  const target = longStateKinds[kind]
  if (!target) throw new Error(`Unsupported long-state kind: ${kind}`)
  return deleteProjectRecord(projectId, target.recordKind, recordId)
}

export const characterRelationGraphForProject = (projectId: string) => ({
  projectId,
  characters: listCharacters(projectId),
  relations: listCharacterRelations(projectId),
  pressures: longStateForProject(projectId).pressures,
  dialogueProfiles: longStateForProject(projectId).dialogueProfiles,
  generatedAt: nowIso(),
})

export const styleLibraryForProject = (projectId: string) => {
  const project = getProjectOrThrow(projectId)
  const profiles = listProjectRecords(projectId, 'styleProfile') as JsonRecord[]
  return {
    profiles: profiles.map((profile) => ({ ...profile, active: profile.id === project.styleProfileId })) as JsonRecord[],
    assets: listProjectRecords(projectId, 'styleAsset'),
    activeProfileId: project.styleProfileId,
  }
}

export const saveStyleProfile = (projectId: string, payload: JsonRecord) => saveProjectRecord(projectId, 'styleProfile', { source: 'custom', ...payload }, 'style')
export const bindProjectStyle = (projectId: string, profileId: string) => {
  ensureNovelApiTables()
  sqlite.prepare('UPDATE novel_projects SET style_profile_id = ?, updated_at = ? WHERE id = ?').run(profileId, nowMs(), projectId)
  return styleLibraryForProject(projectId)
}
export const deleteStyleProfile = (projectId: string, profileId: string) => deleteProjectRecord(projectId, 'styleProfile', profileId)
export const saveStyleAsset = (projectId: string, payload: JsonRecord) => saveProjectRecord(projectId, 'styleAsset', { enabled: true, source: 'user', ...payload }, 'asset')
export const deleteStyleAsset = (projectId: string, assetId: string) => deleteProjectRecord(projectId, 'styleAsset', assetId)
export const setStyleAssetEnabled = (projectId: string, assetId: string, enabled: boolean) => {
  const asset = getProjectRecord(projectId, 'styleAsset', assetId)
  if (!asset) throw new Error(`Style asset not found: ${assetId}`)
  return saveProjectRecord(projectId, 'styleAsset', { ...asset, enabled }, 'asset')
}

export const listStyleAssetTemplates = () => {
  ensureNovelApiTables()
  return (sqlite.prepare('SELECT * FROM novel_style_asset_templates ORDER BY updated_at DESC').all() as JsonRecord[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    scope: row.scope ?? '',
    tags: parseJson(row.tags_json, []),
    source: row.source ?? 'user',
    updatedAt: iso(row.updated_at),
  }))
}

export const saveStyleAssetTemplate = (payload: JsonRecord) => {
  ensureNovelApiTables()
  const id = payload.id ?? uid('template')
  const updatedAt = nowMs()
  sqlite
    .prepare(
      `INSERT INTO novel_style_asset_templates (id, kind, title, body, scope, tags_json, source, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, title = excluded.title, body = excluded.body, scope = excluded.scope, tags_json = excluded.tags_json, source = excluded.source, updated_at = excluded.updated_at`,
    )
    .run(id, payload.kind ?? 'sample', payload.title ?? 'Style asset', payload.body ?? '', payload.scope ?? '', JSON.stringify(payload.tags ?? []), payload.source ?? 'user', updatedAt)
  return listStyleAssetTemplates().find((item) => item.id === id)
}

export const deleteStyleAssetTemplate = (templateId: string) => {
  ensureNovelApiTables()
  sqlite.prepare('DELETE FROM novel_style_asset_templates WHERE id = ?').run(templateId)
  return true
}

export const importStyleAssetTemplate = (projectId: string, templateId: string, options: JsonRecord = {}) => {
  const template = listStyleAssetTemplates().find((item) => item.id === templateId)
  if (!template) throw new Error(`Style template not found: ${templateId}`)
  return saveStyleAsset(projectId, {
    templateId,
    kind: template.kind,
    title: template.title,
    body: template.body,
    scope: template.scope,
    source: 'preset',
    enabled: options.enabled ?? true,
  })
}

export const listChapterIssues = (projectId: string, chapterId?: string) =>
  listProjectRecords(projectId, 'chapterIssue').filter((item) => !chapterId || item.chapterId === chapterId)
export const listLocalCheckResults = (projectId: string, chapterId?: string) =>
  listProjectRecords(projectId, 'localCheckResult').filter((item) => !chapterId || item.chapterId === chapterId)
export const listAuditReports = (projectId: string) => listProjectRecords(projectId, 'auditReport')

export const pendingReviewsForProject = (projectId: string) => [
  ...listProjectRecords(projectId, 'candidateFact')
    .filter((item) => item.status === 'pending')
    .map((item) => ({ id: item.id, kind: 'candidate_fact', title: item.title, body: item.body, severity: item.risk ?? 'medium', createdAt: item.createdAt })),
  ...listAuditReports(projectId)
    .filter((item) => item.status === 'open')
    .map((item) => ({ id: item.id, kind: 'audit_report', title: item.title, body: Array.isArray(item.items) ? item.items.join('\n') : item.body ?? '', severity: item.severity ?? 'warning', createdAt: item.createdAt })),
]

export const submitCandidateFact = (projectId: string, payload: JsonRecord) =>
  saveProjectRecord(projectId, 'candidateFact', { status: 'pending', risk: 'medium', source: 'external_ai', ...payload, createdAt: nowIso() }, 'fact')
export const confirmCandidateFact = (projectId: string, candidateId: string, decision: string) => {
  const fact = getProjectRecord(projectId, 'candidateFact', candidateId)
  if (!fact) throw new Error(`Candidate fact not found: ${candidateId}`)
  return saveProjectRecord(projectId, 'candidateFact', { ...fact, status: decision }, 'fact')
}
export const settleCandidateFacts = (projectId: string, options: JsonRecord = {}) => {
  const decision = options.decision ?? 'confirmed'
  return listProjectRecords(projectId, 'candidateFact')
    .filter((item) => item.status === 'pending')
    .map((item) => confirmCandidateFact(projectId, item.id, decision))
}
export const resolveAuditReport = (projectId: string, reportId: string) => {
  const report = getProjectRecord(projectId, 'auditReport', reportId)
  if (!report) throw new Error(`Audit report not found: ${reportId}`)
  return saveProjectRecord(projectId, 'auditReport', { ...report, status: 'resolved' }, 'audit')
}
export const resolveOpenAuditReports = (projectId: string) =>
  listAuditReports(projectId)
    .filter((item) => item.status === 'open')
    .map((item) => resolveAuditReport(projectId, item.id))
export const resolveAiPendingReview = (projectId: string, reviewId: string, decision: string) => {
  const candidate = getProjectRecord(projectId, 'candidateFact', reviewId)
  if (candidate) return confirmCandidateFact(projectId, reviewId, decision === 'approve' ? 'confirmed' : 'rejected')
  const audit = getProjectRecord(projectId, 'auditReport', reviewId)
  if (audit) return resolveAuditReport(projectId, reviewId)
  return true
}

const projectSnapshotPayload = async (projectId: string) => ({
  project: getProjectOrThrow(projectId),
  worldFacts: listWorldFacts(projectId),
  characters: listCharacters(projectId),
  characterRelations: listCharacterRelations(projectId),
  chapters: await listChapters(projectId),
  chapterVersions: (await Promise.all((await listChapters(projectId)).map((chapter) => listChapterVersions(projectId, chapter.id)))).flat(),
  rewriteTasks: listProjectRecords(projectId, 'rewriteTask'),
  styleProfiles: listProjectRecords(projectId, 'styleProfile'),
  styleAssets: listProjectRecords(projectId, 'styleAsset'),
  outlineNodes: listProjectRecords(projectId, 'outlineNode'),
  chapterIssues: listProjectRecords(projectId, 'chapterIssue'),
  localCheckResults: listProjectRecords(projectId, 'localCheckResult'),
  candidateFacts: listProjectRecords(projectId, 'candidateFact'),
  auditReports: listProjectRecords(projectId, 'auditReport'),
  ...longStateForProject(projectId),
})

export const createSnapshot = async (projectId: string, payload: JsonRecord = {}) =>
  saveProjectRecord(projectId, 'snapshot', { ...payload, title: payload.title ?? 'Snapshot', reason: payload.reason ?? '', payload: await projectSnapshotPayload(projectId), createdAt: nowIso() }, 'snapshot')
export const listSnapshots = (projectId: string) => listProjectRecords(projectId, 'snapshot')
export const restoreSnapshot = async (_projectId: string, _snapshotId: string) => true
export const importProjectState = async (raw: string) => JSON.parse(raw)
export const exportProjectState = async (projectId: string) =>
  JSON.stringify({ version: 1, exportedAt: nowIso(), projectId, payload: await projectSnapshotPayload(projectId), aiTasks: listTasks(projectId), writeLogs: listWriteLogs(projectId) }, null, 2)

export const getProjectDashboardOverview = async (projectId: string) => {
  const project = getProjectOrThrow(projectId)
  const chapters = await listChapters(projectId)
  const styleLibrary = styleLibraryForProject(projectId)
  return {
    project,
    currentChapter: chapters.find((chapter) => chapter.index === project.currentChapter) ?? chapters[0],
    activeStyle: styleLibrary.profiles.find((profile) => profile.id === styleLibrary.activeProfileId),
    latestWrite: listWriteLogs(projectId)[0],
    mcp: {
      status: 'ready',
      tools: desktopMcpToolDefinitions.length,
      mode: 'Electron SQLite + file-backed manuscript content + external AI host',
    },
  }
}
export const getProjectDashboardPendingFacts = (projectId: string) => listProjectRecords(projectId, 'candidateFact').filter((item) => item.status === 'pending')
export const getProjectDashboardAuditReports = (projectId: string) => listAuditReports(projectId).filter((item) => item.status === 'open')
export const getProjectDashboardSnapshots = (projectId: string) => listSnapshots(projectId).slice(0, 5)
export const getProjectDashboardRecentChapters = async (projectId: string) => [...(await listChapters(projectId))].sort((a, b) => b.index - a.index).slice(0, 5)
export const getProjectDashboardStats = async (projectId: string) => {
  const chapters = await listChapters(projectId)
  const versions = (await Promise.all(chapters.map((chapter) => listChapterVersions(projectId, chapter.id)))).flat()
  const longState = longStateForProject(projectId)
  return {
    chapters: chapters.length,
    worldFacts: listWorldFacts(projectId).length,
    characters: listCharacters(projectId).length,
    pendingFacts: getProjectDashboardPendingFacts(projectId).length,
    auditIssues: getProjectDashboardAuditReports(projectId).length,
    snapshots: listSnapshots(projectId).length,
    plotDebts: longState.debts.length,
    pressureAlerts: longState.pressures.filter((item) => Number(item.value ?? 0) >= Number(item.threshold ?? 100) || item.status === 'breakpoint').length,
    versions: versions.length,
  }
}
export const getProjectDashboard = async (projectId: string) => ({
  ...(await getProjectDashboardOverview(projectId)),
  stats: await getProjectDashboardStats(projectId),
  recentChapters: await getProjectDashboardRecentChapters(projectId),
  pendingFacts: getProjectDashboardPendingFacts(projectId),
  auditReports: getProjectDashboardAuditReports(projectId),
  snapshots: getProjectDashboardSnapshots(projectId),
})

export const buildProjectCanvas = async (projectId: string) => {
  const project = getProjectOrThrow(projectId)
  const chapters = await listChapters(projectId)
  const versions = (await Promise.all(chapters.map((chapter) => listChapterVersions(projectId, chapter.id)))).flat()
  const tasks = listTasks(projectId)
  const nodes = [
    {
      id: `book:${projectId}`,
      kind: 'book',
      refId: projectId,
      title: 'Book',
      subtitle: project.title,
      status: project.status,
      x: 120,
      y: 120,
      width: 330,
      height: 160,
      tone: 'moss',
      metrics: [{ label: 'chapters', value: chapters.length }, { label: 'versions', value: versions.length }],
      badges: ['book'],
      summary: project.description,
    },
    ...chapters.map((chapter, index) => ({
      id: `chapter:${chapter.id}`,
      kind: 'chapter',
      refId: chapter.id,
      title: `Chapter ${chapter.index}`,
      subtitle: chapter.title,
      status: chapter.status,
      x: 600 + index * 360,
      y: 120 + (index % 2) * 220,
      width: 310,
      height: 150,
      tone: chapter.status === 'committed' ? 'moss' : 'paper',
      metrics: [{ label: 'words', value: chapter.wordCount }, { label: 'versions', value: versions.filter((version) => version.chapterId === chapter.id).length }],
      badges: chapter.draft ? ['body'] : ['pending'],
      summary: chapter.summary,
      hasBody: Boolean(chapter.draft),
    })),
    ...tasks.map((task, index) => ({
      id: `task:${task.id}`,
      kind: 'task',
      refId: task.id,
      title: task.title,
      subtitle: task.target,
      status: task.status,
      x: 600 + index * 320,
      y: 520,
      width: 310,
      height: 145,
      tone: 'amber',
      metrics: [{ label: 'order', value: task.queueOrder ?? '-' }],
      badges: ['AI task'],
      summary: task.instruction,
    })),
  ]
  const edges = chapters.map((chapter, index) => ({
    id: index === 0 ? `book:${projectId}->chapter:${chapter.id}` : `chapter:${chapters[index - 1].id}->chapter:${chapter.id}`,
    kind: index === 0 ? 'outline' : 'chapter_flow',
    source: index === 0 ? `book:${projectId}` : `chapter:${chapters[index - 1].id}`,
    target: `chapter:${chapter.id}`,
    label: index === 0 ? 'start' : 'next',
  }))
  return {
    project,
    generatedAt: nowIso(),
    nodes,
    edges,
    stats: { volumes: 1, chapters: chapters.length, tasks: tasks.length, pendingReviews: pendingReviewsForProject(projectId).length, versions: versions.length },
  }
}

export const getChapterContextPack = async (projectId: string, chapterId: string, mode = 'full') => {
  const project = getProjectOrThrow(projectId)
  const chapter = (await listChapters(projectId)).find((item) => item.id === chapterId)
  if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
  const outline = await listProjectOutline(projectId, chapterId)
  const styleLibrary = styleLibraryForProject(projectId)
  return {
    project,
    chapter,
    outlineNodes: outline.nodes,
    chapterOutline: outline.activeChapterNode,
    activeStyle: styleLibrary.profiles.find((profile) => profile.id === styleLibrary.activeProfileId),
    enabledStyleAssets: styleLibrary.assets.filter((asset) => asset.enabled !== false),
    characters: listCharacters(projectId),
    worldFacts: listWorldFacts(projectId),
    sceneCards: chapter.sceneCards,
    chapterIssues: listChapterIssues(projectId, chapterId),
    localChecks: listLocalCheckResults(projectId, chapterId),
    longState: longStateForProject(projectId),
    humanSummary: chapterHumanSummary(projectId, chapter),
    generatedAt: nowIso(),
    tokenPolicy: 'local_only',
    budget: { mode, estimatedTokens: mode === 'brief' ? 2500 : 9000, hardLimit: mode === 'brief' ? 4000 : 14000 },
  }
}

export const getCanvasNodeDetail = async (projectId: string, nodeId: string) => {
  const canvas = await buildProjectCanvas(projectId)
  const node = canvas.nodes.find((item) => item.id === nodeId)
  if (!node) throw new Error(`Canvas node not found: ${nodeId}`)
  const chapter = node.kind === 'chapter' ? (await listChapters(projectId)).find((item) => item.id === node.refId) : undefined
  return {
    node,
    project: canvas.project,
    outline: node.kind === 'chapter' ? getProjectRecord(projectId, 'outlineNode', node.refId) : undefined,
    chapter,
    versions: chapter ? await listChapterVersions(projectId, chapter.id) : [],
    tasks: listTasks(projectId).filter((task) => !chapter || task.chapterId === chapter.id || task.id === node.refId),
    contextPack: chapter ? await getChapterContextPack(projectId, chapter.id) : undefined,
    worldFacts: listWorldFacts(projectId),
    characters: listCharacters(projectId),
    styleLibrary: styleLibraryForProject(projectId),
    localChecks: chapter ? listLocalCheckResults(projectId, chapter.id) : listLocalCheckResults(projectId),
    candidateFacts: getProjectDashboardPendingFacts(projectId),
    auditReports: getProjectDashboardAuditReports(projectId),
    longState: longStateForProject(projectId),
    humanSummary: chapter ? chapterHumanSummary(projectId, chapter) : undefined,
  }
}

const chapterHumanSummary = (projectId: string, chapter: JsonRecord) => {
  const longState = longStateForProject(projectId)
  const characters = listCharacters(projectId)
  return {
    chapterId: chapter.id,
    title: chapter.title,
    intention: chapter.intention,
    plot: chapter.summary,
    participants: characters.slice(0, 4).map((character) => ({
      character,
      pressure: longState.pressures.find((item) => item.characterId === character.id),
      dialogue: longState.dialogueProfiles.find((item) => item.characterId === character.id),
      relationNotes: listCharacterRelations(projectId)
        .filter((relation) => relation.sourceCharacterId === character.id || relation.targetCharacterId === character.id)
        .map((relation) => relation.current || relation.title),
    })),
    characterStates: characters.map((item) => `${item.name ?? item.id}: ${item.status ?? item.goal ?? ''}`),
    relationshipChanges: listCharacterRelations(projectId).map((item) => `${item.title}: ${item.future ?? item.current ?? ''}`),
    pressureSignals: longState.pressures.map((item) => `${item.characterId}: ${item.value}/${item.threshold}`),
    debts: longState.debts.map((item) => `${item.title}: ${item.window ?? item.severity ?? ''}`),
    hooks: longState.foreshadows.map((item) => `${item.title}: ${item.nextWindow ?? item.status ?? ''}`),
  }
}

export const runLocalChapterCheck = async (projectId: string, chapterId: string, payload: JsonRecord) => {
  const draft = String(payload.draft ?? '')
  const issues = []
  if (draft.length < 200) issues.push({ id: uid('issue'), category: 'structure', severity: 'warning', level: 'chapter', title: 'Draft is short', body: 'Current draft may be too short for a full chapter.' })
  if (!draft.trim()) issues.push({ id: uid('issue'), category: 'structure', severity: 'danger', level: 'chapter', title: 'Draft is empty', body: 'Chapter body is empty.' })
  const result = saveProjectRecord(
    projectId,
    'localCheckResult',
    {
      chapterId,
      level: issues.some((issue) => issue.severity === 'danger') ? 'danger' : issues.length ? 'warning' : 'pass',
      requiresConfirmation: issues.length > 0,
      tokenPolicy: 'local_only',
      suggestedAction: issues.length ? 'review' : 'accept',
      issues,
      createdAt: nowIso(),
    },
    'check',
  )
  return result
}

export const createRewriteTask = (projectId: string, chapterId: string, payload: JsonRecord) => {
  const rewrite = saveProjectRecord(projectId, 'rewriteTask', { chapterId, status: 'requested', createdAt: nowIso(), ...payload }, 'rewrite')
  const task = createAiTask(projectId, {
    title: payload.title ?? `Rewrite chapter ${chapterId}`,
    target: 'rewrite_chapter',
    contextMode: 'full',
    reviewMode: 'strict',
    factStrategy: 'conservative',
    checkpointEvery: 1,
    autoPause: 'high_risk',
    chapterId,
    rewriteTaskId: rewrite?.id,
    instruction: payload.reason ?? '',
  })
  return saveProjectRecord(projectId, 'rewriteTask', { ...rewrite, aiTaskId: task.id }, 'rewrite')
}

export const completeRewriteTask = async (projectId: string, rewriteTaskId: string, payload: JsonRecord = {}) => {
  ensureNovelApiTables()
  const rewrite = getProjectRecord(projectId, 'rewriteTask', rewriteTaskId)
  if (!rewrite) throw new Error(`Rewrite task not found: ${rewriteTaskId}`)
  const taskRow =
    rewrite.aiTaskId
      ? (sqlite.prepare('SELECT * FROM novel_ai_tasks WHERE project_id = ? AND id = ?').get(projectId, rewrite.aiTaskId) as JsonRecord | undefined)
      : (sqlite.prepare('SELECT * FROM novel_ai_tasks WHERE project_id = ? AND rewrite_task_id = ?').get(projectId, rewriteTaskId) as JsonRecord | undefined)
  const versionId = String(payload.versionId ?? rewrite.versionId ?? '').trim() || undefined
  const nextRewrite = saveProjectRecord(
    projectId,
    'rewriteTask',
    {
      ...rewrite,
      status: 'completed',
      versionId,
      completedAt: nowIso(),
    },
    'rewrite',
  )
  const aiTask = taskRow ? await completeAiTask(projectId, taskRow.id, { kind: 'rewrite', summary: payload.summary ?? versionId ?? '' }) : undefined
  addWriteLog(projectId, {
    taskId: taskRow?.id,
    kind: 'rewrite',
    title: 'Rewrite task completed',
    summary: versionId ? `Candidate version: ${versionId}` : rewrite.reason ?? '',
    actor: 'codex',
  })
  return { rewriteTask: nextRewrite, aiTask }
}

const toPositiveInteger = (value: unknown) => {
  const numeric = Number(value)
  return Number.isInteger(numeric) && numeric > 0 ? numeric : undefined
}

const syncChapterFromOutlineNode = (projectId: string, rawPayload: JsonRecord) => {
  if (rawPayload.kind !== 'chapter') return rawPayload

  const byId = rawPayload.chapterId
    ? (sqlite.prepare('SELECT * FROM novel_chapters WHERE project_id = ? AND id = ?').get(projectId, rawPayload.chapterId) as JsonRecord | undefined)
    : undefined
  const chapterIndex =
    toPositiveInteger(rawPayload.chapterIndex) ??
    toPositiveInteger(rawPayload.order) ??
    toPositiveInteger(byId?.chapter_index)

  if (!chapterIndex) return rawPayload

  const existing =
    byId ??
    (sqlite.prepare('SELECT * FROM novel_chapters WHERE project_id = ? AND chapter_index = ?').get(projectId, chapterIndex) as JsonRecord | undefined)
  const title = String(rawPayload.title ?? existing?.title ?? `Chapter ${chapterIndex}`).trim() || `Chapter ${chapterIndex}`
  const intention = String(rawPayload.goal ?? rawPayload.intention ?? existing?.intention ?? '').trim()
  const summary = String(rawPayload.summary ?? existing?.summary ?? '').trim()
  const status = String(rawPayload.chapterStatus ?? existing?.status ?? 'planned').trim() || 'planned'
  const updatedAt = nowMs()
  const chapterId = existing?.id ?? uid('chapter')

  if (existing) {
    sqlite
      .prepare('UPDATE novel_chapters SET chapter_index = ?, title = ?, status = ?, intention = ?, summary = ?, updated_at = ? WHERE project_id = ? AND id = ?')
      .run(chapterIndex, title, status, intention, summary, updatedAt, projectId, chapterId)
  } else {
    sqlite
      .prepare(
        'INSERT INTO novel_chapters (id, project_id, chapter_index, title, status, intention, summary, draft_blob_id, word_count, scene_cards_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(chapterId, projectId, chapterIndex, title, status, intention, summary, null, 0, '[]', updatedAt)
  }

  const maxIndex = (sqlite.prepare('SELECT MAX(chapter_index) AS maxIndex FROM novel_chapters WHERE project_id = ?').get(projectId) as { maxIndex?: number }).maxIndex ?? chapterIndex
  sqlite.prepare('UPDATE novel_projects SET current_chapter = ?, updated_at = ? WHERE id = ?').run(maxIndex, updatedAt, projectId)
  return { ...rawPayload, chapterId, chapterIndex, order: rawPayload.order ?? chapterIndex }
}

export const listProjectOutline = async (projectId: string, chapterId?: string) => {
  const nodes = listProjectRecords(projectId, 'outlineNode')
  if (!nodes.length) {
    const chapters = await listChapters(projectId)
    return {
      nodes: chapters.map((chapter, index) => ({
        id: `outline:${chapter.id}`,
        projectId,
        kind: 'chapter',
        title: chapter.title,
        summary: chapter.summary,
        goal: chapter.intention,
        conflict: '',
        payoff: '',
        status: 'drafting',
        chapterId: chapter.id,
        chapterIndex: chapter.index,
        order: index + 1,
        updatedAt: chapter.updatedAt,
      })),
      activeChapterNode: chapterId ? undefined : undefined,
    }
  }
  return { nodes, activeChapterNode: chapterId ? nodes.find((node) => node.chapterId === chapterId) : undefined }
}
export const saveOutlineNode = async (projectId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  getProjectOrThrow(projectId)
  const normalized = syncChapterFromOutlineNode(projectId, payload)
  const node = saveProjectRecord(projectId, 'outlineNode', normalized, 'outline')
  addWriteLog(projectId, { kind: 'outline', title: 'Outline node saved', summary: normalized.title ?? normalized.kind ?? '', actor: 'codex' })
  return node
}
export const saveOutlineBatch = async (projectId: string, payload: JsonRecord) => {
  ensureNovelApiTables()
  getProjectOrThrow(projectId)
  if (payload.project && typeof payload.project === 'object') await updateProject(projectId, payload.project as JsonRecord)
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : []
  const savedNodes = []
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const normalized = syncChapterFromOutlineNode(projectId, node as JsonRecord)
    savedNodes.push(saveProjectRecord(projectId, 'outlineNode', normalized, 'outline'))
  }
  addWriteLog(projectId, { kind: 'outline', title: 'Outline batch saved', summary: `${savedNodes.length} outline nodes`, actor: 'codex' })
  return { project: getProjectOrThrow(projectId), outline: await listProjectOutline(projectId), savedNodes }
}
export const deleteOutlineNode = (projectId: string, nodeId: string) => deleteProjectRecord(projectId, 'outlineNode', nodeId)

export const exportProjectText = async (projectId: string) => {
  const project = getProjectOrThrow(projectId)
  const chapters = await listChapters(projectId)
  return [`# ${project.title}`, project.description, '', ...chapters.map((chapter) => `## Chapter ${chapter.index}: ${chapter.title}\n\n${chapter.draft || chapter.summary}`)].join('\n\n')
}

export const listMcpToolNames = () => desktopMcpToolDefinitions.map((tool) => tool.name)
export const syncContentStorage = async () => {
  const projects = listProjects()
  const chapters = (await Promise.all(projects.map((project) => listChapters(project.id)))).flat()
  const chapterVersions = (await Promise.all(chapters.map((chapter) => listChapterVersions(chapter.projectId, chapter.id)))).flat()
  return syncNovelStateContent({ projects, chapters, chapterVersions })
}

export const clearRealWorkspace = () => {
  ensureNovelApiTables()
  for (const table of ['novel_chapter_versions', 'novel_chapters', 'novel_ai_tasks', 'novel_write_logs', 'novel_project_records', 'novel_style_asset_templates', 'novel_projects']) {
    sqlite.prepare(`DELETE FROM ${table}`).run()
  }
  return true
}
