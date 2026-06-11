import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const novelProjects = sqliteTable('novel_projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['planning', 'drafting', 'reviewing', 'paused', 'archived'],
  })
    .notNull()
    .default('planning'),
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
