import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const novelProjects = sqliteTable('novel_projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  genre: text('genre').notNull().default(''),
  status: text('status', {
    enum: ['planning', 'drafting', 'reviewing', 'paused', 'archived'],
  })
    .notNull()
    .default('planning'),
  styleProfileId: text('style_profile_id'),
  targetChapters: integer('target_chapters').notNull().default(300),
  currentChapter: integer('current_chapter').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const storyFacts = sqliteTable('story_facts', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => novelProjects.id),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  source: text('source'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelAppSettings = sqliteTable('novel_app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelContentBlobs = sqliteTable('novel_content_blobs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  entityType: text('entity_type', {
    enum: ['chapter', 'chapter_version'],
  }).notNull(),
  entityId: text('entity_id').notNull(),
  chapterId: text('chapter_id'),
  versionId: text('version_id'),
  role: text('role', {
    enum: ['draft', 'version'],
  }).notNull(),
  status: text('status'),
  relativePath: text('relative_path').notNull(),
  contentHash: text('content_hash').notNull(),
  byteLength: integer('byte_length').notNull(),
  wordCount: integer('word_count').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelChapters = sqliteTable('novel_chapters', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  chapterIndex: integer('chapter_index').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  intention: text('intention').notNull().default(''),
  summary: text('summary').notNull().default(''),
  draftBlobId: text('draft_blob_id'),
  wordCount: integer('word_count').notNull().default(0),
  sceneCardsJson: text('scene_cards_json').notNull().default('[]'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelChapterVersions = sqliteTable('novel_chapter_versions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  title: text('title').notNull(),
  kind: text('kind').notNull(),
  status: text('status').notNull(),
  bodyBlobId: text('body_blob_id'),
  summary: text('summary').notNull().default(''),
  wordCount: integer('word_count').notNull().default(0),
  source: text('source').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelAiTasks = sqliteTable('novel_ai_tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  title: text('title').notNull(),
  target: text('target').notNull(),
  status: text('status').notNull(),
  queueOrder: integer('queue_order').notNull(),
  contextMode: text('context_mode').notNull(),
  reviewMode: text('review_mode').notNull(),
  factStrategy: text('fact_strategy').notNull(),
  checkpointEvery: integer('checkpoint_every').notNull(),
  autoPause: text('auto_pause').notNull(),
  chapterId: text('chapter_id'),
  rewriteTaskId: text('rewrite_task_id'),
  instruction: text('instruction').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelWriteLogs = sqliteTable('novel_write_logs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  taskId: text('task_id'),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  actor: text('actor').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelStyleAssetTemplates = sqliteTable('novel_style_asset_templates', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  scope: text('scope').notNull().default(''),
  tagsJson: text('tags_json').notNull().default('[]'),
  source: text('source').notNull().default('user'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const novelProjectRecords = sqliteTable('novel_project_records', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  recordKind: text('record_kind').notNull(),
  payloadJson: text('payload_json').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})
