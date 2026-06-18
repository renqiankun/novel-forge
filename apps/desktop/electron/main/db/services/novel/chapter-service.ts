import {
  applyChapterVersion,
  completeRewriteTask,
  createChapter,
  createRewriteTask,
  deleteOutlineNode,
  exportProjectText,
  generateDraftCandidate,
  getChapterContextPack,
  listChapterVersions,
  listChapters,
  listLocalCheckResults,
  listProjectOutline,
  runLocalChapterCheck,
  saveChapterVersion,
  saveDraft,
  saveOutlineBatch,
  saveOutlineNode,
} from '../../../novel/novel-api-service'

export class NovelChapterService {
  static list(projectId: string) {
    return listChapters(projectId)
  }

  static create(projectId: string) {
    return createChapter(projectId)
  }

  static saveDraft(projectId: string, chapterId: string, payload: Record<string, unknown>) {
    return saveDraft(projectId, chapterId, payload)
  }

  static listVersions(projectId: string, chapterId: string) {
    return listChapterVersions(projectId, chapterId)
  }

  static saveVersion(projectId: string, chapterId: string, payload: Record<string, unknown>) {
    return saveChapterVersion(projectId, chapterId, payload)
  }

  static generateDraft(projectId: string, chapterId: string) {
    return generateDraftCandidate(projectId, chapterId)
  }

  static applyVersion(projectId: string, chapterId: string, versionId: string) {
    return applyChapterVersion(projectId, chapterId, versionId)
  }

  static runLocalCheck(projectId: string, chapterId: string, payload: Record<string, unknown>) {
    return runLocalChapterCheck(projectId, chapterId, payload)
  }

  static listLocalChecks(projectId: string, chapterId?: string) {
    return listLocalCheckResults(projectId, chapterId)
  }

  static createRewriteTask(projectId: string, chapterId: string, payload: Record<string, unknown>) {
    return createRewriteTask(projectId, chapterId, payload)
  }

  static completeRewriteTask(projectId: string, rewriteTaskId: string, payload?: Record<string, unknown>) {
    return completeRewriteTask(projectId, rewriteTaskId, payload ?? {})
  }

  static contextPack(projectId: string, chapterId: string, mode?: string) {
    return getChapterContextPack(projectId, chapterId, mode)
  }

  static outline(projectId: string, chapterId?: string) {
    return listProjectOutline(projectId, chapterId)
  }

  static saveOutlineNode(projectId: string, payload: Record<string, unknown>) {
    return saveOutlineNode(projectId, payload)
  }

  static saveOutlineBatch(projectId: string, payload: Record<string, unknown>) {
    return saveOutlineBatch(projectId, payload)
  }

  static deleteOutlineNode(projectId: string, nodeId: string) {
    return deleteOutlineNode(projectId, nodeId)
  }

  static exportText(projectId: string) {
    return exportProjectText(projectId)
  }
}
