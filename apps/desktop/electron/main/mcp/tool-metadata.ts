export interface DesktopMcpToolDisplayInfo {
  label: string
  description: string
  category: string
}

export const desktopMcpToolDisplayInfo: Record<string, DesktopMcpToolDisplayInfo> = {
  novel_project_list: {
    label: '读取小说项目列表',
    description: '列出本地所有小说项目，供 Codex 选择要操作的项目。',
    category: '项目',
  },
  novel_project_create: {
    label: '创建小说项目',
    description: '由 Codex 创建新的本地小说项目，并写入题材、简介和目标章节数。',
    category: '项目',
  },
  novel_project_update: {
    label: '更新小说项目',
    description: '更新小说名称、简介、题材、目标章节数、当前章节和规划状态。',
    category: '项目',
  },
  novel_project_canvas_get: {
    label: '读取项目画布',
    description: '读取项目画布上的卷、章节、任务、版本和风险节点，供 Codex 判断当前状态。',
    category: '项目',
  },
  novel_outline_node_upsert: {
    label: '写入单个大纲节点',
    description: '创建或更新全书、卷、故事线、章节或场景节点；章节节点可带章节焦点、剧情线、本章功能和主线影响。',
    category: '大纲',
  },
  novel_outline_batch_upsert: {
    label: '批量写入大纲',
    description: '一次写入全书、卷、故事线和章节规划，适合 Codex 创建新书或规划后续 10/50/100 章。',
    category: '大纲',
  },
  novel_outline_node_delete: {
    label: '删除大纲节点',
    description: '删除一个尚不需要的大纲、卷、章节或故事线节点。',
    category: '大纲',
  },
  story_context_get: {
    label: '读取完整故事上下文',
    description: '读取项目级故事上下文，包含项目、章节、大纲、角色、风格、事实和长篇状态。',
    category: '上下文',
  },
  novel_context_pack_get: {
    label: '读取项目参考包',
    description: '读取项目级 Context Pack，用于规划、扩章、风格处理或项目级回写。',
    category: '上下文',
  },
  novel_ai_task_package_get: {
    label: '读取 AI 任务包',
    description: '读取一个任务包的目标、上下文预算、需要读取的资源、回填要求和确认策略。',
    category: '任务',
  },
  novel_ai_workbench_get: {
    label: '读取 AI 工作台',
    description: '读取任务队列、可读资源、最近回填、高影响确认和项目统计。',
    category: '任务',
  },
  novel_ai_task_queue_get: {
    label: '读取任务队列',
    description: '读取 Codex 待执行任务列表、排序、下一项任务和阻塞原因。',
    category: '任务',
  },
  novel_ai_task_queue_reorder: {
    label: '调整任务顺序',
    description: '调整未执行任务包的顺序，不执行任务，也不会自动应用任何结果。',
    category: '任务',
  },
  novel_ai_task_create: {
    label: '创建 AI 任务',
    description: '创建下一章、下 10/50/100 章、重写、风格提取或自定义 Codex 任务。',
    category: '任务',
  },
  novel_ai_task_delete: {
    label: '删除未执行任务',
    description: '删除尚未执行或尚未完成的 AI 任务包。',
    category: '任务',
  },
  novel_pending_reviews_get: {
    label: '读取待确认事项',
    description: '读取需要人工确认的高影响事项，例如定版、锁定事实、角色命运或高风险事实。',
    category: '确认',
  },
  novel_pending_review_resolve: {
    label: '处理确认事项',
    description: '在用户明确决定后，将一个待确认事项标记为通过、拒绝或已处理。',
    category: '确认',
  },
  novel_chapter_context_pack_get: {
    label: '读取章节参考包',
    description: '读取指定章节写作或重写所需的正文、版本、章节大纲、角色、风格、事实和长篇状态。',
    category: '章节',
  },
  novel_submit_chapter_version: {
    label: '提交候选正文版本',
    description: '提交 Codex 生成或重写的章节候选版本，只进入版本池，不直接覆盖定稿。',
    category: '章节',
  },
  novel_save_draft: {
    label: '保存章节草稿',
    description: '保存章节草稿或微修后的正文，走本地检查边界。',
    category: '章节',
  },
  novel_apply_chapter_version: {
    label: '应用候选版本为定稿',
    description: '把候选版本替换为当前正文；这是高影响操作，通常需要用户确认。',
    category: '章节',
  },
  novel_submit_candidate_fact: {
    label: '提交候选事实',
    description: '把正文中出现的新事实、设定或关系变化提交为候选事实，等待沉淀或确认。',
    category: '事实',
  },
  novel_world_fact_upsert: {
    label: '写入世界事实',
    description: '创建或更新权威世界事实，例如设定规则、地点、势力、物件、能力和术语。',
    category: '事实',
  },
  novel_world_fact_delete: {
    label: '删除世界事实',
    description: '删除一个项目内世界事实；锁定事实删除前应先确认。',
    category: '事实',
  },
  novel_character_upsert: {
    label: '写入角色档案',
    description: '创建或更新角色属性、目标、当前状态、压力值、未来进展和备注。',
    category: '角色',
  },
  novel_character_delete: {
    label: '删除角色档案',
    description: '删除一个角色档案；主要角色删除前应保留人工确认。',
    category: '角色',
  },
  novel_character_relation_graph_get: {
    label: '读取角色关系图',
    description: '读取角色属性、关系、压力、对白语气和未来进展，用于避免角色降智和关系断裂。',
    category: '角色',
  },
  novel_character_relation_upsert: {
    label: '写入角色关系',
    description: '创建或更新角色之间的当前关系、未来变化、张力和备注。',
    category: '角色',
  },
  novel_character_relation_delete: {
    label: '删除角色关系',
    description: '删除一个角色关系记录。',
    category: '角色',
  },
  novel_local_check_run: {
    label: '运行本地章节检查',
    description: '运行非 AI 的本地检查，发现空正文、过短正文、风险词、压力变化和剧情债务信号。',
    category: '检查',
  },
  novel_rewrite_prepare: {
    label: '准备章节重写',
    description: '创建带范围、模式、等级和原因的重写任务，例如风格重写、对白重写或剧情影响重写。',
    category: '重写',
  },
  novel_rewrite_mark_complete: {
    label: '标记重写完成',
    description: '在候选重写版本提交后，把对应重写任务标记为完成并关联版本。',
    category: '重写',
  },
  novel_style_extract_prepare: {
    label: '准备风格提取',
    description: '创建风格提取任务，让 Codex 从正文、对白和样本中提炼可复用风格资产。',
    category: '风格',
  },
  novel_style_library_get: {
    label: '读取风格资产库',
    description: '读取项目风格方案、已应用风格资产、全局模板和当前生效的写作风格。',
    category: '风格',
  },
  novel_style_profile_upsert: {
    label: '写入风格方案',
    description: '创建或更新项目风格方案，可作为整书当前风格。',
    category: '风格',
  },
  novel_style_profile_bind: {
    label: '绑定当前风格方案',
    description: '把一个项目风格方案设为当前整书写作风格。',
    category: '风格',
  },
  novel_style_profile_delete: {
    label: '删除风格方案',
    description: '删除一个非当前使用的项目风格方案。',
    category: '风格',
  },
  novel_style_asset_submit: {
    label: '提交风格资产',
    description: '写入风格规则、好段落样本、坏模式、禁止项或角色语气约束。',
    category: '风格',
  },
  novel_style_asset_set_enabled: {
    label: '应用或停用风格资产',
    description: '控制一个风格资产是否进入写作参考池。',
    category: '风格',
  },
  novel_style_asset_delete: {
    label: '删除项目风格资产',
    description: '从当前项目中移除一个风格资产，不影响全局模板。',
    category: '风格',
  },
  novel_style_template_list: {
    label: '读取全局风格模板',
    description: '读取全局风格资产模板，供项目选择引入。',
    category: '风格模板',
  },
  novel_style_template_upsert: {
    label: '写入全局风格模板',
    description: '创建或更新全局风格资产模板。',
    category: '风格模板',
  },
  novel_style_template_delete: {
    label: '删除全局风格模板',
    description: '删除一个全局风格模板。',
    category: '风格模板',
  },
  novel_style_template_import: {
    label: '引入风格模板到项目',
    description: '把一个全局风格模板复制到当前项目资产池，并可选择立即应用。',
    category: '风格模板',
  },
  novel_style_process_mark_complete: {
    label: '标记风格任务完成',
    description: '在风格资产、坏模式或样本写回后，将风格处理任务标记为完成。',
    category: '风格',
  },
  novel_ai_task_backfill: {
    label: '回填 AI 任务结果',
    description: '把外部 AI 的章节版本、风格资产、大纲计划或长篇状态结果回填到任务记录。',
    category: '任务',
  },
  novel_long_state_upsert: {
    label: '写入长篇状态',
    description: '写入压力、破声点、伏笔、代价、剧情债务、时间线、消息延迟或对白档案。',
    category: '长篇状态',
  },
  novel_long_state_get: {
    label: '读取长篇状态',
    description: '读取压力、破声点、伏笔、代价、剧情债务、时间线、消息延迟和对白档案。',
    category: '长篇状态',
  },
  novel_long_state_delete: {
    label: '删除长篇状态',
    description: '删除一个过期的长篇状态记录，例如已回收伏笔或已完成剧情债务。',
    category: '长篇状态',
  },
  novel_snapshot_create: {
    label: '创建快照',
    description: '在高风险回写、版本应用或大范围状态调整前创建可恢复快照。',
    category: '快照',
  },
  novel_snapshot_restore: {
    label: '恢复快照',
    description: '把项目恢复到指定快照；这是高影响操作。',
    category: '快照',
  },
  novel_project_state_export: {
    label: '导出项目状态',
    description: '导出完整项目状态 JSON，供调试、备份或外部 AI 检查。',
    category: '项目',
  },
  novel_project_state_import: {
    label: '导入项目状态',
    description: '导入完整项目状态 JSON；这是高影响操作，当前不作为主流程。',
    category: '项目',
  },
  novel_export_plain_text: {
    label: '导出纯文本正文',
    description: '导出当前小说正文纯文本，供阅读、审阅或外部 diff。',
    category: '导出',
  },
}

export const getDesktopMcpToolDisplayInfo = (name: string): DesktopMcpToolDisplayInfo | undefined => desktopMcpToolDisplayInfo[name]
