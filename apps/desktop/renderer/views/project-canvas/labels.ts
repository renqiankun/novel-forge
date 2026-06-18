import type {
  AiTaskTarget,
  AuditSeverity,
  CandidateRisk,
  CharacterRelationKind,
  ChapterStatus,
  McpWriteKind,
  OutlineNodeKind,
  OutlineNodeStatus,
  StyleAssetKind,
} from '@/api'

export const taskTargets: Array<{ value: AiTaskTarget; label: string }> = [
  { value: 'next_chapter', label: '下一章' },
  { value: 'next_10_chapters', label: '下 10 章规划' },
  { value: 'next_50_chapters', label: '下 50 章规划' },
  { value: 'next_100_chapters', label: '下 100 章规划' },
  { value: 'rewrite_chapter', label: '章节重写' },
  { value: 'style_extract', label: '风格提取' },
  { value: 'style_process', label: '风格处理' },
  { value: 'style_adjustment', label: '风格调整' },
]

export const nodeKindLabel = (kind: string) =>
  ({ book: '全书', volume: '卷', arc: '弧线', chapter: '章节', version: '版本', task: '任务', risk: '风险' })[kind] ?? kind

export const chapterStatusLabel = (value: ChapterStatus | string) =>
  ({
    queued: '待规划',
    context_ready: '写作参考就绪',
    planning: '规划中',
    ready_to_generate: '可生成',
    generating: '生成中',
    draft_saved: '草稿已保存',
    draft_complete_signal_received: '候选已写入',
    postcheck_running: '检查中',
    facts_extracted: '事实已提取',
    waiting_fact_confirmation: '待沉淀事实',
    committed: '已定版',
    paused: '暂停',
    failed: '失败',
  })[value] ?? value

export const versionStatusLabel = (value?: string) => ({ candidate: '候选', applied: '已定版', archived: '已归档' })[value ?? 'candidate'] ?? value

export const aiTaskStatusLabel = (value: string) =>
  ({ queued: '排队', context_ready: '写作参考就绪', waiting_for_ai: '等待外部 AI', completed: '已回填', needs_review: '需复核' })[value] ?? value

export const aiTaskTargetLabel = (value: string) => taskTargets.find((item) => item.value === value)?.label ?? value

export const contextModeLabel = (value: string) => ({ lite: '精简', full: '完整', deep: '深度' })[value] ?? value

export const reviewModeLabel = (value: string) => ({ token_saver: '节省上下文', balanced: '平衡', strict: '严格' })[value] ?? value

export const writeKindLabel = (value: McpWriteKind | string) =>
  ({
    ai_task: 'AI 任务',
    chapter_version: '章节版本',
    chapter_final: '章节定版',
    rewrite: '章节重写',
    outline: '大纲',
    world_fact: '世界事实',
    character: '角色',
    style: '风格',
    snapshot: '快照',
    ledger: '账本',
  })[value] ?? value

export const outlineKindLabel = (value: OutlineNodeKind | string) => ({ book: '全书', volume: '卷', arc: '故事弧', chapter: '章节' })[value] ?? value

export const outlineStatusLabel = (value: OutlineNodeStatus | string) =>
  ({ planned: '已规划', active: '进行中', done: '完成', needs_review: '需复核' })[value] ?? value

export const styleAssetKindLabel = (value: StyleAssetKind | string) =>
  ({
    project_style: '项目风格',
    volume_style: '卷风格',
    scene_mode: '场景模式',
    character_voice: '角色语气',
    dialogue_sample: '对白样本',
    good_sample: '好段落',
    bad_pattern: '坏模式',
    forbidden: '禁止项',
  })[value] ?? value

export const characterRelationKindLabel = (value: CharacterRelationKind | string) =>
  ({
    trust: '信任',
    conflict: '冲突',
    secret: '秘密',
    ally: '同盟',
    rival: '竞争',
    debt: '债务',
    family: '亲缘',
  })[value] ?? value

export const riskLabel = (value: CandidateRisk | string) => ({ low: '低风险', medium: '中风险', high: '高风险' })[value] ?? value

export const severityLabel = (value: AuditSeverity | string) => ({ info: '提示', warning: '警告', danger: '危险' })[value] ?? value

export const reviewKindLabel = (value: string) => ({ candidate_fact: '候选事实', audit_report: '审稿报告', chapter_issue: '章节问题' })[value] ?? value

export const reviewSeverityLabel = (value: string) =>
  ({ low: '低风险', medium: '中风险', high: '高风险', info: '提示', warning: '警告', danger: '危险' })[value] ?? value

export const taskScopeHint = (value: AiTaskTarget) =>
  ({
    next_chapter: '生成候选正文',
    next_10_chapters: '批量规划小段',
    next_50_chapters: '中期剧情包',
    next_100_chapters: '长线结构包',
    rewrite_chapter: '重写候选版本',
    style_adjustment: '调整风格资产',
    style_extract: '提取风格样本',
    style_process: '处理风格资产',
  })[value]
