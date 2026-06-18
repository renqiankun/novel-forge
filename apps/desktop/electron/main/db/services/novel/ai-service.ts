import {
  completeAiTask,
  createAiTask,
  deleteAiTask,
  getAiTaskPackage,
  getAiWorkbench,
  getAiWorkbenchResourcePreviews,
  getAiWorkbenchRuns,
  getAiWorkbenchStats,
  getAiWorkbenchTasks,
  getAiWorkbenchWriteLogs,
  pendingReviewsForProject,
  reorderAiTaskQueue,
  resolveAiPendingReview,
  taskQueueForProject,
} from '../../../novel/novel-api-service'

export class NovelAiService {
  static workbench(projectId: string) {
    return getAiWorkbench(projectId)
  }

  static workbenchStats(projectId: string) {
    return getAiWorkbenchStats(projectId)
  }

  static tasks(projectId: string) {
    return getAiWorkbenchTasks(projectId)
  }

  static createTask(projectId: string, payload: Record<string, unknown>) {
    return createAiTask(projectId, payload)
  }

  static taskPackage(projectId: string, taskId: string) {
    return getAiTaskPackage(projectId, taskId)
  }

  static queue(projectId: string) {
    return taskQueueForProject(projectId)
  }

  static runs(projectId: string) {
    return getAiWorkbenchRuns(projectId)
  }

  static writeLogs(projectId: string) {
    return getAiWorkbenchWriteLogs(projectId)
  }

  static resourcePreviews(projectId: string) {
    return getAiWorkbenchResourcePreviews(projectId)
  }

  static reorderQueue(projectId: string, orderedTaskIds: string[]) {
    return reorderAiTaskQueue(projectId, orderedTaskIds)
  }

  static deleteTask(projectId: string, taskId: string) {
    return deleteAiTask(projectId, taskId)
  }

  static completeTask(projectId: string, taskId: string, payload?: Record<string, unknown>) {
    return completeAiTask(projectId, taskId, payload ?? {})
  }

  static pendingReviews(projectId: string) {
    return pendingReviewsForProject(projectId)
  }

  static resolveReview(projectId: string, reviewId: string, decision: string) {
    return resolveAiPendingReview(projectId, reviewId, decision)
  }
}
