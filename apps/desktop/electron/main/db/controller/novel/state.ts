import { NovelStateService } from '../../services/novel/state-service'
import { objectParam, optionalStringParam, registerNovelRoute, stringParam } from './route-utils'

export const registerNovelStateRoutes = () => {
  registerNovelRoute('db/novel/state/chapter-issues', (params) =>
    NovelStateService.listChapterIssues(stringParam(params, 'projectId'), optionalStringParam(params, 'chapterId')),
  )

  registerNovelRoute('db/novel/state/candidate/submit', (params) =>
    NovelStateService.submitCandidate(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/state/candidate/confirm', (params) =>
    NovelStateService.confirmCandidate(
      stringParam(params, 'projectId'),
      stringParam(params, 'factId'),
      stringParam(params, 'strategy'),
    ),
  )

  registerNovelRoute('db/novel/state/candidate/settle', (params) =>
    NovelStateService.settleCandidates(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/state/audit/list', (params) =>
    NovelStateService.listAuditReports(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/state/audit/resolve', (params) =>
    NovelStateService.resolveAuditReport(stringParam(params, 'projectId'), stringParam(params, 'reportId')),
  )

  registerNovelRoute('db/novel/state/audit/resolve-open', (params) =>
    NovelStateService.resolveOpenAuditReports(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/state/long', (params) => NovelStateService.longState(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/state/long/save', (params) =>
    NovelStateService.saveLongStateRecord(
      stringParam(params, 'projectId'),
      stringParam(params, 'kind'),
      objectParam(params, 'payload'),
    ),
  )

  registerNovelRoute('db/novel/state/long/delete', (params) =>
    NovelStateService.deleteLongStateRecord(
      stringParam(params, 'projectId'),
      stringParam(params, 'kind'),
      stringParam(params, 'recordId'),
    ),
  )

  registerNovelRoute('db/novel/state/snapshot/list', (params) =>
    NovelStateService.listSnapshots(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/state/snapshot/create', (params) =>
    NovelStateService.createSnapshot(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/state/snapshot/restore', (params) =>
    NovelStateService.restoreSnapshot(stringParam(params, 'projectId'), stringParam(params, 'snapshotId')),
  )

  registerNovelRoute('db/novel/state/export', (params) =>
    NovelStateService.exportProjectState(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/state/import', (params) =>
    NovelStateService.importProjectState(stringParam(params, 'filePath')),
  )
}
