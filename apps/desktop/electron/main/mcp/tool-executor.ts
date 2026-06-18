import { desktopMcpToolDefinitions } from './tool-definitions'
import { getDesktopMcpToolRoute } from './tool-routes'
import { NovelAiService } from '../db/services/novel/ai-service'
import { NovelCanvasService } from '../db/services/novel/canvas-service'
import { NovelChapterService } from '../db/services/novel/chapter-service'
import { NovelCharacterService } from '../db/services/novel/character-service'
import { NovelProjectService } from '../db/services/novel/project-service'
import { NovelStateService } from '../db/services/novel/state-service'
import { NovelStyleService } from '../db/services/novel/style-service'

type JsonRecord = Record<string, any>

export interface DesktopMcpToolCallPayload {
  name: string
  arguments?: JsonRecord
}

export interface DesktopMcpToolCallResult {
  name: string
  effect: string
  persisted: boolean
  result: unknown
}

const requireString = (args: JsonRecord, key: string) => {
  const value = args[key]
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing required string argument: ${key}`)
  return value.trim()
}

const optionalString = (args: JsonRecord, key: string) => {
  const value = args[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

const optionalBoolean = (args: JsonRecord, key: string) => {
  const value = args[key]
  return typeof value === 'boolean' ? value : undefined
}

const mcpApiMethods: Record<string, (...args: any[]) => unknown | Promise<unknown>> = {
  listProjects: () => NovelProjectService.list(),
  createProject: (payload: JsonRecord) => NovelProjectService.create(payload),
  updateProject: (projectId: string, payload: JsonRecord) => NovelProjectService.update(projectId, payload),
  getProjectCanvas: (projectId: string) => NovelCanvasService.get(projectId),
  exportProjectState: (projectId: string) => NovelStateService.exportProjectState(projectId),
  getAiWorkbench: (projectId: string) => NovelAiService.workbench(projectId),
  getAiTaskPackage: (projectId: string, taskId: string) => NovelAiService.taskPackage(projectId, taskId),
  getAiTaskQueue: (projectId: string) => NovelAiService.queue(projectId),
  reorderAiTaskQueue: (projectId: string, orderedTaskIds: string[]) => NovelAiService.reorderQueue(projectId, orderedTaskIds),
  deleteAiTask: (projectId: string, taskId: string) => NovelAiService.deleteTask(projectId, taskId),
  getPendingReviews: (projectId: string) => NovelAiService.pendingReviews(projectId),
  resolvePendingReview: (projectId: string, reviewId: string, decision: string) => NovelAiService.resolveReview(projectId, reviewId, decision),
  getChapterContextPack: (projectId: string, chapterId: string, mode?: string) => NovelChapterService.contextPack(projectId, chapterId, mode),
  saveChapterVersion: (projectId: string, chapterId: string, payload: JsonRecord) => NovelChapterService.saveVersion(projectId, chapterId, payload),
  saveDraft: (projectId: string, chapterId: string, payload: JsonRecord) => NovelChapterService.saveDraft(projectId, chapterId, payload),
  applyChapterVersion: (projectId: string, chapterId: string, versionId: string) => NovelChapterService.applyVersion(projectId, chapterId, versionId),
  submitCandidateFact: (projectId: string, payload: JsonRecord) => NovelStateService.submitCandidate(projectId, payload),
  runLocalChapterCheck: (projectId: string, chapterId: string, payload: JsonRecord) => NovelChapterService.runLocalCheck(projectId, chapterId, payload),
  createRewriteTask: (projectId: string, chapterId: string, payload: JsonRecord) => NovelChapterService.createRewriteTask(projectId, chapterId, payload),
  completeRewriteTask: (projectId: string, rewriteTaskId: string, payload?: JsonRecord) => NovelChapterService.completeRewriteTask(projectId, rewriteTaskId, payload),
  completeAiTask: (projectId: string, taskId: string, payload?: JsonRecord) => NovelAiService.completeTask(projectId, taskId, payload),
  createAiTask: (projectId: string, payload: JsonRecord) => NovelAiService.createTask(projectId, payload),
  saveOutlineNode: (projectId: string, payload: JsonRecord) => NovelChapterService.saveOutlineNode(projectId, payload),
  saveOutlineBatch: (projectId: string, payload: JsonRecord) => NovelChapterService.saveOutlineBatch(projectId, payload),
  deleteOutlineNode: (projectId: string, nodeId: string) => NovelChapterService.deleteOutlineNode(projectId, nodeId),
  saveWorldFact: (projectId: string, payload: JsonRecord) => NovelCharacterService.saveWorldFact(projectId, payload),
  deleteWorldFact: (projectId: string, factId: string) => NovelCharacterService.deleteWorldFact(projectId, factId),
  saveCharacter: (projectId: string, payload: JsonRecord) => NovelCharacterService.save(projectId, payload),
  deleteCharacter: (projectId: string, characterId: string) => NovelCharacterService.delete(projectId, characterId),
  getCharacterRelationGraph: (projectId: string) => NovelCharacterService.graph(projectId),
  saveCharacterRelation: (projectId: string, payload: JsonRecord) => NovelCharacterService.saveRelation(projectId, payload),
  deleteCharacterRelation: (projectId: string, relationId: string) => NovelCharacterService.deleteRelation(projectId, relationId),
  getStyleLibrary: (projectId: string) => NovelStyleService.library(projectId),
  saveStyleProfile: (projectId: string, payload: JsonRecord) => NovelStyleService.saveProfile(projectId, payload),
  bindStyleProfile: (projectId: string, profileId: string) => NovelStyleService.bindProfile(projectId, profileId),
  deleteStyleProfile: (projectId: string, profileId: string) => NovelStyleService.deleteProfile(projectId, profileId),
  saveStyleAsset: (projectId: string, payload: JsonRecord) => NovelStyleService.saveAsset(projectId, payload),
  deleteStyleAsset: (projectId: string, assetId: string) => NovelStyleService.deleteAsset(projectId, assetId),
  setStyleAssetEnabled: (projectId: string, assetId: string, enabled: boolean) => NovelStyleService.setAssetEnabled(projectId, assetId, enabled),
  listStyleTemplates: () => NovelStyleService.templates(),
  saveStyleTemplate: (payload: JsonRecord) => NovelStyleService.saveTemplate(payload),
  deleteStyleTemplate: (templateId: string) => NovelStyleService.deleteTemplate(templateId),
  importStyleTemplate: (projectId: string, templateId: string, options?: JsonRecord) => NovelStyleService.importTemplate(projectId, templateId, options),
  getLongState: (projectId: string) => NovelStateService.longState(projectId),
  saveLongStateRecord: (projectId: string, kind: string, payload: JsonRecord) => NovelStateService.saveLongStateRecord(projectId, kind, payload),
  deleteLongStateRecord: (projectId: string, kind: string, recordId: string) => NovelStateService.deleteLongStateRecord(projectId, kind, recordId),
  createSnapshot: (projectId: string, payload?: JsonRecord) => NovelStateService.createSnapshot(projectId, payload),
  restoreSnapshot: (projectId: string, snapshotId: string) => NovelStateService.restoreSnapshot(projectId, snapshotId),
  importProjectState: (raw: string) => NovelStateService.importProjectState(raw),
  exportProjectText: (projectId: string) => NovelChapterService.exportText(projectId),
}

const apiCall = (method: string, args: unknown[]) => {
  const handler = mcpApiMethods[method]
  if (!handler) throw new Error(`Unsupported MCP API method: ${method}`)
  return handler(...args)
}

const toolArgumentsToApiArgs = (name: string, args: JsonRecord): unknown[] => {
  switch (name) {
    case 'novel_project_list':
    case 'novel_style_template_list':
      return []
    case 'novel_project_create':
      return [
        {
          title: requireString(args, 'title'),
          description: optionalString(args, 'description'),
          genre: optionalString(args, 'genre'),
          targetChapters: args.targetChapters,
        },
      ]
    case 'novel_project_update':
      return [
        requireString(args, 'projectId'),
        {
          title: optionalString(args, 'title'),
          description: optionalString(args, 'description'),
          genre: optionalString(args, 'genre'),
          status: optionalString(args, 'status'),
          targetChapters: args.targetChapters,
          currentChapter: args.currentChapter,
        },
      ]
    case 'novel_outline_node_upsert':
      return [
        requireString(args, 'projectId'),
        {
          id: optionalString(args, 'id'),
          kind: requireString(args, 'kind'),
          title: requireString(args, 'title'),
          parentId: optionalString(args, 'parentId'),
          summary: optionalString(args, 'summary'),
          goal: optionalString(args, 'goal'),
          conflict: optionalString(args, 'conflict'),
          payoff: optionalString(args, 'payoff'),
          focus: optionalString(args, 'focus'),
          plotLine: optionalString(args, 'plotLine'),
          chapterFunction: optionalString(args, 'chapterFunction'),
          actorGoal: optionalString(args, 'actorGoal'),
          obstacle: optionalString(args, 'obstacle'),
          outcome: optionalString(args, 'outcome'),
          mainlineImpact: optionalString(args, 'mainlineImpact'),
          status: optionalString(args, 'status'),
          chapterId: optionalString(args, 'chapterId'),
          chapterIndex: args.chapterIndex,
          order: args.order,
        },
      ]
    case 'novel_outline_batch_upsert':
      return [
        requireString(args, 'projectId'),
        {
          project: args.project && typeof args.project === 'object' ? args.project : undefined,
          nodes: Array.isArray(args.nodes) ? args.nodes : [],
        },
      ]
    case 'novel_outline_node_delete':
      return [requireString(args, 'projectId'), requireString(args, 'nodeId')]
    case 'novel_project_canvas_get':
    case 'story_context_get':
    case 'novel_context_pack_get':
    case 'novel_ai_workbench_get':
    case 'novel_ai_task_queue_get':
    case 'novel_pending_reviews_get':
    case 'novel_character_relation_graph_get':
    case 'novel_style_library_get':
    case 'novel_long_state_get':
    case 'novel_project_state_export':
    case 'novel_export_plain_text':
      return [requireString(args, 'projectId')]
    case 'novel_ai_task_package_get':
      return [requireString(args, 'projectId'), requireString(args, 'taskId')]
    case 'novel_ai_task_queue_reorder':
      return [requireString(args, 'projectId'), Array.isArray(args.orderedTaskIds) ? args.orderedTaskIds : []]
    case 'novel_ai_task_create':
      return [
        requireString(args, 'projectId'),
        {
          title: optionalString(args, 'title'),
          target: requireString(args, 'target'),
          chapterId: optionalString(args, 'chapterId'),
          rewriteTaskId: optionalString(args, 'rewriteTaskId'),
          instruction: optionalString(args, 'instruction'),
          contextMode: optionalString(args, 'contextMode') ?? 'full',
          reviewMode: optionalString(args, 'reviewMode') ?? 'balanced',
          factStrategy: optionalString(args, 'factStrategy') ?? 'balanced',
          checkpointEvery: args.checkpointEvery,
          autoPause: optionalString(args, 'autoPause') ?? 'high_risk',
        },
      ]
    case 'novel_ai_task_delete':
      return [requireString(args, 'projectId'), requireString(args, 'taskId')]
    case 'novel_pending_review_resolve':
      return [requireString(args, 'projectId'), requireString(args, 'reviewId'), requireString(args, 'decision')]
    case 'novel_chapter_context_pack_get':
      return [requireString(args, 'projectId'), requireString(args, 'chapterId'), optionalString(args, 'mode') ?? 'full']
    case 'novel_submit_chapter_version':
      return [
        requireString(args, 'projectId'),
        requireString(args, 'chapterId'),
        {
          title: optionalString(args, 'title'),
          body: requireString(args, 'body'),
          summary: optionalString(args, 'summary'),
          source: optionalString(args, 'source') ?? '外部 AI MCP',
          kind: optionalString(args, 'kind') ?? 'external',
        },
      ]
    case 'novel_save_draft':
      return [
        requireString(args, 'projectId'),
        requireString(args, 'chapterId'),
        {
          title: optionalString(args, 'title'),
          summary: optionalString(args, 'summary'),
          draft: requireString(args, 'draft'),
        },
      ]
    case 'novel_apply_chapter_version':
      return [requireString(args, 'projectId'), requireString(args, 'chapterId'), requireString(args, 'versionId')]
    case 'novel_submit_candidate_fact':
      return [
        requireString(args, 'projectId'),
        {
          chapterId: optionalString(args, 'chapterId'),
          title: requireString(args, 'title'),
          kind: requireString(args, 'kind'),
          body: requireString(args, 'body'),
          risk: args.risk ?? 'medium',
          source: requireString(args, 'source'),
        },
      ]
    case 'novel_world_fact_upsert':
      return [
        requireString(args, 'projectId'),
        {
          id: optionalString(args, 'id'),
          kind: optionalString(args, 'kind') ?? 'fact',
          title: requireString(args, 'title'),
          body: requireString(args, 'body'),
          source: optionalString(args, 'source') ?? 'codex',
          locked: optionalBoolean(args, 'locked') ?? false,
        },
      ]
    case 'novel_world_fact_delete':
      return [requireString(args, 'projectId'), requireString(args, 'factId')]
    case 'novel_character_upsert':
      return [
        requireString(args, 'projectId'),
        {
          id: optionalString(args, 'id'),
          name: requireString(args, 'name'),
          role: optionalString(args, 'role'),
          goal: optionalString(args, 'goal'),
          status: optionalString(args, 'status'),
          pressure: args.pressure,
          future: optionalString(args, 'future'),
          notes: optionalString(args, 'notes'),
        },
      ]
    case 'novel_character_delete':
      return [requireString(args, 'projectId'), requireString(args, 'characterId')]
    case 'novel_character_relation_upsert':
      return [
        requireString(args, 'projectId'),
        {
          id: optionalString(args, 'id'),
          title: requireString(args, 'title'),
          kind: optionalString(args, 'kind') ?? 'relation',
          sourceCharacterId: optionalString(args, 'sourceCharacterId'),
          targetCharacterId: optionalString(args, 'targetCharacterId'),
          current: optionalString(args, 'current'),
          future: optionalString(args, 'future'),
          tension: args.tension,
          notes: optionalString(args, 'notes'),
        },
      ]
    case 'novel_character_relation_delete':
      return [requireString(args, 'projectId'), requireString(args, 'relationId')]
    case 'novel_local_check_run':
      return [requireString(args, 'projectId'), requireString(args, 'chapterId'), { draft: requireString(args, 'draft') }]
    case 'novel_rewrite_prepare':
      return [
        requireString(args, 'projectId'),
        requireString(args, 'chapterId'),
        {
          scope: args.scope,
          mode: args.mode,
          level: args.level,
          reason: requireString(args, 'reason'),
        },
      ]
    case 'novel_rewrite_mark_complete':
      return [requireString(args, 'projectId'), requireString(args, 'rewriteTaskId'), { versionId: requireString(args, 'versionId') }]
    case 'novel_style_extract_prepare':
      return [
        requireString(args, 'projectId'),
        {
          title: '外部 AI 风格提取任务',
          target: 'style_extract',
          contextMode: 'full',
          reviewMode: 'balanced',
          factStrategy: 'balanced',
          checkpointEvery: 1,
          autoPause: 'high_risk',
          chapterId: optionalString(args, 'chapterId'),
          instruction: optionalString(args, 'scope') ?? '提取当前范围风格资产。',
        },
      ]
    case 'novel_style_profile_upsert':
      return [
        requireString(args, 'projectId'),
        {
          id: optionalString(args, 'id'),
          title: requireString(args, 'title'),
          description: optionalString(args, 'description'),
          tone: optionalString(args, 'tone'),
          source: optionalString(args, 'source') ?? 'codex',
          active: optionalBoolean(args, 'active') ?? false,
        },
      ]
    case 'novel_style_profile_bind':
    case 'novel_style_profile_delete':
      return [requireString(args, 'projectId'), requireString(args, 'profileId')]
    case 'novel_style_asset_submit':
      return [
        requireString(args, 'projectId'),
        {
          kind: requireString(args, 'kind'),
          title: requireString(args, 'title'),
          body: requireString(args, 'body'),
          scope: optionalString(args, 'scope') ?? '全书',
          source: 'codex',
          enabled: true,
        },
      ]
    case 'novel_style_asset_set_enabled':
      return [requireString(args, 'projectId'), requireString(args, 'assetId'), optionalBoolean(args, 'enabled') ?? true]
    case 'novel_style_asset_delete':
      return [requireString(args, 'projectId'), requireString(args, 'assetId')]
    case 'novel_style_template_upsert':
      return [
        {
          id: optionalString(args, 'id'),
          kind: requireString(args, 'kind'),
          title: requireString(args, 'title'),
          body: requireString(args, 'body'),
          scope: optionalString(args, 'scope'),
          tags: Array.isArray(args.tags) ? args.tags : [],
          source: optionalString(args, 'source') ?? 'codex',
        },
      ]
    case 'novel_style_template_delete':
      return [requireString(args, 'templateId')]
    case 'novel_style_template_import':
      return [
        requireString(args, 'projectId'),
        requireString(args, 'templateId'),
        { enabled: optionalBoolean(args, 'enabled') ?? true },
      ]
    case 'novel_style_process_mark_complete':
    case 'novel_ai_task_backfill':
      return [requireString(args, 'projectId'), requireString(args, 'taskId'), args.payload && typeof args.payload === 'object' ? args.payload : {}]
    case 'novel_long_state_upsert':
      return [requireString(args, 'projectId'), requireString(args, 'kind'), args.payload && typeof args.payload === 'object' ? args.payload : {}]
    case 'novel_long_state_delete':
      return [requireString(args, 'projectId'), requireString(args, 'kind'), requireString(args, 'recordId')]
    case 'novel_snapshot_create':
      return [
        requireString(args, 'projectId'),
        {
          title: optionalString(args, 'title'),
          reason: optionalString(args, 'reason'),
          chapterId: optionalString(args, 'chapterId'),
          versionId: optionalString(args, 'versionId'),
        },
      ]
    case 'novel_snapshot_restore':
      return [requireString(args, 'projectId'), requireString(args, 'snapshotId')]
    case 'novel_project_state_import':
      return [requireString(args, 'stateJson')]
    default:
      throw new Error(`Unsupported MCP tool: ${name}`)
  }
}

const maybePreBackfillPayload = async (name: string, args: JsonRecord) => {
  if (name !== 'novel_ai_task_backfill') return undefined
  const projectId = requireString(args, 'projectId')
  const payload = args.payload && typeof args.payload === 'object' ? (args.payload as JsonRecord) : {}
  if (args.resultKind === 'chapter_version' && payload.chapterId && payload.body) {
    return apiCall('saveChapterVersion', [
      projectId,
      String(payload.chapterId),
      {
        title: optionalString(payload, 'title'),
        body: String(payload.body),
        summary: optionalString(payload, 'summary'),
        source: optionalString(payload, 'source') ?? '外部 AI MCP',
        kind: optionalString(payload, 'kind') ?? 'external',
      },
    ])
  }
  if (args.resultKind === 'style_asset' && payload.kind && payload.title && payload.body) {
    return apiCall('saveStyleAsset', [
      projectId,
      {
        ...payload,
        source: payload.source ?? 'codex',
        enabled: payload.enabled ?? true,
      },
    ])
  }
  if (args.resultKind === 'ledger' && payload.kind && payload.payload) {
    return apiCall('saveLongStateRecord', [projectId, String(payload.kind), payload.payload])
  }
  if (args.resultKind === 'outline' && Array.isArray(payload.nodes)) {
    return apiCall('saveOutlineBatch', [projectId, payload])
  }
  return undefined
}

export const executeDesktopMcpTool = async ({ name, arguments: args = {} }: DesktopMcpToolCallPayload): Promise<DesktopMcpToolCallResult> => {
  if (!desktopMcpToolDefinitions.some((tool) => tool.name === name)) throw new Error(`Unknown MCP tool: ${name}`)
  const route = getDesktopMcpToolRoute(name)
  if (!route || route.apiMethod === 'reserved') throw new Error(`MCP tool has no local route yet: ${name}`)

  const preBackfill = await maybePreBackfillPayload(name, args)
  const result = await apiCall(route.apiMethod, toolArgumentsToApiArgs(name, args))
  return {
    name,
    effect: route.effect,
    persisted: route.effect !== 'read',
    result: preBackfill ? { preBackfill, result } : result,
  }
}
