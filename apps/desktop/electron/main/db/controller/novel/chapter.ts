import { NovelChapterService } from '../../services/novel/chapter-service'
import { objectParam, optionalStringParam, registerNovelRoute, stringParam } from './route-utils'

export const registerNovelChapterRoutes = () => {
  registerNovelRoute('db/novel/chapter/list', (params) => NovelChapterService.list(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/chapter/create', (params) =>
    NovelChapterService.create(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/chapter/save-draft', (params) =>
    NovelChapterService.saveDraft(
      stringParam(params, 'projectId'),
      stringParam(params, 'chapterId'),
      objectParam(params, 'payload'),
    ),
  )

  registerNovelRoute('db/novel/chapter/version/list', (params) =>
    NovelChapterService.listVersions(stringParam(params, 'projectId'), stringParam(params, 'chapterId')),
  )

  registerNovelRoute('db/novel/chapter/version/save', (params) =>
    NovelChapterService.saveVersion(
      stringParam(params, 'projectId'),
      stringParam(params, 'chapterId'),
      objectParam(params, 'payload'),
    ),
  )

  registerNovelRoute('db/novel/chapter/version/generate', (params) =>
    NovelChapterService.generateDraft(stringParam(params, 'projectId'), stringParam(params, 'chapterId')),
  )

  registerNovelRoute('db/novel/chapter/version/apply', (params) =>
    NovelChapterService.applyVersion(
      stringParam(params, 'projectId'),
      stringParam(params, 'chapterId'),
      stringParam(params, 'versionId'),
    ),
  )

  registerNovelRoute('db/novel/chapter/check/run', (params) =>
    NovelChapterService.runLocalCheck(
      stringParam(params, 'projectId'),
      stringParam(params, 'chapterId'),
      objectParam(params, 'payload'),
    ),
  )

  registerNovelRoute('db/novel/chapter/check/list', (params) =>
    NovelChapterService.listLocalChecks(stringParam(params, 'projectId'), optionalStringParam(params, 'chapterId')),
  )

  registerNovelRoute('db/novel/chapter/rewrite/create', (params) =>
    NovelChapterService.createRewriteTask(
      stringParam(params, 'projectId'),
      stringParam(params, 'chapterId'),
      objectParam(params, 'payload'),
    ),
  )

  registerNovelRoute('db/novel/chapter/context-pack', (params) =>
    NovelChapterService.contextPack(
      stringParam(params, 'projectId'),
      stringParam(params, 'chapterId'),
      optionalStringParam(params, 'mode'),
    ),
  )

  registerNovelRoute('db/novel/chapter/outline', (params) =>
    NovelChapterService.outline(stringParam(params, 'projectId'), optionalStringParam(params, 'chapterId')),
  )

  registerNovelRoute('db/novel/chapter/outline/save', (params) =>
    NovelChapterService.saveOutlineNode(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/chapter/outline/batch-save', (params) =>
    NovelChapterService.saveOutlineBatch(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/chapter/outline/delete', (params) =>
    NovelChapterService.deleteOutlineNode(stringParam(params, 'projectId'), stringParam(params, 'nodeId')),
  )

  registerNovelRoute('db/novel/chapter/export-text', (params) =>
    NovelChapterService.exportText(stringParam(params, 'projectId')),
  )
}
