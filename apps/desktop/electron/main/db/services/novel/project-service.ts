import {
  clearRealWorkspace,
  createProject,
  getProjectDashboardAuditReports,
  getProjectDashboardOverview,
  getProjectDashboardPendingFacts,
  getProjectDashboardRecentChapters,
  getProjectDashboardSnapshots,
  getProjectDashboardStats,
  listProjects,
  updateProject,
} from '../../../novel/novel-api-service'

export class NovelProjectService {
  static list() {
    return listProjects()
  }

  static create(payload: Record<string, unknown>) {
    return createProject(payload)
  }

  static update(projectId: string, payload: Record<string, unknown>) {
    return updateProject(projectId, payload)
  }

  static dashboardOverview(projectId: string) {
    return getProjectDashboardOverview(projectId)
  }

  static dashboardStats(projectId: string) {
    return getProjectDashboardStats(projectId)
  }

  static dashboardRecentChapters(projectId: string) {
    return getProjectDashboardRecentChapters(projectId)
  }

  static dashboardPendingFacts(projectId: string) {
    return getProjectDashboardPendingFacts(projectId)
  }

  static dashboardAuditReports(projectId: string) {
    return getProjectDashboardAuditReports(projectId)
  }

  static dashboardSnapshots(projectId: string) {
    return getProjectDashboardSnapshots(projectId)
  }

  static clearWorkspace() {
    return clearRealWorkspace()
  }
}
