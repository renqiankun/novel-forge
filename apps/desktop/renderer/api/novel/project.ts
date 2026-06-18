import { queryDB } from '../_queryDB'
import type { NovelProject, ProjectDashboard } from '../novelPreview'

type ProjectDashboardOverview = Pick<ProjectDashboard, 'project' | 'currentChapter' | 'activeStyle' | 'latestWrite' | 'mcp'>

export const novelProjectApi = {
  listProjects: () => queryDB<NovelProject[]>('db/novel/project/list'),

  createProject: (payload: Record<string, unknown>) => queryDB<NovelProject>('db/novel/project/create', { payload }),

  updateProject: (projectId: string, payload: Record<string, unknown>) =>
    queryDB<NovelProject>('db/novel/project/update', { projectId, payload }),

  getProjectDashboardOverview: (projectId: string) =>
    queryDB<ProjectDashboardOverview>('db/novel/project/dashboard/overview', { projectId }),

  getProjectDashboardStats: (projectId: string) =>
    queryDB<ProjectDashboard['stats']>('db/novel/project/dashboard/stats', { projectId }),

  getProjectDashboardRecentChapters: (projectId: string) =>
    queryDB<ProjectDashboard['recentChapters']>('db/novel/project/dashboard/recent-chapters', { projectId }),

  getProjectDashboardPendingFacts: (projectId: string) =>
    queryDB<ProjectDashboard['pendingFacts']>('db/novel/project/dashboard/pending-facts', { projectId }),

  getProjectDashboardAuditReports: (projectId: string) =>
    queryDB<ProjectDashboard['auditReports']>('db/novel/project/dashboard/audit-reports', { projectId }),

  getProjectDashboardSnapshots: (projectId: string) =>
    queryDB<ProjectDashboard['snapshots']>('db/novel/project/dashboard/snapshots', { projectId }),

  getProjectDashboard: async (projectId: string): Promise<ProjectDashboard> => {
    const [overview, stats, recentChapters, pendingFacts, auditReports, snapshots] = await Promise.all([
      novelProjectApi.getProjectDashboardOverview(projectId),
      novelProjectApi.getProjectDashboardStats(projectId),
      novelProjectApi.getProjectDashboardRecentChapters(projectId),
      novelProjectApi.getProjectDashboardPendingFacts(projectId),
      novelProjectApi.getProjectDashboardAuditReports(projectId),
      novelProjectApi.getProjectDashboardSnapshots(projectId),
    ])

    return {
      ...overview,
      stats,
      recentChapters,
      pendingFacts,
      auditReports,
      snapshots,
    }
  },

  clearWorkspace: () => queryDB('db/novel/project/clear'),
}
