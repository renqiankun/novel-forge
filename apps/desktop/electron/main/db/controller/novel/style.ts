import { NovelStyleService } from '../../services/novel/style-service'
import { booleanParam, objectParam, registerNovelRoute, stringParam } from './route-utils'

export const registerNovelStyleRoutes = () => {
  registerNovelRoute('db/novel/style/library', (params) => NovelStyleService.library(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/style/profile/save', (params) =>
    NovelStyleService.saveProfile(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/style/profile/bind', (params) =>
    NovelStyleService.bindProfile(stringParam(params, 'projectId'), stringParam(params, 'profileId')),
  )

  registerNovelRoute('db/novel/style/profile/delete', (params) =>
    NovelStyleService.deleteProfile(stringParam(params, 'projectId'), stringParam(params, 'profileId')),
  )

  registerNovelRoute('db/novel/style/asset/save', (params) =>
    NovelStyleService.saveAsset(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/style/asset/delete', (params) =>
    NovelStyleService.deleteAsset(stringParam(params, 'projectId'), stringParam(params, 'assetId')),
  )

  registerNovelRoute('db/novel/style/asset/enabled', (params) =>
    NovelStyleService.setAssetEnabled(
      stringParam(params, 'projectId'),
      stringParam(params, 'assetId'),
      booleanParam(params, 'enabled'),
    ),
  )

  registerNovelRoute('db/novel/style/template/list', () => NovelStyleService.templates())

  registerNovelRoute('db/novel/style/template/save', (params) =>
    NovelStyleService.saveTemplate(objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/style/template/delete', (params) =>
    NovelStyleService.deleteTemplate(stringParam(params, 'templateId')),
  )

  registerNovelRoute('db/novel/style/template/import', (params) =>
    NovelStyleService.importTemplate(
      stringParam(params, 'projectId'),
      stringParam(params, 'templateId'),
      objectParam(params, 'options'),
    ),
  )
}
