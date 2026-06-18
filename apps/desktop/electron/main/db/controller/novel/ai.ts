import { NovelAiService } from '../../services/novel/ai-service'
import { objectParam, registerNovelRoute, stringArrayParam, stringParam } from './route-utils'

export const registerNovelAiRoutes = () => {
  registerNovelRoute('db/novel/ai/workbench/stats', (params) =>
    NovelAiService.workbenchStats(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/ai/tasks', (params) => NovelAiService.tasks(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/ai/task/create', (params) =>
    NovelAiService.createTask(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/ai/task/package', (params) =>
    NovelAiService.taskPackage(stringParam(params, 'projectId'), stringParam(params, 'taskId')),
  )

  registerNovelRoute('db/novel/ai/task/queue', (params) => NovelAiService.queue(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/ai/runs', (params) => NovelAiService.runs(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/ai/write-logs', (params) => NovelAiService.writeLogs(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/ai/resource-previews', (params) =>
    NovelAiService.resourcePreviews(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/ai/task/reorder', (params) =>
    NovelAiService.reorderQueue(stringParam(params, 'projectId'), stringArrayParam(params, 'orderedTaskIds')),
  )

  registerNovelRoute('db/novel/ai/task/delete', (params) =>
    NovelAiService.deleteTask(stringParam(params, 'projectId'), stringParam(params, 'taskId')),
  )

  registerNovelRoute('db/novel/ai/task/complete', (params) =>
    NovelAiService.completeTask(stringParam(params, 'projectId'), stringParam(params, 'taskId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/ai/review/pending', (params) =>
    NovelAiService.pendingReviews(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/ai/review/resolve', (params) =>
    NovelAiService.resolveReview(
      stringParam(params, 'projectId'),
      stringParam(params, 'reviewId'),
      stringParam(params, 'decision'),
    ),
  )
}
