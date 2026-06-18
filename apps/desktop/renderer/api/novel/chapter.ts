import { queryDB } from '../_queryDB'

export const novelChapterApi = {
  listChapters: (projectId: string) => queryDB('db/novel/chapter/list', { projectId }),

  createChapter: (projectId: string) => queryDB('db/novel/chapter/create', { projectId }),

  saveDraft: (projectId: string, chapterId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/chapter/save-draft', { projectId, chapterId, payload }),

  listChapterVersions: (projectId: string, chapterId: string) =>
    queryDB('db/novel/chapter/version/list', { projectId, chapterId }),

  saveChapterVersion: (projectId: string, chapterId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/chapter/version/save', { projectId, chapterId, payload }),

  generateDraftCandidate: (projectId: string, chapterId: string) =>
    queryDB('db/novel/chapter/version/generate', { projectId, chapterId }),

  applyChapterVersion: (projectId: string, chapterId: string, versionId: string) =>
    queryDB('db/novel/chapter/version/apply', { projectId, chapterId, versionId }),

  runLocalChapterCheck: (projectId: string, chapterId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/chapter/check/run', { projectId, chapterId, payload }),

  listLocalCheckResults: (projectId: string, chapterId?: string) =>
    queryDB('db/novel/chapter/check/list', { projectId, chapterId }),

  createRewriteTask: (projectId: string, chapterId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/chapter/rewrite/create', { projectId, chapterId, payload }),

  getChapterContextPack: (projectId: string, chapterId: string, mode?: string) =>
    queryDB('db/novel/chapter/context-pack', { projectId, chapterId, mode }),

  listProjectOutline: (projectId: string, chapterId?: string) =>
    queryDB('db/novel/chapter/outline', { projectId, chapterId }),

  saveOutlineNode: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/chapter/outline/save', { projectId, payload }),

  saveOutlineBatch: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/chapter/outline/batch-save', { projectId, payload }),

  deleteOutlineNode: (projectId: string, nodeId: string) =>
    queryDB('db/novel/chapter/outline/delete', { projectId, nodeId }),

  exportProjectText: (projectId: string) => queryDB('db/novel/chapter/export-text', { projectId }),
}
