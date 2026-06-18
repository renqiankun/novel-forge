import { queryDB } from '../_queryDB'

export const novelStateApi = {
  listChapterIssues: (projectId: string, chapterId?: string) =>
    queryDB('db/novel/state/chapter-issues', { projectId, chapterId }),

  submitCandidateFact: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/state/candidate/submit', { projectId, payload }),

  confirmCandidateFact: (projectId: string, factId: string, strategy: string) =>
    queryDB('db/novel/state/candidate/confirm', { projectId, factId, strategy }),

  settleCandidateFacts: (projectId: string, payload?: Record<string, unknown>) =>
    queryDB('db/novel/state/candidate/settle', { projectId, payload }),

  listAuditReports: (projectId: string) => queryDB('db/novel/state/audit/list', { projectId }),

  resolveAuditReport: (projectId: string, reportId: string) =>
    queryDB('db/novel/state/audit/resolve', { projectId, reportId }),

  resolveOpenAuditReports: (projectId: string) => queryDB('db/novel/state/audit/resolve-open', { projectId }),

  getLongState: (projectId: string) => queryDB('db/novel/state/long', { projectId }),

  saveLongStateRecord: (projectId: string, kind: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/state/long/save', { projectId, kind, payload }),

  deleteLongStateRecord: (projectId: string, kind: string, recordId: string) =>
    queryDB('db/novel/state/long/delete', { projectId, kind, recordId }),

  listSnapshots: (projectId: string) => queryDB('db/novel/state/snapshot/list', { projectId }),

  createSnapshot: (projectId: string, payload?: Record<string, unknown>) =>
    queryDB('db/novel/state/snapshot/create', { projectId, payload }),

  restoreSnapshot: (projectId: string, snapshotId: string) =>
    queryDB('db/novel/state/snapshot/restore', { projectId, snapshotId }),

  exportProjectState: (projectId: string) => queryDB('db/novel/state/export', { projectId }),

  importProjectState: (filePath: string) => queryDB('db/novel/state/import', { filePath }),
}
