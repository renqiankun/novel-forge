import { queryDB } from '../_queryDB'

export const novelStyleApi = {
  listStyleProfiles: (projectId: string) => queryDB('db/novel/style/library', { projectId }),

  saveStyleProfile: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/style/profile/save', { projectId, payload }),

  bindProjectStyle: (projectId: string, profileId: string) =>
    queryDB('db/novel/style/profile/bind', { projectId, profileId }),

  deleteStyleProfile: (projectId: string, profileId: string) =>
    queryDB('db/novel/style/profile/delete', { projectId, profileId }),

  saveStyleAsset: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/style/asset/save', { projectId, payload }),

  deleteStyleAsset: (projectId: string, assetId: string) =>
    queryDB('db/novel/style/asset/delete', { projectId, assetId }),

  setStyleAssetEnabled: (projectId: string, assetId: string, enabled: boolean) =>
    queryDB('db/novel/style/asset/enabled', { projectId, assetId, enabled }),

  listStyleAssetTemplates: () => queryDB('db/novel/style/template/list'),

  saveStyleAssetTemplate: (payload: Record<string, unknown>) =>
    queryDB('db/novel/style/template/save', { payload }),

  deleteStyleAssetTemplate: (templateId: string) => queryDB('db/novel/style/template/delete', { templateId }),

  importStyleAssetTemplate: (projectId: string, templateId: string, options?: Record<string, unknown>) =>
    queryDB('db/novel/style/template/import', { projectId, templateId, options }),
}
