import { NovelProjectService } from '../../services/novel/project-service'
import { objectParam, registerNovelRoute, stringParam } from './route-utils'

export const registerNovelProjectRoutes = () => {
  registerNovelRoute('db/novel/project/list', () => NovelProjectService.list())

  registerNovelRoute('db/novel/project/create', (params) => NovelProjectService.create(objectParam(params, 'payload')))

  registerNovelRoute('db/novel/project/update', (params) =>
    NovelProjectService.update(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/project/dashboard/overview', (params) =>
    NovelProjectService.dashboardOverview(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/project/dashboard/stats', (params) =>
    NovelProjectService.dashboardStats(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/project/dashboard/recent-chapters', (params) =>
    NovelProjectService.dashboardRecentChapters(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/project/dashboard/pending-facts', (params) =>
    NovelProjectService.dashboardPendingFacts(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/project/dashboard/audit-reports', (params) =>
    NovelProjectService.dashboardAuditReports(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/project/dashboard/snapshots', (params) =>
    NovelProjectService.dashboardSnapshots(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/project/clear', () => NovelProjectService.clearWorkspace())
}
