import { getDesktopMcpToolDisplayInfo } from './tool-metadata'

export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

const rawDesktopMcpToolDefinitions: McpToolDefinition[] = [
  {
    name: 'novel_project_list',
    description: 'List local novel projects visible to the current desktop workspace.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'novel_project_create',
    description: 'Create a local novel project from an external AI host before writing outline, volumes, chapters, or manuscript content.',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        genre: { type: 'string' },
        targetChapters: { type: 'number' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_project_update',
    description: 'Update project basics such as title, introduction, genre, target chapter count, current chapter, and planning status.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        genre: { type: 'string' },
        status: { type: 'string' },
        targetChapters: { type: 'number' },
        currentChapter: { type: 'number' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_project_canvas_get',
    description: 'Read the project canvas nodes and edges used by the desktop AI control workbench.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_outline_node_upsert',
    description: 'Create or update one book, volume, arc, or chapter outline node. Chapter nodes can also create or update the chapter plan.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'kind', 'title'],
      properties: {
        projectId: { type: 'string' },
        id: { type: 'string' },
        kind: { enum: ['book', 'volume', 'arc', 'chapter', 'scene'] },
        title: { type: 'string' },
        parentId: { type: 'string' },
        summary: { type: 'string' },
        goal: { type: 'string' },
        conflict: { type: 'string' },
        payoff: { type: 'string' },
        focus: { type: 'string' },
        plotLine: { type: 'string' },
        chapterFunction: { type: 'string' },
        actorGoal: { type: 'string' },
        obstacle: { type: 'string' },
        outcome: { type: 'string' },
        mainlineImpact: { type: 'string' },
        status: { type: 'string' },
        chapterId: { type: 'string' },
        chapterIndex: { type: 'number' },
        order: { type: 'number' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_outline_batch_upsert',
    description: 'Write a batch of project outline nodes and optional project metadata from an external AI planning conversation.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'nodes'],
      properties: {
        projectId: { type: 'string' },
        project: { type: 'object' },
        nodes: {
          type: 'array',
          items: { type: 'object' },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_outline_node_delete',
    description: 'Delete one outline node from the local project plan.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'nodeId'],
      properties: {
        projectId: { type: 'string' },
        nodeId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'story_context_get',
    description: 'Read project-scoped story context for an external AI host.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_context_pack_get',
    description: 'Read the project-level context pack for external AI planning, generation, and writeback.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
        mode: { enum: ['lite', 'full', 'deep'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_task_package_get',
    description: 'Read an AI task package with resources, policy, context budget, and expected writeback targets.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'taskId'],
      properties: {
        projectId: { type: 'string' },
        taskId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_workbench_get',
    description: 'Read the AI control workbench summary, task queue, resources, recent writes, and pending reviews.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_task_queue_get',
    description: 'Read ordered AI task packages, the next executable task, and blocking reasons.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_task_queue_reorder',
    description: 'Persist a new AI task package queue order without executing or applying any task output.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'orderedTaskIds'],
      properties: {
        projectId: { type: 'string' },
        orderedTaskIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_task_create',
    description: 'Create an ordered AI task package for external Codex control, such as next chapter, 10/50/100 chapter planning, style work, or custom work.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'target'],
      properties: {
        projectId: { type: 'string' },
        title: { type: 'string' },
        target: {
          enum: [
            'next_chapter',
            'next_10_chapters',
            'next_50_chapters',
            'next_100_chapters',
            'rewrite_chapter',
            'style_adjustment',
            'style_extract',
            'style_process',
          ],
        },
        chapterId: { type: 'string' },
        rewriteTaskId: { type: 'string' },
        instruction: { type: 'string' },
        contextMode: { enum: ['lite', 'full', 'deep'] },
        reviewMode: { enum: ['token_saver', 'balanced', 'strict'] },
        factStrategy: { enum: ['optimistic', 'balanced', 'conservative'] },
        checkpointEvery: { type: 'number' },
        autoPause: { enum: ['none', 'high_risk', 'checkpoint', 'any_issue'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_task_delete',
    description: 'Delete an unexecuted AI task package from the local queue.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'taskId'],
      properties: {
        projectId: { type: 'string' },
        taskId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_pending_reviews_get',
    description: 'Read pending human confirmation items before external AI continues or applies high-risk writeback.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_pending_review_resolve',
    description: 'Resolve one pending confirmation item after the user or external AI has made an explicit decision.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'reviewId', 'decision'],
      properties: {
        projectId: { type: 'string' },
        reviewId: { type: 'string' },
        decision: { enum: ['approve', 'reject', 'resolve'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_chapter_context_pack_get',
    description: 'Read one chapter context pack for external AI controlled generation.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'chapterId'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        mode: { enum: ['lite', 'full', 'deep'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_submit_chapter_version',
    description: 'Submit an external AI generated candidate chapter version without replacing the current final text.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'chapterId', 'body'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        summary: { type: 'string' },
        source: { type: 'string' },
        kind: { enum: ['external', 'rewrite', 'generated', 'manual'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_save_draft',
    description: 'Save a manually edited chapter draft through the same local-check boundary used by the desktop UI.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'chapterId', 'draft'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        title: { type: 'string' },
        summary: { type: 'string' },
        draft: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_apply_chapter_version',
    description: 'Apply a candidate chapter version as the current finalized text after snapshotting the previous state.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'chapterId', 'versionId'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        versionId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_submit_candidate_fact',
    description: 'Submit a candidate fact extracted from generated text for later settling into the world fact ledger.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'title', 'kind', 'body', 'risk', 'source'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        title: { type: 'string' },
        kind: { type: 'string' },
        body: { type: 'string' },
        risk: { enum: ['low', 'medium', 'high'] },
        source: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_world_fact_upsert',
    description: 'Create or update an authoritative world fact that external AI should treat as project context.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'title', 'body'],
      properties: {
        projectId: { type: 'string' },
        id: { type: 'string' },
        kind: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        source: { type: 'string' },
        locked: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_world_fact_delete',
    description: 'Delete one project world fact.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'factId'],
      properties: {
        projectId: { type: 'string' },
        factId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_character_upsert',
    description: 'Create or update a character profile including attributes, current state, and future progress notes.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'name'],
      properties: {
        projectId: { type: 'string' },
        id: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        goal: { type: 'string' },
        status: { type: 'string' },
        pressure: { type: 'number' },
        future: { type: 'string' },
        notes: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_character_delete',
    description: 'Delete one character profile from the project.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'characterId'],
      properties: {
        projectId: { type: 'string' },
        characterId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_character_relation_graph_get',
    description: 'Read character attributes, relations, pressure, dialogue, and future progress graph data.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_character_relation_upsert',
    description: 'Create or update a relation between characters, including current relation and future progress notes.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'title'],
      properties: {
        projectId: { type: 'string' },
        id: { type: 'string' },
        title: { type: 'string' },
        kind: { type: 'string' },
        sourceCharacterId: { type: 'string' },
        targetCharacterId: { type: 'string' },
        current: { type: 'string' },
        future: { type: 'string' },
        tension: { type: 'number' },
        notes: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_character_relation_delete',
    description: 'Delete one character relation from the project.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'relationId'],
      properties: {
        projectId: { type: 'string' },
        relationId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_local_check_run',
    description: 'Run local, non-AI chapter checks for boundary changes, risky keywords, pressure shifts, and plot debt signals.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'chapterId', 'draft'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        draft: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_rewrite_prepare',
    description: 'Create a rewrite task with scope, mode, level, and user guidance for the external AI host.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'chapterId', 'scope', 'mode', 'level', 'reason'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        scope: { enum: ['paragraph', 'scene', 'chapter', 'dialogue'] },
        mode: { enum: ['style_voice', 'dialogue', 'scene_expression', 'chapter_bridge', 'plot_impact'] },
        level: { enum: ['L0', 'L1', 'L2', 'L3', 'L4'] },
        reason: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_rewrite_mark_complete',
    description: 'Mark a rewrite task as externally completed after a candidate version has been submitted.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'rewriteTaskId', 'versionId'],
      properties: {
        projectId: { type: 'string' },
        rewriteTaskId: { type: 'string' },
        versionId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_extract_prepare',
    description: 'Prepare a style extraction task for external AI using current chapter text, dialogue profiles, and style assets.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
        chapterId: { type: 'string' },
        scope: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_library_get',
    description: 'Read project style profiles, applied style assets, and the active project style profile.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_profile_upsert',
    description: 'Create or update a project style profile that can be bound as the active whole-book style.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'title'],
      properties: {
        projectId: { type: 'string' },
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        tone: { type: 'string' },
        source: { type: 'string' },
        active: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_profile_bind',
    description: 'Bind one project style profile as the active whole-book style.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'profileId'],
      properties: {
        projectId: { type: 'string' },
        profileId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_profile_delete',
    description: 'Delete one non-active project style profile.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'profileId'],
      properties: {
        projectId: { type: 'string' },
        profileId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_asset_submit',
    description: 'Write style assets, voice samples, bad patterns, or forbidden items back into the project style library.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'kind', 'title', 'body'],
      properties: {
        projectId: { type: 'string' },
        kind: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        scope: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_asset_set_enabled',
    description: 'Apply or remove one project style asset from the Context Pack writing reference pool.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'assetId', 'enabled'],
      properties: {
        projectId: { type: 'string' },
        assetId: { type: 'string' },
        enabled: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_asset_delete',
    description: 'Remove one style asset from the current project without deleting its global template.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'assetId'],
      properties: {
        projectId: { type: 'string' },
        assetId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_template_list',
    description: 'List global style asset templates that can be copied into a project asset pool.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_template_upsert',
    description: 'Create or update a global style asset template.',
    inputSchema: {
      type: 'object',
      required: ['kind', 'title', 'body'],
      properties: {
        id: { type: 'string' },
        kind: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        scope: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        source: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_template_delete',
    description: 'Delete one global style asset template.',
    inputSchema: {
      type: 'object',
      required: ['templateId'],
      properties: {
        templateId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_template_import',
    description: 'Copy one global style template into a project asset pool, optionally applying it immediately.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'templateId'],
      properties: {
        projectId: { type: 'string' },
        templateId: { type: 'string' },
        enabled: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_style_process_mark_complete',
    description: 'Mark a style processing task as completed after bad patterns, forbidden items, or samples are written back.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'taskId'],
      properties: {
        projectId: { type: 'string' },
        taskId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_ai_task_backfill',
    description: 'Backfill a recorded AI task with local or external results such as chapter versions, style assets, or long-range plans.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'taskId'],
      properties: {
        projectId: { type: 'string' },
        taskId: { type: 'string' },
        resultKind: { enum: ['chapter_version', 'style_asset', 'outline', 'ledger'] },
        payload: { type: 'object' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_long_state_upsert',
    description: 'Upsert long-form story ledgers such as pressure records, breakpoints, plot debts, timeline, and message delay.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'kind', 'payload'],
      properties: {
        projectId: { type: 'string' },
        kind: { enum: ['thread', 'foreshadow', 'cost', 'debt', 'timeline', 'message', 'pressure', 'dialogueProfile'] },
        payload: { type: 'object' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_long_state_get',
    description: 'Read long-form story ledgers including pressure, breakpoints, debts, foreshadowing, timeline, messages, and dialogue profiles.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_long_state_delete',
    description: 'Delete one long-form story ledger record such as a pressure record, plot debt, timeline event, or foreshadowing item.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'kind', 'recordId'],
      properties: {
        projectId: { type: 'string' },
        kind: { enum: ['thread', 'foreshadow', 'cost', 'debt', 'timeline', 'message', 'pressure', 'dialogueProfile'] },
        recordId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_snapshot_create',
    description: 'Create a restorable project snapshot before high-risk writeback or finalization.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
        title: { type: 'string' },
        reason: { type: 'string' },
        chapterId: { type: 'string' },
        versionId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_snapshot_restore',
    description: 'Restore a project from a previously captured snapshot.',
    inputSchema: {
      type: 'object',
      required: ['projectId', 'snapshotId'],
      properties: {
        projectId: { type: 'string' },
        snapshotId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_project_state_export',
    description: 'Export a complete project-state JSON package for backup, debugging, or external AI inspection.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_project_state_import',
    description: 'Import a project-state JSON package into the local SQLite workspace.',
    inputSchema: {
      type: 'object',
      required: ['stateJson'],
      properties: {
        stateJson: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'novel_export_plain_text',
    description: 'Export the current novel manuscript as plain text for reading, review, or external diffing.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
]

export const desktopMcpToolDefinitions: McpToolDefinition[] = rawDesktopMcpToolDefinitions.map((tool) => ({
  ...tool,
  description: getDesktopMcpToolDisplayInfo(tool.name)?.description ?? tool.description,
}))
