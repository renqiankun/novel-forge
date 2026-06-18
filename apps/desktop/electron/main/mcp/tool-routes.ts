import { desktopMcpToolDefinitions } from './tool-definitions'

export type McpToolEffect = 'read' | 'write' | 'dangerous'

export interface DesktopMcpToolRoute {
  name: string
  effect: McpToolEffect
  apiMethod: string
  summary: string
}

const routeByToolName: Record<string, Omit<DesktopMcpToolRoute, 'name'>> = {
  novel_project_list: {
    effect: 'read',
    apiMethod: 'listProjects',
    summary: 'List projects available to the external AI controller.',
  },
  novel_project_create: {
    effect: 'write',
    apiMethod: 'createProject',
    summary: 'Create a local novel project controlled by the external AI host.',
  },
  novel_project_update: {
    effect: 'write',
    apiMethod: 'updateProject',
    summary: 'Update project title, introduction, chapter count, and planning state.',
  },
  novel_project_canvas_get: {
    effect: 'read',
    apiMethod: 'getProjectCanvas',
    summary: 'Read the visual AI-control canvas graph.',
  },
  novel_outline_node_upsert: {
    effect: 'write',
    apiMethod: 'saveOutlineNode',
    summary: 'Write one outline node and sync chapter plans when needed.',
  },
  novel_outline_batch_upsert: {
    effect: 'write',
    apiMethod: 'saveOutlineBatch',
    summary: 'Write a structured book/volume/chapter outline batch.',
  },
  novel_outline_node_delete: {
    effect: 'write',
    apiMethod: 'deleteOutlineNode',
    summary: 'Delete one outline node.',
  },
  story_context_get: {
    effect: 'read',
    apiMethod: 'exportProjectState',
    summary: 'Read broad story context from the local SQLite workspace.',
  },
  novel_context_pack_get: {
    effect: 'read',
    apiMethod: 'exportProjectState',
    summary: 'Read the project-level context package for planning.',
  },
  novel_ai_task_package_get: {
    effect: 'read',
    apiMethod: 'getAiTaskPackage',
    summary: 'Read one AI task package and writeback policy.',
  },
  novel_ai_workbench_get: {
    effect: 'read',
    apiMethod: 'getAiWorkbench',
    summary: 'Read AI workbench state, resources, queue, writes, and reviews.',
  },
  novel_ai_task_queue_get: {
    effect: 'read',
    apiMethod: 'getAiTaskQueue',
    summary: 'Read ordered AI tasks and the next executable task.',
  },
  novel_ai_task_queue_reorder: {
    effect: 'write',
    apiMethod: 'reorderAiTaskQueue',
    summary: 'Persist task ordering without executing or applying task output.',
  },
  novel_ai_task_create: {
    effect: 'write',
    apiMethod: 'createAiTask',
    summary: 'Create an AI task package from Codex.',
  },
  novel_ai_task_delete: {
    effect: 'write',
    apiMethod: 'deleteAiTask',
    summary: 'Delete an unexecuted AI task package.',
  },
  novel_pending_reviews_get: {
    effect: 'read',
    apiMethod: 'getPendingReviews',
    summary: 'Read human confirmation gates before risky continuation.',
  },
  novel_pending_review_resolve: {
    effect: 'write',
    apiMethod: 'resolvePendingReview',
    summary: 'Resolve one pending confirmation item.',
  },
  novel_chapter_context_pack_get: {
    effect: 'read',
    apiMethod: 'getChapterContextPack',
    summary: 'Read one chapter context package for generation or rewrite.',
  },
  novel_submit_chapter_version: {
    effect: 'write',
    apiMethod: 'saveChapterVersion',
    summary: 'Write an external AI candidate chapter version.',
  },
  novel_save_draft: {
    effect: 'write',
    apiMethod: 'saveDraft',
    summary: 'Save a guarded chapter draft or small manual edit.',
  },
  novel_apply_chapter_version: {
    effect: 'dangerous',
    apiMethod: 'applyChapterVersion',
    summary: 'Finalize a candidate version after snapshotting.',
  },
  novel_submit_candidate_fact: {
    effect: 'write',
    apiMethod: 'submitCandidateFact',
    summary: 'Write extracted facts into the pending confirmation queue.',
  },
  novel_world_fact_upsert: {
    effect: 'write',
    apiMethod: 'saveWorldFact',
    summary: 'Create or update an authoritative world fact.',
  },
  novel_world_fact_delete: {
    effect: 'write',
    apiMethod: 'deleteWorldFact',
    summary: 'Delete one authoritative world fact.',
  },
  novel_character_upsert: {
    effect: 'write',
    apiMethod: 'saveCharacter',
    summary: 'Create or update a character profile.',
  },
  novel_character_delete: {
    effect: 'write',
    apiMethod: 'deleteCharacter',
    summary: 'Delete one character profile.',
  },
  novel_character_relation_graph_get: {
    effect: 'read',
    apiMethod: 'getCharacterRelationGraph',
    summary: 'Read character relation graph data.',
  },
  novel_character_relation_upsert: {
    effect: 'write',
    apiMethod: 'saveCharacterRelation',
    summary: 'Create or update a character relation.',
  },
  novel_character_relation_delete: {
    effect: 'write',
    apiMethod: 'deleteCharacterRelation',
    summary: 'Delete one character relation.',
  },
  novel_local_check_run: {
    effect: 'read',
    apiMethod: 'runLocalChapterCheck',
    summary: 'Run local deterministic checks for risky chapter changes.',
  },
  novel_rewrite_prepare: {
    effect: 'write',
    apiMethod: 'createRewriteTask',
    summary: 'Create a typed rewrite task for external AI.',
  },
  novel_rewrite_mark_complete: {
    effect: 'write',
    apiMethod: 'completeRewriteTask',
    summary: 'Mark a rewrite task complete in the local workflow.',
  },
  novel_style_extract_prepare: {
    effect: 'write',
    apiMethod: 'createAiTask',
    summary: 'Create a style extraction task package.',
  },
  novel_style_library_get: {
    effect: 'read',
    apiMethod: 'getStyleLibrary',
    summary: 'Read project style library.',
  },
  novel_style_profile_upsert: {
    effect: 'write',
    apiMethod: 'saveStyleProfile',
    summary: 'Create or update a project style profile.',
  },
  novel_style_profile_bind: {
    effect: 'write',
    apiMethod: 'bindStyleProfile',
    summary: 'Bind active project style profile.',
  },
  novel_style_profile_delete: {
    effect: 'write',
    apiMethod: 'deleteStyleProfile',
    summary: 'Delete a project style profile.',
  },
  novel_style_asset_submit: {
    effect: 'write',
    apiMethod: 'saveStyleAsset',
    summary: 'Write style assets, good samples, bad patterns, or forbidden items.',
  },
  novel_style_asset_set_enabled: {
    effect: 'write',
    apiMethod: 'setStyleAssetEnabled',
    summary: 'Apply or remove a style asset from writing reference.',
  },
  novel_style_asset_delete: {
    effect: 'write',
    apiMethod: 'deleteStyleAsset',
    summary: 'Remove one project style asset.',
  },
  novel_style_template_list: {
    effect: 'read',
    apiMethod: 'listStyleTemplates',
    summary: 'List global style templates.',
  },
  novel_style_template_upsert: {
    effect: 'write',
    apiMethod: 'saveStyleTemplate',
    summary: 'Create or update a global style template.',
  },
  novel_style_template_delete: {
    effect: 'write',
    apiMethod: 'deleteStyleTemplate',
    summary: 'Delete a global style template.',
  },
  novel_style_template_import: {
    effect: 'write',
    apiMethod: 'importStyleTemplate',
    summary: 'Copy a global style template into the project.',
  },
  novel_style_process_mark_complete: {
    effect: 'write',
    apiMethod: 'completeAiTask',
    summary: 'Mark a style-processing task complete in the local workflow.',
  },
  novel_ai_task_backfill: {
    effect: 'write',
    apiMethod: 'completeAiTask',
    summary: 'Backfill a task result such as version, style asset, or outline plan.',
  },
  novel_long_state_upsert: {
    effect: 'write',
    apiMethod: 'saveLongStateRecord',
    summary: 'Upsert long-form story state ledgers.',
  },
  novel_long_state_get: {
    effect: 'read',
    apiMethod: 'getLongState',
    summary: 'Read long-form story state ledgers.',
  },
  novel_long_state_delete: {
    effect: 'write',
    apiMethod: 'deleteLongStateRecord',
    summary: 'Delete one long-form story state record.',
  },
  novel_snapshot_create: {
    effect: 'write',
    apiMethod: 'createSnapshot',
    summary: 'Create a restorable project snapshot.',
  },
  novel_snapshot_restore: {
    effect: 'dangerous',
    apiMethod: 'restoreSnapshot',
    summary: 'Restore project state from a snapshot.',
  },
  novel_project_state_export: {
    effect: 'read',
    apiMethod: 'exportProjectState',
    summary: 'Export complete project state as JSON.',
  },
  novel_project_state_import: {
    effect: 'dangerous',
    apiMethod: 'importProjectState',
    summary: 'Import a complete project-state JSON package.',
  },
  novel_export_plain_text: {
    effect: 'read',
    apiMethod: 'exportProjectText',
    summary: 'Export the manuscript as plain text.',
  },
}

export const desktopMcpToolRoutes: DesktopMcpToolRoute[] = desktopMcpToolDefinitions.map((tool) => {
  const route = routeByToolName[tool.name]
  if (!route) {
    return {
      name: tool.name,
      effect: 'read',
      apiMethod: 'reserved',
      summary: 'Reserved MCP contract without a local route yet.',
    }
  }
  return { name: tool.name, ...route }
})

export const getDesktopMcpToolRoute = (name: string) => desktopMcpToolRoutes.find((route) => route.name === name)
