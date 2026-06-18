import {
  confirmCandidateFact,
  createSnapshot,
  deleteLongStateRecord,
  exportProjectState,
  importProjectState,
  listAuditReports,
  listChapterIssues,
  listSnapshots,
  longStateForProject,
  resolveAuditReport,
  resolveOpenAuditReports,
  restoreSnapshot,
  saveLongStateRecord,
  settleCandidateFacts,
  submitCandidateFact,
} from '../../../novel/novel-api-service'

export class NovelStateService {
  static listChapterIssues(projectId: string, chapterId?: string) {
    return listChapterIssues(projectId, chapterId)
  }

  static submitCandidate(projectId: string, payload: Record<string, unknown>) {
    return submitCandidateFact(projectId, payload)
  }

  static confirmCandidate(projectId: string, factId: string, strategy: string) {
    return confirmCandidateFact(projectId, factId, strategy)
  }

  static settleCandidates(projectId: string, payload?: Record<string, unknown>) {
    return settleCandidateFacts(projectId, payload ?? {})
  }

  static listAuditReports(projectId: string) {
    return listAuditReports(projectId)
  }

  static resolveAuditReport(projectId: string, reportId: string) {
    return resolveAuditReport(projectId, reportId)
  }

  static resolveOpenAuditReports(projectId: string) {
    return resolveOpenAuditReports(projectId)
  }

  static longState(projectId: string) {
    return longStateForProject(projectId)
  }

  static saveLongStateRecord(projectId: string, kind: string, payload: Record<string, unknown>) {
    return saveLongStateRecord(projectId, kind, payload)
  }

  static deleteLongStateRecord(projectId: string, kind: string, recordId: string) {
    return deleteLongStateRecord(projectId, kind, recordId)
  }

  static listSnapshots(projectId: string) {
    return listSnapshots(projectId)
  }

  static createSnapshot(projectId: string, payload?: Record<string, unknown>) {
    return createSnapshot(projectId, payload ?? {})
  }

  static restoreSnapshot(projectId: string, snapshotId: string) {
    return restoreSnapshot(projectId, snapshotId)
  }

  static exportProjectState(projectId: string) {
    return exportProjectState(projectId)
  }

  static importProjectState(filePath: string) {
    return importProjectState(filePath)
  }
}
