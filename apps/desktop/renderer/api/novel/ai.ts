import { queryDB } from '../_queryDB'
import type { AiWorkbench, ProjectDashboard } from '../novelPreview'

export const novelAiApi = {
  getAiWorkbenchStats: (projectId: string) => queryDB<AiWorkbench['stats']>('db/novel/ai/workbench/stats', { projectId }),

  listAiTasks: (projectId: string) => queryDB<AiWorkbench['tasks']>('db/novel/ai/tasks', { projectId }),

  listAiRuns: (projectId: string) => queryDB<AiWorkbench['runs']>('db/novel/ai/runs', { projectId }),

  listWriteLogs: (projectId: string) => queryDB<AiWorkbench['writeLogs']>('db/novel/ai/write-logs', { projectId }),

  listMcpResourcePreviews: (projectId: string) =>
    queryDB<AiWorkbench['resourcePreviews']>('db/novel/ai/resource-previews', { projectId }),

  getAiWorkbench: async (projectId: string): Promise<AiWorkbench> => {
    const [overview, stats, tasks, taskQueue, runs, writeLogs, resourcePreviews, pendingReviews] = await Promise.all([
      queryDB<Pick<ProjectDashboard, 'project'>>('db/novel/project/dashboard/overview', { projectId }),
      novelAiApi.getAiWorkbenchStats(projectId),
      novelAiApi.listAiTasks(projectId),
      novelAiApi.getAiTaskQueue(projectId),
      novelAiApi.listAiRuns(projectId),
      novelAiApi.listWriteLogs(projectId),
      novelAiApi.listMcpResourcePreviews(projectId),
      novelAiApi.getPendingReviews(projectId),
    ])

    return {
      project: overview.project,
      stats,
      tasks,
      taskQueue,
      runs,
      writeLogs,
      resourcePreviews,
      pendingReviews,
    }
  },

  createAiTask: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/ai/task/create', { projectId, payload }),

  getAiTaskPackage: (projectId: string, taskId: string) =>
    queryDB('db/novel/ai/task/package', { projectId, taskId }),

  getAiTaskQueue: (projectId: string) => queryDB<AiWorkbench['taskQueue']>('db/novel/ai/task/queue', { projectId }),

  reorderAiTaskQueue: (projectId: string, orderedTaskIds: string[]) =>
    queryDB('db/novel/ai/task/reorder', { projectId, orderedTaskIds }),

  deleteAiTask: (projectId: string, taskId: string) => queryDB('db/novel/ai/task/delete', { projectId, taskId }),

  completeAiTask: (projectId: string, taskId: string, payload?: Record<string, unknown>) =>
    queryDB('db/novel/ai/task/complete', { projectId, taskId, payload }),

  getPendingReviews: (projectId: string) => queryDB<AiWorkbench['pendingReviews']>('db/novel/ai/review/pending', { projectId }),

  resolveAiPendingReview: (projectId: string, reviewId: string, decision: string) =>
    queryDB('db/novel/ai/review/resolve', { projectId, reviewId, decision }),
}
