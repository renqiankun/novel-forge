import {
  bindProjectStyle,
  deleteStyleAsset,
  deleteStyleAssetTemplate,
  deleteStyleProfile,
  importStyleAssetTemplate,
  listStyleAssetTemplates,
  saveStyleAsset,
  saveStyleAssetTemplate,
  saveStyleProfile,
  setStyleAssetEnabled,
  styleLibraryForProject,
} from '../../../novel/novel-api-service'

export class NovelStyleService {
  static library(projectId: string) {
    return styleLibraryForProject(projectId)
  }

  static saveProfile(projectId: string, payload: Record<string, unknown>) {
    return saveStyleProfile(projectId, payload)
  }

  static bindProfile(projectId: string, profileId: string) {
    return bindProjectStyle(projectId, profileId)
  }

  static deleteProfile(projectId: string, profileId: string) {
    return deleteStyleProfile(projectId, profileId)
  }

  static saveAsset(projectId: string, payload: Record<string, unknown>) {
    return saveStyleAsset(projectId, payload)
  }

  static deleteAsset(projectId: string, assetId: string) {
    return deleteStyleAsset(projectId, assetId)
  }

  static templates() {
    return listStyleAssetTemplates()
  }

  static saveTemplate(payload: Record<string, unknown>) {
    return saveStyleAssetTemplate(payload)
  }

  static deleteTemplate(templateId: string) {
    return deleteStyleAssetTemplate(templateId)
  }

  static importTemplate(projectId: string, templateId: string, options?: Record<string, unknown>) {
    return importStyleAssetTemplate(projectId, templateId, options ?? {})
  }

  static setAssetEnabled(projectId: string, assetId: string, enabled: boolean) {
    return setStyleAssetEnabled(projectId, assetId, enabled)
  }
}
