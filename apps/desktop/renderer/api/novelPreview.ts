import { novelDbApi } from './novel'
import type {
  NovelContentStorageSettings,
  NovelContentStorageSyncResult,
} from '../../electron/shared/ipc'
import { getDesktopMcpToolDisplayInfo } from '../../electron/shared/mcp-tool-metadata'

export type { NovelContentStorageSettings, NovelContentStorageSyncResult }

export type ProjectStatus = 'planning' | 'drafting' | 'reviewing' | 'paused'
export type ChapterStatus =
  | 'queued'
  | 'planned'
  | 'context_ready'
  | 'planning'
  | 'ready_to_generate'
  | 'generating'
  | 'draft_saved'
  | 'draft_complete_signal_received'
  | 'postcheck_running'
  | 'facts_extracted'
  | 'waiting_fact_confirmation'
  | 'committed'
  | 'paused'
  | 'failed'
export type CandidateFactStatus = 'pending' | 'confirmed' | 'rejected'
export type CandidateRisk = 'low' | 'medium' | 'high'
export type AuditSeverity = 'info' | 'warning' | 'danger'
export type ChapterVersionKind = 'manual' | 'generated' | 'rewrite' | 'external'
export type ChapterVersionStatus = 'candidate' | 'applied' | 'archived'
export type RewriteScope = 'paragraph' | 'scene' | 'chapter' | 'dialogue'
export type RewriteMode = 'style_voice' | 'dialogue' | 'scene_expression' | 'chapter_bridge' | 'plot_impact'
export type RewriteLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4'
export type LocalCheckLevel = RewriteLevel
export type LocalCheckSeverity = 'info' | 'warning' | 'danger'
export type LocalCheckIssueCategory =
  | 'project_scope'
  | 'word_count'
  | 'chapter_boundary'
  | 'locked_fact'
  | 'new_entity'
  | 'risk_keyword'
  | 'pressure_curve'
  | 'breakpoint'
  | 'plot_debt'
  | 'character_state'
  | 'index_dirty'
export type LocalCheckSuggestedAction = 'direct_save' | 'confirm_save' | 'return_edit' | 'mark_for_codex'
export type StyleAssetKind =
  | 'project_style'
  | 'volume_style'
  | 'scene_mode'
  | 'character_voice'
  | 'dialogue_sample'
  | 'good_sample'
  | 'bad_pattern'
  | 'forbidden'
export type ChapterIssueCategory = 'continuity' | 'style' | 'fact' | 'dialogue' | 'structure'
export type OutlineNodeKind = 'book' | 'volume' | 'arc' | 'chapter' | 'scene'
export type OutlineNodeStatus = 'planned' | 'active' | 'done' | 'needs_review'
export type AiTaskTarget =
  | 'next_chapter'
  | 'next_10_chapters'
  | 'next_50_chapters'
  | 'next_100_chapters'
  | 'rewrite_chapter'
  | 'style_adjustment'
  | 'style_extract'
  | 'style_process'
export type AiTaskStatus = 'queued' | 'context_ready' | 'waiting_for_ai' | 'completed' | 'needs_review'
export type AiRunStatus = 'ready' | 'completed' | 'blocked'
export type McpContextMode = 'lite' | 'full' | 'deep'
export type AiReviewDecision = 'accept' | 'reject' | 'resolve'
export type AiReviewMode = 'token_saver' | 'balanced' | 'strict'
export type CandidateFactStrategy = 'optimistic' | 'balanced' | 'conservative'
export type AiAutoPause = 'none' | 'high_risk' | 'checkpoint' | 'any_issue'
export type McpResourceKind =
  | 'project'
  | 'outline'
  | 'context_pack'
  | 'chapter'
  | 'style'
  | 'world'
  | 'character'
  | 'timeline'
  | 'ledger'
  | 'version'
export type McpWriteKind =
  | 'project_state'
  | 'state_patch'
  | 'ai_task'
  | 'chapter_version'
  | 'chapter_final'
  | 'rewrite'
  | 'outline'
  | 'world_fact'
  | 'character'
  | 'style'
  | 'snapshot'
  | 'ledger'
export type CanvasNodeKind = 'book' | 'volume' | 'arc' | 'chapter' | 'version' | 'task' | 'risk'
export type CanvasEdgeKind = 'outline' | 'chapter_flow' | 'task_target' | 'version_of' | 'risk_of'

export interface NovelProject {
  id: string
  title: string
  description: string
  genre: string
  status: ProjectStatus
  styleProfileId?: string
  targetChapters: number
  currentChapter: number
  createdAt: string
  updatedAt: string
}

export interface WorldFact {
  id: string
  projectId: string
  kind: string
  title: string
  body: string
  source: string
  locked: boolean
  updatedAt: string
}

export interface CharacterProfile {
  id: string
  projectId: string
  name: string
  role: string
  location: string
  goal: string
  knowledge: string
  relationship: string
  pressure: number
  voice: string
  status: string
  updatedAt: string
}

export type CharacterRelationKind = 'trust' | 'conflict' | 'secret' | 'ally' | 'rival' | 'debt' | 'family'

export interface CharacterRelation {
  id: string
  projectId: string
  sourceCharacterId: string
  targetCharacterId: string
  kind: CharacterRelationKind
  title: string
  tension: number
  trust: number
  secret: boolean
  current: string
  future: string
  updatedAt: string
}

export interface SceneCard {
  id: string
  title: string
  goal: string
  conflict: string
  status: 'planned' | 'drafting' | 'done'
}

export interface Chapter {
  id: string
  projectId: string
  index: number
  title: string
  status: ChapterStatus
  intention: string
  summary: string
  draft: string
  wordCount: number
  sceneCards: SceneCard[]
  updatedAt: string
}

export interface ChapterVersion {
  id: string
  projectId: string
  chapterId: string
  title: string
  kind: ChapterVersionKind
  status: ChapterVersionStatus
  body: string
  summary: string
  wordCount: number
  source: string
  createdAt: string
}

export interface RewriteTask {
  id: string
  projectId: string
  chapterId: string
  aiTaskId?: string
  versionId?: string
  scope: RewriteScope
  reason: string
  mode: RewriteMode
  level: RewriteLevel
  status: 'requested' | 'completed' | 'applied' | 'rejected'
  createdAt: string
}

export interface LocalCheckIssue {
  id: string
  category: LocalCheckIssueCategory
  severity: LocalCheckSeverity
  level: LocalCheckLevel
  title: string
  body: string
  evidence?: string
}

export interface LocalCheckResult {
  id: string
  projectId: string
  chapterId: string
  level: LocalCheckLevel
  requiresConfirmation: boolean
  tokenPolicy: 'local_only'
  suggestedAction: LocalCheckSuggestedAction
  issues: LocalCheckIssue[]
  createdAt: string
}

export interface StyleProfile {
  id: string
  projectId: string
  title: string
  description: string
  tone: string
  source: 'preset' | 'custom'
  active: boolean
  updatedAt: string
}

export interface StyleAsset {
  id: string
  projectId: string
  profileId?: string
  templateId?: string
  kind: StyleAssetKind
  title: string
  body: string
  scope: string
  source: 'preset' | 'user' | 'system' | 'codex'
  enabled: boolean
  updatedAt: string
}

export interface StyleAssetTemplate {
  id: string
  kind: StyleAssetKind
  title: string
  body: string
  scope: string
  tags: string[]
  source: 'preset' | 'user'
  updatedAt: string
}

export interface StyleLibrary {
  profiles: StyleProfile[]
  assets: StyleAsset[]
  activeProfileId?: string
}

export interface ChapterIssue {
  id: string
  projectId: string
  chapterId: string
  category: ChapterIssueCategory
  severity: AuditSeverity
  title: string
  body: string
  action: 'rewrite' | 'confirm_fact' | 'review'
  status: 'open' | 'resolved'
  createdAt: string
}

export interface CandidateFact {
  id: string
  projectId: string
  chapterId?: string
  title: string
  kind: string
  body: string
  risk: CandidateRisk
  status: CandidateFactStatus
  source: string
  createdAt: string
}

export interface AuditReport {
  id: string
  projectId: string
  chapterId?: string
  title: string
  stage: 'precheck' | 'postcheck' | 'submit'
  severity: AuditSeverity
  status: 'open' | 'resolved'
  items: string[]
  createdAt: string
}

export interface SnapshotRecord {
  id: string
  projectId: string
  chapterId?: string
  versionId?: string
  title: string
  reason: string
  payload?: ProjectSnapshotPayload
  createdAt: string
}

export interface ProjectSnapshotPayload {
  project: NovelProject
  worldFacts: WorldFact[]
  characters: CharacterProfile[]
  characterRelations: CharacterRelation[]
  chapters: Chapter[]
  chapterVersions: ChapterVersion[]
  rewriteTasks: RewriteTask[]
  styleProfiles: StyleProfile[]
  styleAssets: StyleAsset[]
  outlineNodes: OutlineNode[]
  chapterIssues: ChapterIssue[]
  localCheckResults: LocalCheckResult[]
  candidateFacts: CandidateFact[]
  auditReports: AuditReport[]
  storyThreads: StoryThread[]
  foreshadows: ForeshadowRecord[]
  costs: CostRecord[]
  debts: PlotDebt[]
  timeline: TimelineEvent[]
  messages: MessageRecord[]
  pressures: PressureRecord[]
  dialogueProfiles: DialogueProfile[]
}

export interface OutlineNode {
  id: string
  projectId: string
  kind: OutlineNodeKind
  title: string
  summary: string
  goal: string
  conflict: string
  payoff: string
  focus?: string
  plotLine?: string
  chapterFunction?: string
  actorGoal?: string
  obstacle?: string
  outcome?: string
  mainlineImpact?: string
  status: OutlineNodeStatus
  chapterId?: string
  chapterIndex?: number
  parentId?: string
  order: number
  updatedAt: string
}

export interface ProjectOutline {
  nodes: OutlineNode[]
  activeChapterNode?: OutlineNode
}

export interface StoryThread {
  id: string
  projectId: string
  title: string
  kind: 'main' | 'side' | 'relationship' | 'world_crisis' | 'theme'
  status: 'active' | 'sleeping' | 'strengthening' | 'to_payoff' | 'done' | 'needs_review'
  priority: number
  nextWindow: string
  body: string
  updatedAt: string
}

export interface ForeshadowRecord {
  id: string
  projectId: string
  title: string
  status: 'seeded' | 'strengthened' | 'sleeping' | 'to_payoff' | 'paid'
  span: 'near' | 'mid' | 'long' | 'finale'
  lastTouchedChapter: number
  nextWindow: string
  risk: CandidateRisk
  body: string
}

export interface CostRecord {
  id: string
  projectId: string
  title: string
  kind: 'body' | 'memory' | 'relationship' | 'moral' | 'time' | 'resource' | 'world_pressure'
  status: 'owed' | 'triggered' | 'paid' | 'delayed'
  trigger: string
  body: string
}

export interface PlotDebt {
  id: string
  projectId: string
  title: string
  kind: 'promise' | 'foreshadow' | 'cost' | 'relationship' | 'villain' | 'world'
  severity: 'normal' | 'notice' | 'high' | 'danger' | 'this_batch'
  window: string
  body: string
}

export interface TimelineEvent {
  id: string
  projectId: string
  title: string
  time: string
  place: string
  status: 'confirmed' | 'planned' | 'needs_review'
  body: string
}

export interface MessageRecord {
  id: string
  projectId: string
  title: string
  sentAt: string
  arrivesAt: string
  holder: string
  version: 'original' | 'distorted' | 'rumor'
  status: 'in_transit' | 'read' | 'intercepted'
  body: string
}

export interface PressureRecord {
  id: string
  projectId: string
  characterId: string
  emotion: string
  value: number
  threshold: number
  source: string
  breakpoint?: string
  aftermath: string
  status: 'stable' | 'rising' | 'breakpoint' | 'aftermath'
}

export interface DialogueProfile {
  id: string
  projectId: string
  characterId: string
  title: string
  voiceRules: string[]
  forbidden: string[]
  relationshipTone: string
  updatedAt: string
}

export interface LongState {
  threads: StoryThread[]
  foreshadows: ForeshadowRecord[]
  costs: CostRecord[]
  debts: PlotDebt[]
  timeline: TimelineEvent[]
  messages: MessageRecord[]
  pressures: PressureRecord[]
  dialogueProfiles: DialogueProfile[]
}

export interface CharacterRelationGraph {
  projectId: string
  characters: CharacterProfile[]
  relations: CharacterRelation[]
  pressures: PressureRecord[]
  dialogueProfiles: DialogueProfile[]
  generatedAt: string
}

export interface ChapterHumanSummary {
  chapterId: string
  title: string
  intention: string
  plot: string
  participants: Array<{
    character: CharacterProfile
    pressure?: PressureRecord
    dialogue?: DialogueProfile
    relationNotes: string[]
  }>
  characterStates: string[]
  relationshipChanges: string[]
  pressureSignals: string[]
  debts: string[]
  hooks: string[]
}

export interface ChapterContextPack {
  project: NovelProject
  chapter: Chapter
  outlineNodes: OutlineNode[]
  chapterOutline?: OutlineNode
  activeStyle?: StyleProfile
  enabledStyleAssets: StyleAsset[]
  characters: CharacterProfile[]
  worldFacts: WorldFact[]
  sceneCards: SceneCard[]
  chapterIssues: ChapterIssue[]
  localChecks: LocalCheckResult[]
  longState: LongState
  humanSummary?: ChapterHumanSummary
  generatedAt: string
  tokenPolicy: 'local_only'
  budget: {
    mode: McpContextMode
    estimatedTokens: number
    hardLimit: number
  }
}

export interface ProjectDashboard {
  project: NovelProject
  stats: {
    chapters: number
    worldFacts: number
    characters: number
    pendingFacts: number
    auditIssues: number
    snapshots: number
    plotDebts: number
    pressureAlerts: number
  }
  recentChapters: Chapter[]
  currentChapter?: Chapter
  activeStyle?: StyleProfile
  latestWrite?: McpWriteLog
  pendingFacts: CandidateFact[]
  auditReports: AuditReport[]
  snapshots: SnapshotRecord[]
  mcp: {
    status: 'ready'
    tools: number
    mode: string
  }
}

export interface AiTask {
  id: string
  projectId: string
  title: string
  target: AiTaskTarget
  status: AiTaskStatus
  queueOrder?: number
  contextMode: McpContextMode
  reviewMode: AiReviewMode
  factStrategy: CandidateFactStrategy
  checkpointEvery: number
  autoPause: AiAutoPause
  chapterId?: string
  rewriteTaskId?: string
  instruction: string
  createdAt: string
  updatedAt: string
}

export interface AiTaskQueueItem {
  task: AiTask
  order: number
  executable: boolean
  blockedReason?: string
  latestWrite?: McpWriteLog
  packageUri: string
}

export interface AiTaskQueue {
  projectId: string
  generatedAt: string
  nextTask?: AiTaskQueueItem
  items: AiTaskQueueItem[]
  policy: string[]
}

export interface AiRun {
  id: string
  projectId: string
  taskId?: string
  title: string
  summary: string
  status: AiRunStatus
  startedAt: string
  finishedAt?: string
}

export interface McpResourcePreview {
  id: string
  projectId: string
  uri: string
  kind: McpResourceKind
  title: string
  description: string
  items: number
  contextMode: McpContextMode
  updatedAt: string
}

export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface McpWriteLog {
  id: string
  projectId: string
  taskId?: string
  kind: McpWriteKind
  title: string
  summary: string
  actor: 'human' | 'codex' | 'claude' | 'system'
  createdAt: string
}

export interface AiPendingReview {
  id: string
  kind: 'candidate_fact' | 'audit_report' | 'chapter_issue'
  title: string
  body: string
  severity: CandidateRisk | AuditSeverity
  createdAt: string
}

export interface AiWorkbench {
  project: NovelProject
  stats: {
    queuedTasks: number
    contextResources: number
    pendingReviews: number
    recentWrites: number
  }
  tasks: AiTask[]
  taskQueue: AiTaskQueue
  runs: AiRun[]
  writeLogs: McpWriteLog[]
  resourcePreviews: McpResourcePreview[]
  pendingReviews: AiPendingReview[]
}

export interface AiTaskPackage {
  id: string
  projectId: string
  task: AiTask
  taskUri: string
  queuePosition?: number
  queuePolicy: string[]
  generatedAt: string
  contextPack?: ChapterContextPack
  rewriteTask?: RewriteTask
  styleLibrary: StyleLibrary
  expectedReadResources: McpResourcePreview[]
  expectedWriteBack: Array<{
    kind: McpWriteKind
    title: string
    description: string
    required: boolean
  }>
  mcpHints: string[]
  notes: string[]
}

export interface ProjectCanvasNode {
  id: string
  kind: CanvasNodeKind
  refId: string
  parentId?: string
  title: string
  subtitle: string
  status: string
  x: number
  y: number
  width: number
  height: number
  tone: 'paper' | 'moss' | 'copper' | 'amber' | 'danger' | 'muted'
  metrics: Array<{ label: string; value: string | number }>
  badges: string[]
  summary: string
  hasBody?: boolean
}

export interface ProjectCanvasEdge {
  id: string
  kind: CanvasEdgeKind
  source: string
  target: string
  label?: string
  animated?: boolean
}

export interface ProjectCanvas {
  project: NovelProject
  generatedAt: string
  nodes: ProjectCanvasNode[]
  edges: ProjectCanvasEdge[]
  stats: {
    volumes: number
    chapters: number
    tasks: number
    pendingReviews: number
    versions: number
  }
}

export interface CanvasNodeDetail {
  node: ProjectCanvasNode
  project: NovelProject
  outline?: OutlineNode
  chapter?: Chapter
  versions: ChapterVersion[]
  tasks: AiTask[]
  contextPack?: ChapterContextPack
  worldFacts: WorldFact[]
  characters: CharacterProfile[]
  styleLibrary: StyleLibrary
  localChecks: LocalCheckResult[]
  candidateFacts: CandidateFact[]
  auditReports: AuditReport[]
  longState: LongState
  humanSummary?: ChapterHumanSummary
}

interface PreviewState {
  projects: NovelProject[]
  worldFacts: WorldFact[]
  characters: CharacterProfile[]
  characterRelations: CharacterRelation[]
  chapters: Chapter[]
  chapterVersions: ChapterVersion[]
  rewriteTasks: RewriteTask[]
  styleProfiles: StyleProfile[]
  styleAssets: StyleAsset[]
  styleAssetTemplates: StyleAssetTemplate[]
  outlineNodes: OutlineNode[]
  chapterIssues: ChapterIssue[]
  localCheckResults: LocalCheckResult[]
  candidateFacts: CandidateFact[]
  auditReports: AuditReport[]
  snapshots: SnapshotRecord[]
  aiTasks: AiTask[]
  aiRuns: AiRun[]
  mcpWriteLogs: McpWriteLog[]
  storyThreads: StoryThread[]
  foreshadows: ForeshadowRecord[]
  costs: CostRecord[]
  debts: PlotDebt[]
  timeline: TimelineEvent[]
  messages: MessageRecord[]
  pressures: PressureRecord[]
  dialogueProfiles: DialogueProfile[]
}

const STORAGE_KEY = 'novelforge.preview.v2'
const now = () => new Date().toISOString()
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const wordCount = (text: string) => text.replace(/\s/g, '').length
const legacyTextReplacements: Array<[RegExp, string]> = [
  [/Codex \/ Claude Code/g, '外部 AI'],
  [/Codex \/ Claude/g, '外部 AI'],
  [/Claude Code/g, '外部 AI'],
  [/Codex/g, '外部 AI'],
  [/Context Pack/g, '当前写作参考'],
  [/省 Token/g, '节省上下文'],
]

const normalizeLegacyText = <T>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (typeof item !== 'string') return item
      return legacyTextReplacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), item)
    }),
  ) as T

const uid = (prefix: string) => {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${random}`
}

const asyncResult = <T>(factory: () => T, delay = 80) =>
  new Promise<T>((resolve, reject) => {
    window.setTimeout(async () => {
      try {
        await ensureStateReady()
        resolve(clone(factory()))
      } catch (error) {
        reject(error)
      }
    }, delay)
  })

const seedState = (): PreviewState => {
  const createdAt = now()
  return {
    projects: [
      {
        id: 'demo-long-novel',
        title: '示例长篇项目',
        description: '用于验证 AI 控制端读取状态、生成版本、回写候选事实和推进长篇账本的 预览小说。',
        genre: '东方玄幻',
        status: 'drafting',
        styleProfileId: 'style-demo-classic',
        targetChapters: 600,
        currentChapter: 3,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'city-of-echoes',
        title: '回声城手记',
        description: '用于验证多项目隔离的第二部小说，数据不会进入示例长篇项目的上下文。',
        genre: '都市异闻',
        status: 'planning',
        styleProfileId: 'style-city-noir',
        targetChapters: 180,
        currentChapter: 1,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    styleAssetTemplates: [
      {
        id: 'template-pressure-breakpoint',
        kind: 'scene_mode',
        title: '高压破声点节奏',
        body: '破声点前减少解释，保留动作、停顿和短句。破声后必须留下余波：关系降温、身体代价、事实暴露或后续债务之一。',
        scope: '高压章节',
        tags: ['破声点', '压力值', '短句'],
        source: 'preset',
        updatedAt: createdAt,
      },
      {
        id: 'template-character-voice',
        kind: 'character_voice',
        title: '克制型主角语气',
        body: '少解释，不主动说出完整情绪；先处理现场事实，再给出判断。愤怒时句子更短，避免长篇价值观宣言。',
        scope: '主角对白',
        tags: ['角色语气', '对白', '克制'],
        source: 'preset',
        updatedAt: createdAt,
      },
      {
        id: 'template-forbidden-exposition',
        kind: 'forbidden',
        title: '禁止设定倾倒对白',
        body: '不要让角色用连续对白解释世界规则。重要信息需要经过误读、遮掩、代价、证据或冲突进入正文。',
        scope: '全书对白',
        tags: ['禁止项', '坏模式'],
        source: 'preset',
        updatedAt: createdAt,
      },
      {
        id: 'template-volume-cold-delay',
        kind: 'volume_style',
        title: '寒冷与消息延迟',
        body: '把寒冷当作信息流动变慢的机制：路程、伤势、信件、判断都被拖延；气候不只做氛围。',
        scope: '卷风格',
        tags: ['卷风格', '消息链', '氛围'],
        source: 'preset',
        updatedAt: createdAt,
      },
    ],
    worldFacts: [
      {
        id: 'fact-demo-1',
        projectId: 'demo-long-novel',
        kind: '世界硬规则',
        title: '灵脉枯竭不能凭空逆转',
        body: '任何恢复灵脉的行为都必须支付时间、记忆或关系代价，不能无代价突破。',
        source: '卷一设定',
        locked: true,
        updatedAt: createdAt,
      },
      {
        id: 'fact-demo-2',
        projectId: 'demo-long-novel',
        kind: '地点',
        title: '北境驿道',
        body: '北境驿道冬季单程至少七日，暴雪时消息延迟翻倍。',
        source: '第 2 章',
        locked: false,
        updatedAt: createdAt,
      },
      {
        id: 'fact-city-1',
        projectId: 'city-of-echoes',
        kind: '城市规则',
        title: '午夜广播只在旧城区出现',
        body: '主角团队未进入旧城区前，不能提前获得午夜广播的完整内容。',
        source: '项目初设',
        locked: true,
        updatedAt: createdAt,
      },
    ],
    characters: [
      {
        id: 'char-demo-1',
        projectId: 'demo-long-novel',
        name: '沈砚',
        role: '主角',
        location: '北境驿站',
        goal: '找到灵脉枯竭的真正源头，同时不让妹妹卷入代价。',
        knowledge: '知道北境信使失踪，但不知道王都已经收到篡改版本。',
        relationship: '与陆青岚互相试探，信任 40，隐瞒 70。',
        pressure: 68,
        voice: '克制、少解释，情绪高压时句子变短。',
        status: '疲惫，右臂旧伤未愈',
        updatedAt: createdAt,
      },
      {
        id: 'char-demo-2',
        projectId: 'demo-long-novel',
        name: '陆青岚',
        role: '盟友 / 潜在背叛者',
        location: '王都外城',
        goal: '确认沈砚是否会破坏家族与北境的交易。',
        knowledge: '只读到被截短的北境来信，误以为沈砚主动隐瞒伤亡。',
        relationship: '对沈砚信任 35，怨气 55，共同秘密 1 条。',
        pressure: 52,
        voice: '礼貌锋利，重要问题常用反问。',
        status: '表面冷静',
        updatedAt: createdAt,
      },
    ],
    characterRelations: [
      {
        id: 'relation-demo-1',
        projectId: 'demo-long-novel',
        sourceCharacterId: 'char-demo-1',
        targetCharacterId: 'char-demo-2',
        kind: 'secret',
        title: '互相试探的同盟',
        tension: 72,
        trust: 38,
        secret: true,
        current: '沈砚不知道陆青岚读到的是篡改版本，陆青岚也不知道北境第二封信已在风雪中失踪。',
        future: '第 4 章可安排第一次正面冲突；信任下降，但共同秘密会迫使两人继续合作。',
        updatedAt: createdAt,
      },
    ],
    chapters: [
      {
        id: 'chapter-demo-1',
        projectId: 'demo-long-novel',
        index: 1,
        title: '雪线下的旧誓',
        status: 'committed',
        intention: '建立北境寒冷、灵脉衰败与主角旧伤。',
        summary: '沈砚抵达北境驿站，发现信使带来的并非求援，而是一份被动过手脚的王都回信。',
        draft: '雪停在黄昏前。沈砚把冻硬的信纸按在灯下，墨痕像一条被掐断的河。',
        wordCount: 34,
        sceneCards: [
          { id: 'scene-demo-1', title: '驿站验信', goal: '确认消息版本异常', conflict: '信使失踪，回信被篡改', status: 'done' },
        ],
        updatedAt: createdAt,
      },
      {
        id: 'chapter-demo-2',
        projectId: 'demo-long-novel',
        index: 2,
        title: '迟到七日的火漆',
        status: 'draft_saved',
        intention: '展示消息延迟和角色知识边界，制造沈砚与陆青岚的信息差。',
        summary: '王都收到的消息比真实版本晚七日，陆青岚做出错误判断。',
        draft: '火漆边缘裂开时，陆青岚没有立刻拆信。她先看见日期，随后才看见缺失的半枚印记。',
        wordCount: 43,
        sceneCards: [
          { id: 'scene-demo-2', title: '王都拆信', goal: '让陆青岚得到错误版本', conflict: '她必须在信息不足时做决定', status: 'drafting' },
        ],
        updatedAt: createdAt,
      },
      {
        id: 'chapter-demo-3',
        projectId: 'demo-long-novel',
        index: 3,
        title: '北风未送达',
        status: 'planning',
        intention: '让主角意识到消息链被控制，但不能直接知道王都误判。',
        summary: '待生成：沈砚追查信使失踪，北境风雪阻断第二封信。',
        draft: '',
        wordCount: 0,
        sceneCards: [
          { id: 'scene-demo-3', title: '追查失踪信使', goal: '推进北境消息线', conflict: '雪路、伤势和时间压力同时压迫主角', status: 'planned' },
        ],
        updatedAt: createdAt,
      },
      {
        id: 'chapter-city-1',
        projectId: 'city-of-echoes',
        index: 1,
        title: '没有回声的午夜',
        status: 'queued',
        intention: '建立旧城区广播规则。',
        summary: '许照第一次听说午夜广播。',
        draft: '',
        wordCount: 0,
        sceneCards: [],
        updatedAt: createdAt,
      },
    ],
    chapterVersions: [
      {
        id: 'version-demo-1',
        projectId: 'demo-long-novel',
        chapterId: 'chapter-demo-2',
        title: '手动保存 17:20',
        kind: 'manual',
        status: 'applied',
        body: '火漆边缘裂开时，陆青岚没有立刻拆信。她先看见日期，随后才看见缺失的半枚印记。',
        summary: '当前定版正文。',
        wordCount: 43,
        source: '手动 / 已定版',
        createdAt,
      },
    ],
    rewriteTasks: [],
    styleProfiles: [
      {
        id: 'style-demo-classic',
        projectId: 'demo-long-novel',
        title: '高压爆发章',
        description: '短句、余震、压抑递进，用于破声点、关系撕裂和战斗后余震。',
        tone: '冷峭玄幻长篇，克制、寒意、代价感强。',
        source: 'preset',
        active: true,
        updatedAt: createdAt,
      },
      {
        id: 'style-city-noir',
        projectId: 'city-of-echoes',
        title: '潮湿城市怪谈',
        description: '低饱和城市感，广播、雨夜、霓虹和记忆错位。',
        tone: '克制悬疑，现实细节中露出异常。',
        source: 'preset',
        active: true,
        updatedAt: createdAt,
      },
    ],
    styleAssets: [
      {
        id: 'asset-demo-1',
        projectId: 'demo-long-novel',
        profileId: 'style-demo-classic',
        kind: 'project_style',
        title: '全书底色',
        body: '寒冷不是背景，而是时间、消息和关系都变慢的压力源。句子偏克制，不提前替角色解释情绪。',
        scope: '全书',
        source: 'preset',
        enabled: true,
        updatedAt: createdAt,
      },
      {
        id: 'asset-demo-2',
        projectId: 'demo-long-novel',
        profileId: 'style-demo-classic',
        kind: 'character_voice',
        title: '沈砚语气锚点',
        body: '少解释，压着说；情绪高压时句子变短，避免长篇自白。',
        scope: '沈砚',
        source: 'preset',
        enabled: true,
        updatedAt: createdAt,
      },
      {
        id: 'asset-demo-3',
        projectId: 'demo-long-novel',
        profileId: 'style-demo-classic',
        kind: 'bad_pattern',
        title: '禁止：设定倾倒对白',
        body: '角色不能用对白把所有背景解释给读者，重要信息要带阻力、遮掩和代价。',
        scope: '对白',
        source: 'preset',
        enabled: true,
        updatedAt: createdAt,
      },
    ],
    outlineNodes: [
      {
        id: 'outline-demo-book',
        projectId: 'demo-long-novel',
        kind: 'book',
        title: '全书主线：灵脉枯竭与代价',
        summary: '沈砚追查北境灵脉枯竭，逐步发现消息链、王都权力和记忆代价互相牵连。',
        goal: '让主角从被动查案走向主动承担代价。',
        conflict: '恢复灵脉必须付出时间、记忆或关系代价，不能无成本突破。',
        payoff: '最终回收灵脉枯竭的真正源头与主角旧誓。',
        status: 'active',
        order: 1,
        updatedAt: createdAt,
      },
      {
        id: 'outline-demo-volume-1',
        projectId: 'demo-long-novel',
        kind: 'volume',
        title: '卷一：北境迟信',
        summary: '围绕北境驿道、迟到七日的消息和王都误判建立第一卷压力。',
        goal: '确认消息链被人控制，并让沈砚与陆青岚产生信息差。',
        conflict: '风雪拖慢行动，旧伤限制追查，王都版本已经被篡改。',
        payoff: '卷末揭示北境求援被截断，为王都线反转埋钩。',
        status: 'active',
        parentId: 'outline-demo-book',
        order: 10,
        updatedAt: createdAt,
      },
      {
        id: 'outline-demo-chapter-3',
        projectId: 'demo-long-novel',
        kind: 'chapter',
        title: '第 3 章：北风未送达',
        summary: '追查失踪信使，确认第二封信被风雪和人为阻断。',
        goal: '让沈砚拿到“消息链被控制”的第一层证据。',
        conflict: '旧伤、雪路、驿站封口同时阻碍追查。',
        payoff: '结尾留下第二封信可能被截获的钩子。',
        focus: '主角',
        plotLine: '主线 / 消息链',
        chapterFunction: '推进 + 伏笔',
        actorGoal: '沈砚要确认失踪信使和第二封信的真实去向。',
        obstacle: '旧伤、雪路、驿站封口和被篡改的消息共同阻碍追查。',
        outcome: '部分成功，但确认有人提前截断消息。',
        mainlineImpact: '把北境求援与王都误判连接起来，推动后续王都线反转。',
        status: 'planned',
        chapterId: 'chapter-demo-3',
        chapterIndex: 3,
        parentId: 'outline-demo-volume-1',
        order: 30,
        updatedAt: createdAt,
      },
    ],
    chapterIssues: [
      {
        id: 'issue-demo-1',
        projectId: 'demo-long-novel',
        chapterId: 'chapter-demo-3',
        category: 'continuity',
        severity: 'warning',
        title: '本章不能让沈砚提前知道王都误判',
        body: '消息未抵达前，沈砚只能推断消息链异常，不能知道陆青岚的具体判断。',
        action: 'review',
        status: 'open',
        createdAt,
      },
    ],
    localCheckResults: [],
    candidateFacts: [
      {
        id: 'candidate-demo-1',
        projectId: 'demo-long-novel',
        chapterId: 'chapter-demo-2',
        title: '王都收到的是篡改信',
        kind: '消息版本',
        body: '陆青岚当前持有的北境回信缺少后半段，不能作为真实事实提交。',
        risk: 'medium',
        status: 'pending',
        source: '第 2 章草稿',
        createdAt,
      },
    ],
    auditReports: [
      {
        id: 'audit-demo-1',
        projectId: 'demo-long-novel',
        chapterId: 'chapter-demo-3',
        title: '第 3 章生成前检查',
        stage: 'precheck',
        severity: 'warning',
        status: 'open',
        items: ['需要保持沈砚与陆青岚的信息差。', '北境驿道暴雪会影响信使和消息速度。'],
        createdAt,
      },
    ],
    snapshots: [
      {
        id: 'snapshot-demo-1',
        projectId: 'demo-long-novel',
        chapterId: 'chapter-demo-2',
        title: '第 2 章定版前快照',
        reason: '保存当前正文、消息版本和关系账本，便于重写后回滚。',
        createdAt,
      },
    ],
    aiTasks: [
      {
        id: 'task-demo-1',
        projectId: 'demo-long-novel',
        title: '等待外部 AI 生成第 3 章',
        target: 'next_chapter',
        status: 'context_ready',
        contextMode: 'full',
        reviewMode: 'token_saver',
        factStrategy: 'balanced',
        checkpointEvery: 1,
        autoPause: 'high_risk',
        chapterId: 'chapter-demo-3',
        instruction: '先读取当前写作参考，保持消息延迟和知识边界，不要让沈砚提前知道王都误判。',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    aiRuns: [],
    mcpWriteLogs: [
      {
        id: 'write-demo-1',
        projectId: 'demo-long-novel',
        kind: 'outline',
        title: '卷一大纲已绑定当前章',
        summary: '第 3 章将推进消息链被控制的证据。',
        actor: 'system',
        createdAt,
      },
    ],
    storyThreads: [
      {
        id: 'thread-demo-1',
        projectId: 'demo-long-novel',
        title: '消息链被篡改',
        kind: 'main',
        status: 'active',
        priority: 92,
        nextWindow: '第 3-5 章必须强化',
        body: '北境求援、王都误判和陆青岚的行动都依赖这条线。',
        updatedAt: createdAt,
      },
      {
        id: 'thread-demo-2',
        projectId: 'demo-long-novel',
        title: '沈砚与陆青岚信任裂缝',
        kind: 'relationship',
        status: 'strengthening',
        priority: 76,
        nextWindow: '第 4 章可第一次正面冲突',
        body: '双方掌握不同消息版本，信任下降但仍需要合作。',
        updatedAt: createdAt,
      },
    ],
    foreshadows: [
      {
        id: 'foreshadow-demo-1',
        projectId: 'demo-long-novel',
        title: '缺失的半枚印记',
        status: 'strengthened',
        span: 'mid',
        lastTouchedChapter: 2,
        nextWindow: '第 8-12 章再次强化',
        risk: 'medium',
        body: '与王都篡改信件的人有关，不应在第 3 章提前揭露真相。',
      },
    ],
    costs: [
      {
        id: 'cost-demo-1',
        projectId: 'demo-long-novel',
        title: '旧伤复发',
        kind: 'body',
        status: 'owed',
        trigger: '沈砚在暴雪中连续追查超过一夜',
        body: '短期影响动作和判断，长期会与灵脉代价线合并。',
      },
    ],
    debts: [
      {
        id: 'debt-demo-1',
        projectId: 'demo-long-novel',
        title: '陆青岚误判需要显现后果',
        kind: 'relationship',
        severity: 'this_batch',
        window: '第 3-4 章',
        body: '她基于篡改信做出判断，必须造成行动偏差或关系裂痕。',
      },
    ],
    timeline: [
      {
        id: 'time-demo-1',
        projectId: 'demo-long-novel',
        title: '北境第一封求援发出',
        time: '冬月初三 夜',
        place: '北境驿站',
        status: 'confirmed',
        body: '原始求援从北境发出，预计七日抵达王都。',
      },
      {
        id: 'time-demo-2',
        projectId: 'demo-long-novel',
        title: '王都收到篡改版本',
        time: '冬月初十 午后',
        place: '王都外城',
        status: 'confirmed',
        body: '陆青岚读取的是缺失后半段的版本。',
      },
    ],
    messages: [
      {
        id: 'message-demo-1',
        projectId: 'demo-long-novel',
        title: '北境求援信',
        sentAt: '冬月初三 夜',
        arrivesAt: '冬月初十 午后',
        holder: '陆青岚',
        version: 'distorted',
        status: 'read',
        body: '后半段缺失，导致陆青岚误判沈砚隐瞒伤亡。',
      },
      {
        id: 'message-demo-2',
        projectId: 'demo-long-novel',
        title: '第二封追补信',
        sentAt: '冬月初十 黄昏',
        arrivesAt: '未知',
        holder: '在途',
        version: 'original',
        status: 'in_transit',
        body: '暴雪中断路线，可能被截获。',
      },
    ],
    pressures: [
      {
        id: 'pressure-demo-1',
        projectId: 'demo-long-novel',
        characterId: 'char-demo-1',
        emotion: '执念 / 愧疚',
        value: 68,
        threshold: 82,
        source: '妹妹线索与北境伤亡同时压近。',
        breakpoint: '那就让我在忘掉之前，先找到她。',
        aftermath: '破声后风险容忍提高，语句更短，更不愿听阻止。',
        status: 'rising',
      },
    ],
    dialogueProfiles: [
      {
        id: 'dialogue-demo-1',
        projectId: 'demo-long-novel',
        characterId: 'char-demo-1',
        title: '沈砚声音画像',
        voiceRules: ['短句优先', '先观察再开口', '愤怒时声音先变轻', '不适合长篇价值观宣言'],
        forbidden: ['我知道你很痛苦', '我们必须面对命运', '连续解释设定'],
        relationshipTone: '对陆青岚：怀疑、依赖、克制，被隐瞒后更锋利。',
        updatedAt: createdAt,
      },
    ],
  }
}

let state: PreviewState = seedState()
let stateReady: Promise<void> | null = null

const readPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeLegacyText(seedState())
    const parsed = JSON.parse(raw) as PreviewState
    return normalizeLegacyText({ ...seedState(), ...parsed })
  } catch {
    return normalizeLegacyText(seedState())
  }
}

const persistLocal = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

const hasDesktopBridge = () => Boolean(window.electronAPI?.ipc)

const hydrateDesktopState = async () => {}

const ensureStateReady = async () => {
  if (hasDesktopBridge()) return
  if (!stateReady) stateReady = hydrateDesktopState()
  await stateReady
}

const persist = () => {
  persistLocal()
}

state = hasDesktopBridge() ? seedState() : readPersisted()
if (!hasDesktopBridge()) persist()
stateReady = Promise.resolve()

const getProjectOrThrow = (projectId: string) => {
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) throw new Error(`Project not found: ${projectId}`)
  return project
}

const touchProject = (projectId: string) => {
  const project = getProjectOrThrow(projectId)
  project.updatedAt = now()
}

const chapterById = (projectId: string, chapterId?: string) =>
  state.chapters.find((item) => item.projectId === projectId && item.id === chapterId)

const activeStyleForProject = (projectId: string) => {
  const project = getProjectOrThrow(projectId)
  return state.styleProfiles.find((item) => item.projectId === projectId && item.id === project.styleProfileId)
}

const aiTaskTargetText = (value: AiTaskTarget) =>
  ({
    next_chapter: '下一章',
    next_10_chapters: '下 10 章规划',
    next_50_chapters: '下 50 章规划',
    next_100_chapters: '下 100 章规划',
    rewrite_chapter: '章节重写',
    style_adjustment: '风格调整',
    style_extract: '风格提取',
    style_process: '风格处理',
  })[value]

const mcpContextModeText = (value: McpContextMode) => ({ lite: '精简', full: '完整', deep: '深度' })[value]

const reviewModeText = (value: AiReviewMode) => ({ token_saver: '节省上下文', balanced: '平衡', strict: '严格' })[value]

const addWriteLog = (projectId: string, payload: Omit<McpWriteLog, 'id' | 'projectId' | 'createdAt'>) => {
  state.mcpWriteLogs.unshift({
    id: uid('write'),
    projectId,
    createdAt: now(),
    ...payload,
  })
}

const projectSnapshotPayload = (projectId: string): ProjectSnapshotPayload => ({
  project: getProjectOrThrow(projectId),
  worldFacts: state.worldFacts.filter((item) => item.projectId === projectId),
  characters: state.characters.filter((item) => item.projectId === projectId),
  characterRelations: state.characterRelations.filter((item) => item.projectId === projectId),
  chapters: state.chapters.filter((item) => item.projectId === projectId),
  chapterVersions: state.chapterVersions.filter((item) => item.projectId === projectId),
  rewriteTasks: state.rewriteTasks.filter((item) => item.projectId === projectId),
  styleProfiles: state.styleProfiles.filter((item) => item.projectId === projectId),
  styleAssets: state.styleAssets.filter((item) => item.projectId === projectId),
  outlineNodes: state.outlineNodes.filter((item) => item.projectId === projectId),
  chapterIssues: state.chapterIssues.filter((item) => item.projectId === projectId),
  localCheckResults: state.localCheckResults.filter((item) => item.projectId === projectId),
  candidateFacts: state.candidateFacts.filter((item) => item.projectId === projectId),
  auditReports: state.auditReports.filter((item) => item.projectId === projectId),
  storyThreads: state.storyThreads.filter((item) => item.projectId === projectId),
  foreshadows: state.foreshadows.filter((item) => item.projectId === projectId),
  costs: state.costs.filter((item) => item.projectId === projectId),
  debts: state.debts.filter((item) => item.projectId === projectId),
  timeline: state.timeline.filter((item) => item.projectId === projectId),
  messages: state.messages.filter((item) => item.projectId === projectId),
  pressures: state.pressures.filter((item) => item.projectId === projectId),
  dialogueProfiles: state.dialogueProfiles.filter((item) => item.projectId === projectId),
})

const createSnapshotRecord = (
  projectId: string,
  payload: Pick<SnapshotRecord, 'title' | 'reason'> & Pick<Partial<SnapshotRecord>, 'chapterId' | 'versionId'>,
) => {
  const snapshot: SnapshotRecord = {
    id: uid('snapshot'),
    projectId,
    chapterId: payload.chapterId,
    versionId: payload.versionId,
    title: payload.title,
    reason: payload.reason,
    payload: clone(projectSnapshotPayload(projectId)),
    createdAt: now(),
  }
  state.snapshots.unshift(snapshot)
  addWriteLog(projectId, { kind: 'snapshot', title: snapshot.title, summary: snapshot.reason, actor: 'system' })
  return snapshot
}

const replaceProjectSlice = (projectId: string, payload: ProjectSnapshotPayload) => {
  state.projects = state.projects.filter((item) => item.id !== projectId)
  state.worldFacts = state.worldFacts.filter((item) => item.projectId !== projectId)
  state.characters = state.characters.filter((item) => item.projectId !== projectId)
  state.characterRelations = state.characterRelations.filter((item) => item.projectId !== projectId)
  state.chapters = state.chapters.filter((item) => item.projectId !== projectId)
  state.chapterVersions = state.chapterVersions.filter((item) => item.projectId !== projectId)
  state.rewriteTasks = state.rewriteTasks.filter((item) => item.projectId !== projectId)
  state.styleProfiles = state.styleProfiles.filter((item) => item.projectId !== projectId)
  state.styleAssets = state.styleAssets.filter((item) => item.projectId !== projectId)
  state.outlineNodes = state.outlineNodes.filter((item) => item.projectId !== projectId)
  state.chapterIssues = state.chapterIssues.filter((item) => item.projectId !== projectId)
  state.localCheckResults = state.localCheckResults.filter((item) => item.projectId !== projectId)
  state.candidateFacts = state.candidateFacts.filter((item) => item.projectId !== projectId)
  state.auditReports = state.auditReports.filter((item) => item.projectId !== projectId)
  state.storyThreads = state.storyThreads.filter((item) => item.projectId !== projectId)
  state.foreshadows = state.foreshadows.filter((item) => item.projectId !== projectId)
  state.costs = state.costs.filter((item) => item.projectId !== projectId)
  state.debts = state.debts.filter((item) => item.projectId !== projectId)
  state.timeline = state.timeline.filter((item) => item.projectId !== projectId)
  state.messages = state.messages.filter((item) => item.projectId !== projectId)
  state.pressures = state.pressures.filter((item) => item.projectId !== projectId)
  state.dialogueProfiles = state.dialogueProfiles.filter((item) => item.projectId !== projectId)

  state.projects.unshift(payload.project)
  state.worldFacts.unshift(...payload.worldFacts)
  state.characters.unshift(...payload.characters)
  state.characterRelations.unshift(...(payload.characterRelations ?? []))
  state.chapters.unshift(...payload.chapters)
  state.chapterVersions.unshift(...payload.chapterVersions)
  state.rewriteTasks.unshift(...payload.rewriteTasks)
  state.styleProfiles.unshift(...payload.styleProfiles)
  state.styleAssets.unshift(...payload.styleAssets)
  state.outlineNodes.unshift(...payload.outlineNodes)
  state.chapterIssues.unshift(...payload.chapterIssues)
  state.localCheckResults.unshift(...payload.localCheckResults)
  state.candidateFacts.unshift(...payload.candidateFacts)
  state.auditReports.unshift(...payload.auditReports)
  state.storyThreads.unshift(...payload.storyThreads)
  state.foreshadows.unshift(...payload.foreshadows)
  state.costs.unshift(...payload.costs)
  state.debts.unshift(...payload.debts)
  state.timeline.unshift(...payload.timeline)
  state.messages.unshift(...payload.messages)
  state.pressures.unshift(...payload.pressures)
  state.dialogueProfiles.unshift(...payload.dialogueProfiles)
}

const backfillBatchPlan = (projectId: string, task: AiTask, count: number) => {
  const project = getProjectOrThrow(projectId)
  const existingIndexes = state.chapters.filter((item) => item.projectId === projectId).map((item) => item.index)
  const startIndex = Math.max(project.currentChapter, ...existingIndexes) + 1
  const createdIndexes: number[] = []

  for (let offset = 0; offset < count; offset += 1) {
    const chapterIndex = startIndex + offset
    let plannedChapter = state.chapters.find((item) => item.projectId === projectId && item.index === chapterIndex)
    if (!plannedChapter) {
      plannedChapter = {
        id: uid('chapter'),
        projectId,
        index: chapterIndex,
        title: `第 ${chapterIndex} 章`,
        status: 'context_ready',
        intention: `外部 AI 批量规划占位：第 ${chapterIndex} 章需要沿主线、压力值和剧情债务推进。`,
        summary: '等待外部 AI 回填正文候选版本。',
        draft: '',
        wordCount: 0,
        sceneCards: [],
        updatedAt: now(),
      }
      state.chapters.push(plannedChapter)
      createdIndexes.push(chapterIndex)
    }

    const existingOutline = state.outlineNodes.find((item) => item.projectId === projectId && item.chapterId === plannedChapter.id)
    if (!existingOutline) {
      const focusCycle = ['主角', '配角', '反派压力', '关系线', '世界线']
      const plotLineCycle = ['主线', '支线', '反派线', '关系线', '世界线']
      const functionCycle = ['推进', '伏笔', '代价', '转折', '回收']
      const focus = focusCycle[offset % focusCycle.length]
      const plotLine = plotLineCycle[offset % plotLineCycle.length]
      const chapterFunction = functionCycle[offset % functionCycle.length]
      state.outlineNodes.push({
        id: uid('outline'),
        projectId,
        kind: 'chapter',
        title: `第 ${chapterIndex} 章功能位`,
        summary: `批量任务 ${count} 章路线中的第 ${offset + 1} 个节点。`,
        goal: offset === 0 ? '承接当前章结尾，建立下一轮行动目标。' : '推进主线并保留后续回报窗口。',
        conflict: offset % task.checkpointEvery === 0 ? '检查压力值、破声点和剧情债务是否越线。' : '维持信息差、关系张力和时间约束。',
        payoff: offset % task.checkpointEvery === task.checkpointEvery - 1 ? '形成阶段性检查点，等待外部 AI 回填结果。' : '留出下一章继续推进的钩子。',
        focus,
        plotLine,
        chapterFunction,
        actorGoal: `${focus}围绕${plotLine}提出一个可执行目标。`,
        obstacle: '由时间压力、信息差、关系阻力或既有剧情债务构成阻碍。',
        outcome: chapterFunction === '回收' ? '阶段性兑现，但留下新的代价或选择。' : '局面发生变化，等待外部 AI 回填具体结果。',
        mainlineImpact: '改变后续压力、知识、关系、代价或可选行动之一。',
        status: 'planned',
        chapterId: plannedChapter.id,
        chapterIndex,
        order: chapterIndex * 10,
        updatedAt: now(),
      })
    }
  }

  project.currentChapter = Math.max(project.currentChapter, startIndex + count - 1)
  state.debts.unshift({
    id: uid('debt'),
    projectId,
    title: `${count} 章批量路线需要回收检查`,
    kind: 'promise',
    severity: count >= 100 ? 'danger' : count >= 50 ? 'high' : 'this_batch',
    window: `第 ${startIndex}-${startIndex + count - 1} 章`,
    body: '外部 AI 批量规划后，需要按检查点回填章节功能、压力变化、破声点、候选事实和快照。',
  })
  state.auditReports.unshift({
    id: uid('audit'),
    projectId,
    title: `${count} 章批量任务检查点`,
    stage: 'precheck',
    severity: count >= 100 ? 'danger' : 'warning',
    status: 'open',
    items: [
      `已创建 ${createdIndexes.length} 个章节占位。`,
      `每 ${task.checkpointEvery} 章检查一次压力值、破声点、剧情债务和候选事实。`,
      '外部 AI 回填正文前不自动改写权威事实库。',
    ],
    createdAt: now(),
  })
  createSnapshotRecord(projectId, {
    title: `${count} 章路线 本地快照`,
    reason: `记录外部 AI 批量规划任务 ${task.title} 的章节占位、大纲节点和检查点。`,
  })
}

const longStateForProject = (projectId: string): LongState => ({
  threads: state.storyThreads.filter((item) => item.projectId === projectId),
  foreshadows: state.foreshadows.filter((item) => item.projectId === projectId),
  costs: state.costs.filter((item) => item.projectId === projectId),
  debts: state.debts.filter((item) => item.projectId === projectId),
  timeline: state.timeline.filter((item) => item.projectId === projectId),
  messages: state.messages.filter((item) => item.projectId === projectId),
  pressures: state.pressures.filter((item) => item.projectId === projectId),
  dialogueProfiles: state.dialogueProfiles.filter((item) => item.projectId === projectId),
})

const characterById = (characterId: string) => state.characters.find((item) => item.id === characterId)

const relationKindLabel = (kind: CharacterRelationKind) =>
  ({
    trust: '信任',
    conflict: '冲突',
    secret: '秘密',
    ally: '同盟',
    rival: '竞争',
    debt: '债务',
    family: '亲缘',
  })[kind]

const characterRelationGraphForProject = (projectId: string): CharacterRelationGraph => ({
  projectId,
  characters: state.characters.filter((item) => item.projectId === projectId),
  relations: state.characterRelations.filter((item) => item.projectId === projectId),
  pressures: state.pressures.filter((item) => item.projectId === projectId),
  dialogueProfiles: state.dialogueProfiles.filter((item) => item.projectId === projectId),
  generatedAt: now(),
})

const chapterHumanSummaryForProject = (projectId: string, chapterId: string): ChapterHumanSummary => {
  const chapter = chapterById(projectId, chapterId)
  if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
  const outline = state.outlineNodes.find((item) => item.projectId === projectId && item.chapterId === chapterId)
  const chapterText = [chapter.title, chapter.intention, chapter.summary, chapter.draft, ...chapter.sceneCards.map((scene) => `${scene.title} ${scene.goal} ${scene.conflict}`)]
    .join('\n')
    .trim()
  const projectCharacters = state.characters.filter((item) => item.projectId === projectId)
  const mentionedCharacters = projectCharacters.filter((character) => chapterText.includes(character.name))
  const participants = (mentionedCharacters.length ? mentionedCharacters : projectCharacters.slice(0, 3)).map((character) => {
    const relationNotes = state.characterRelations
      .filter(
        (relation) =>
          relation.projectId === projectId &&
          (relation.sourceCharacterId === character.id || relation.targetCharacterId === character.id),
      )
      .map((relation) => {
        const source = characterById(relation.sourceCharacterId)?.name ?? relation.sourceCharacterId
        const target = characterById(relation.targetCharacterId)?.name ?? relation.targetCharacterId
        return `${source} → ${target}：${relation.title}，信任 ${relation.trust} / 张力 ${relation.tension}`
      })
    return {
      character,
      pressure: state.pressures.find((item) => item.projectId === projectId && item.characterId === character.id),
      dialogue: state.dialogueProfiles.find((item) => item.projectId === projectId && item.characterId === character.id),
      relationNotes,
    }
  })
  const participantIds = new Set(participants.map((item) => item.character.id))
  const relationChanges = state.characterRelations
    .filter(
      (relation) =>
        relation.projectId === projectId &&
        (participantIds.has(relation.sourceCharacterId) || participantIds.has(relation.targetCharacterId)),
    )
    .map((relation) => {
      const source = characterById(relation.sourceCharacterId)?.name ?? relation.sourceCharacterId
      const target = characterById(relation.targetCharacterId)?.name ?? relation.targetCharacterId
      return `${relationKindLabel(relation.kind)}｜${source} → ${target}：${relation.current}；未来：${relation.future}`
    })
  const debts = state.debts
    .filter((item) => item.projectId === projectId)
    .slice(0, 4)
    .map((item) => `${item.title}（${item.window}）：${item.body}`)
  const hooks = [
    outline?.payoff,
    ...chapter.sceneCards.map((scene) => `${scene.title}：${scene.conflict}`),
    ...state.foreshadows.filter((item) => item.projectId === projectId).slice(0, 3).map((item) => `${item.title}｜${item.nextWindow}`),
    ...state.storyThreads.filter((item) => item.projectId === projectId).slice(0, 2).map((item) => `${item.title}｜${item.nextWindow}`),
  ].filter(Boolean) as string[]
  return {
    chapterId,
    title: `第 ${chapter.index} 章：${chapter.title}`,
    intention: outline?.goal || chapter.intention || '等待补充本章目标。',
    plot: chapter.summary || outline?.summary || chapter.sceneCards.map((scene) => scene.goal).join('；') || '等待外部 AI 回填剧情摘要。',
    participants,
    characterStates: participants.map(({ character }) => `${character.name}：${character.status}；目标：${character.goal}；知识边界：${character.knowledge}`),
    relationshipChanges: relationChanges.length ? relationChanges : ['本章暂无明确关系变化，需外部 AI 写作后回填。'],
    pressureSignals: participants
      .map(({ character, pressure }) =>
        pressure
          ? `${character.name}：${pressure.emotion} ${pressure.value}/${pressure.threshold}；破声点：${pressure.breakpoint || '未触发'}；余波：${pressure.aftermath}`
          : `${character.name}：暂无压力记录。`,
      ),
    debts: debts.length ? debts : ['暂无剧情债务命中。'],
    hooks: hooks.length ? hooks : ['暂无明确钩子，建议在大纲预览中补齐回报窗口。'],
  }
}

const chapterContextPackForProject = (projectId: string, chapterId: string, mode: McpContextMode): ChapterContextPack => {
  const project = getProjectOrThrow(projectId)
  const chapter = chapterById(projectId, chapterId)
  if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
  const outlineNodes = state.outlineNodes.filter((item) => item.projectId === projectId).sort((a, b) => a.order - b.order)
  const chapterIssues = state.chapterIssues.filter((item) => item.projectId === projectId && item.chapterId === chapterId)
  const enabledStyleAssets = state.styleAssets.filter((item) => item.projectId === projectId && item.enabled)
  const estimatedTokens =
    900 +
    outlineNodes.length * 80 +
    enabledStyleAssets.length * 110 +
    state.characters.filter((item) => item.projectId === projectId).length * 140
  return {
    project,
    chapter,
    outlineNodes,
    chapterOutline: outlineNodes.find((item) => item.chapterId === chapterId),
    activeStyle: activeStyleForProject(projectId),
    enabledStyleAssets,
    characters: state.characters.filter((item) => item.projectId === projectId),
    worldFacts: state.worldFacts.filter((item) => item.projectId === projectId),
    sceneCards: chapter.sceneCards,
    chapterIssues,
    localChecks: state.localCheckResults.filter((item) => item.projectId === projectId && item.chapterId === chapterId).slice(0, 3),
    longState: longStateForProject(projectId),
    humanSummary: chapterHumanSummaryForProject(projectId, chapterId),
    generatedAt: now(),
    tokenPolicy: 'local_only',
    budget: {
      mode,
      estimatedTokens,
      hardLimit: mode === 'lite' ? 6000 : mode === 'full' ? 12000 : 24000,
    },
  }
}

const taskWriteBackTargets = (task: AiTask): AiTaskPackage['expectedWriteBack'] => {
  if (task.target === 'next_chapter' || task.target === 'rewrite_chapter') {
    return [
      { kind: 'chapter_version', title: '章节候选版本', description: '外部 AI 只回填候选版本，用户或规则确认后再定版。', required: true },
      { kind: 'world_fact', title: '候选事实', description: '新地点、规则、物件、能力、关系变化先进入候选事实或上下文沉淀。', required: false },
      { kind: 'snapshot', title: '高风险快照', description: '涉及 L3/L4 改动时写入快照或审稿报告，便于回滚和复核。', required: false },
      { kind: 'style', title: '风格观察', description: '若本次重写发现可复用样本或坏模式，可同时回填风格资产。', required: false },
    ]
  }
  if (task.target === 'style_extract' || task.target === 'style_process' || task.target === 'style_adjustment') {
    return [{ kind: 'style', title: '风格资产', description: '外部 AI 将提取结果、坏模式、禁止项或角色语气样本回填到风格库。', required: true }]
  }
  return [
    { kind: 'outline', title: '批次路线图', description: '外部 AI 回填下一阶段章节路线、检查点、风险和需要用户确认的高影响节点。', required: true },
    { kind: 'snapshot', title: '批次快照', description: '长篇批次规划完成后可写入快照，便于回滚和对比。', required: false },
  ]
}

const aiTaskPackageForProject = (projectId: string, taskId: string): AiTaskPackage => {
  const task = state.aiTasks.find((item) => item.projectId === projectId && item.id === taskId)
  if (!task) throw new Error(`AI task not found: ${taskId}`)
  const rewriteTask = task.rewriteTaskId
    ? state.rewriteTasks.find((item) => item.projectId === projectId && item.id === task.rewriteTaskId)
    : undefined
  const contextPack = task.chapterId ? chapterContextPackForProject(projectId, task.chapterId, task.contextMode) : undefined
  const resources = resourcePreviews(projectId).filter((item) => {
    if (task.target === 'style_extract' || task.target === 'style_process' || task.target === 'style_adjustment') {
      return ['project', 'style', 'chapter', 'character', 'world'].includes(item.kind)
    }
    if (task.target === 'next_10_chapters' || task.target === 'next_50_chapters' || task.target === 'next_100_chapters') {
      return ['project', 'outline', 'ledger', 'style', 'world', 'character'].includes(item.kind)
    }
    return ['project', 'outline', 'ledger', 'chapter', 'style', 'world', 'character'].includes(item.kind)
  })
  const queue = taskQueueForProject(projectId)
  const queueItem = queue.items.find((item) => item.task.id === task.id)
  return {
    id: `task-package-${task.id}`,
    projectId,
    task,
    taskUri: `novelforge://projects/${projectId}/ai-tasks/${task.id}`,
    queuePosition: queueItem?.order,
    queuePolicy: queue.policy,
    generatedAt: now(),
    contextPack,
    rewriteTask,
    styleLibrary: {
      profiles: state.styleProfiles.filter((item) => item.projectId === projectId),
      assets: state.styleAssets.filter((item) => item.projectId === projectId),
      activeProfileId: getProjectOrThrow(projectId).styleProfileId,
    },
    expectedReadResources: resources,
    expectedWriteBack: taskWriteBackTargets(task),
    mcpHints: [
      'App 不调用 AI；外部 AI 读取此任务包后在控制端完成生成、重写、提取或规划。',
      '所有写回必须先进入候选版本、风格资产、候选事实、审稿报告或快照记录。',
      '高风险事实、角色死亡、身份暴露、能力突破、时间线跳跃需要写入待确认项。',
      '涉及压力值越过阈值、破声点、剧情债务兑现或角色状态硬变化时，必须同步回填长篇状态。',
      '下一章、下 10 章、下 100 章任务需要保持章节功能、大纲承诺和回报窗口一致。',
    ],
    notes: [
      `检查策略：${reviewModeText(task.reviewMode)}`,
      `写作参考范围：${mcpContextModeText(task.contextMode)}`,
      `候选事实策略：${task.factStrategy}`,
      `压力记录：${state.pressures.filter((item) => item.projectId === projectId).length} 条`,
      `剧情债务：${state.debts.filter((item) => item.projectId === projectId).length} 条`,
      `伏笔记录：${state.foreshadows.filter((item) => item.projectId === projectId).length} 条`,
      rewriteTask ? `重写等级：${rewriteTask.level} / 范围：${rewriteTask.scope} / 模式：${rewriteTask.mode}` : '无重写条件绑定。',
    ],
  }
}

const statusTone = (status: string): ProjectCanvasNode['tone'] => {
  if (['committed', 'applied', 'done', 'completed'].includes(status)) return 'moss'
  if (['draft_complete_signal_received', 'draft_saved', 'context_ready', 'active'].includes(status)) return 'amber'
  if (['needs_review', 'paused', 'failed', 'danger', 'high'].includes(status)) return 'danger'
  if (['planning', 'planned', 'queued'].includes(status)) return 'copper'
  return 'paper'
}

const volumeForChapter = (outlineNodes: OutlineNode[], chapter: Chapter): OutlineNode | undefined => {
  const chapterOutline = outlineNodes.find((item) => item.kind === 'chapter' && item.chapterId === chapter.id)
  if (!chapterOutline) return outlineNodes.find((item) => item.kind === 'volume')
  let cursor: OutlineNode | undefined = chapterOutline
  while (cursor?.parentId) {
    const parent = outlineNodes.find((item) => item.id === cursor?.parentId)
    if (parent?.kind === 'volume') return parent
    cursor = parent
  }
  return outlineNodes.find((item) => item.kind === 'volume')
}

const buildProjectCanvas = (projectId: string): ProjectCanvas => {
  const project = getProjectOrThrow(projectId)
  const outlineNodes = state.outlineNodes.filter((item) => item.projectId === projectId).sort((a, b) => a.order - b.order)
  const chapters = state.chapters.filter((item) => item.projectId === projectId).sort((a, b) => a.index - b.index)
  const versions = state.chapterVersions.filter((item) => item.projectId === projectId)
  const tasks = state.aiTasks.filter((item) => item.projectId === projectId)
  const volumes = outlineNodes.filter((item) => item.kind === 'volume')
  const bookNode = outlineNodes.find((item) => item.kind === 'book')
  const fallbackVolume: OutlineNode = {
    id: `${projectId}-volume-fallback`,
    projectId,
    kind: 'volume',
    title: '未分卷章节',
    summary: '尚未绑定卷节点的章节会暂时进入这里。',
    goal: '等待外部 AI 或用户补齐卷目标。',
    conflict: '未分卷',
    payoff: '未分卷',
    status: 'planned',
    order: 9999,
    updatedAt: project.updatedAt,
  }
  const laneVolumes = volumes.length ? volumes : [fallbackVolume]
  const nodes: ProjectCanvasNode[] = []
  const edges: ProjectCanvasEdge[] = []
  const bookWidth = 340
  const volumeWidth = 340
  const chapterWidth = 300
  const taskWidth = 360
  const laneGap = 82
  const bookX = 70
  const volumeX = bookNode ? bookX + bookWidth + laneGap : 80
  const chapterStartX = volumeX + volumeWidth + laneGap
  const chapterStep = chapterWidth + laneGap
  const laneStartY = bookNode ? 300 : 250
  const laneStepY = 350

  if (bookNode) {
    nodes.push({
      id: `outline:${bookNode.id}`,
      kind: 'book',
      refId: bookNode.id,
      title: bookNode.title,
      subtitle: '全书承诺',
      status: bookNode.status,
      x: bookX,
      y: 108,
      width: bookWidth,
      height: 150,
      tone: 'moss',
      metrics: [
        { label: '卷', value: laneVolumes.length },
        { label: '章', value: chapters.length },
      ],
      badges: ['主线'],
      summary: bookNode.goal,
    })
  }

  laneVolumes.forEach((volume, volumeIndex) => {
    const y = laneStartY + volumeIndex * laneStepY
    const volumeChapters = chapters.filter((chapter) => {
      const mappedVolume = volumeForChapter(outlineNodes, chapter)
      return mappedVolume?.id === volume.id || (!volumes.length && volume.id === fallbackVolume.id)
    })
    const openAudits = state.auditReports.filter((item) => item.projectId === projectId && item.status === 'open' && (!item.chapterId || volumeChapters.some((chapter) => chapter.id === item.chapterId)))
    const debts = state.debts.filter((item) => item.projectId === projectId && ['high', 'danger', 'this_batch'].includes(item.severity))
    nodes.push({
      id: `outline:${volume.id}`,
      kind: 'volume',
      refId: volume.id,
      parentId: volume.parentId ? `outline:${volume.parentId}` : bookNode ? `outline:${bookNode.id}` : undefined,
      title: volume.title,
      subtitle: `${volume.status} / ${volumeChapters.length} 章`,
      status: volume.status,
      x: volumeX,
      y,
      width: volumeWidth,
      height: 190,
      tone: statusTone(volume.status),
      metrics: [
        { label: '章节', value: volumeChapters.length },
        { label: '风险', value: openAudits.length },
        { label: '债务', value: debts.length },
      ],
      badges: debts.length ? ['剧情债务'] : ['卷目标'],
      summary: volume.goal,
    })
    if (bookNode) edges.push({ id: `edge:${bookNode.id}:${volume.id}`, kind: 'outline', source: `outline:${bookNode.id}`, target: `outline:${volume.id}` })

    volumeChapters.forEach((chapter, chapterIndex) => {
      const chapterVersions = versions.filter((item) => item.chapterId === chapter.id)
      const appliedVersion = chapterVersions.find((item) => item.status === 'applied')
      const pendingFacts = state.candidateFacts.filter((item) => item.projectId === projectId && item.status === 'pending' && item.chapterId === chapter.id)
      const chapterAudits = state.auditReports.filter((item) => item.projectId === projectId && item.status === 'open' && item.chapterId === chapter.id)
      const latestCheck = state.localCheckResults.find((item) => item.projectId === projectId && item.chapterId === chapter.id)
      const chapterNodeId = `chapter:${chapter.id}`
      nodes.push({
        id: chapterNodeId,
        kind: 'chapter',
        refId: chapter.id,
        parentId: `outline:${volume.id}`,
        title: `第 ${chapter.index} 章`,
        subtitle: chapter.title,
        status: chapter.status,
        x: chapterStartX + chapterIndex * chapterStep,
        y,
        width: chapterWidth,
        height: 190,
        tone: chapterAudits.length || pendingFacts.some((item) => item.risk === 'high') ? 'danger' : statusTone(chapter.status),
        metrics: [
          { label: '字', value: chapter.wordCount },
          { label: '版本', value: chapterVersions.length },
          { label: '检查', value: latestCheck?.level ?? '-' },
        ],
        badges: [
          appliedVersion ? '已定版' : chapterVersions.length ? '候选' : '待外部 AI',
          pendingFacts.length ? `${pendingFacts.length} 事实` : '',
          chapterAudits.length ? `${chapterAudits.length} 风险` : '',
        ].filter(Boolean),
        summary: chapter.intention || chapter.summary,
        hasBody: Boolean(chapter.draft.trim() || chapter.wordCount > 0 || chapterVersions.some((version) => version.body.trim())),
      })
      edges.push({ id: `edge:${volume.id}:${chapter.id}`, kind: 'outline', source: `outline:${volume.id}`, target: chapterNodeId })
      const nextChapter = volumeChapters[chapterIndex + 1]
      if (nextChapter) edges.push({ id: `edge:flow:${chapter.id}:${nextChapter.id}`, kind: 'chapter_flow', source: chapterNodeId, target: `chapter:${nextChapter.id}` })
    })
  })

  tasks.slice(0, 12).forEach((task, taskIndex) => {
    const y = laneStartY + laneVolumes.length * 220 + Math.floor(taskIndex / 3) * 220
    const x = chapterStartX + (taskIndex % 3) * chapterStep
    const taskNodeId = `task:${task.id}`
    nodes.push({
      id: taskNodeId,
      kind: 'task',
      refId: task.id,
      title: task.title,
      subtitle: aiTaskTargetText(task.target),
      status: task.status,
      x,
      y,
      width: taskWidth,
      height: 190,
      tone: statusTone(task.status),
      metrics: [
        { label: '参考', value: mcpContextModeText(task.contextMode) },
        { label: '检查', value: reviewModeText(task.reviewMode) },
      ],
      badges: [task.status === 'completed' ? '已回填' : '待外部 AI'],
      summary: task.instruction,
    })
    if (task.chapterId) edges.push({ id: `edge:task:${task.id}:${task.chapterId}`, kind: 'task_target', source: taskNodeId, target: `chapter:${task.chapterId}`, animated: task.status !== 'completed' })
  })

  return {
    project,
    generatedAt: now(),
    nodes,
    edges,
    stats: {
      volumes: laneVolumes.length,
      chapters: chapters.length,
      tasks: tasks.filter((item) => item.status !== 'completed').length,
      pendingReviews: pendingReviews(projectId).length,
      versions: versions.length,
    },
  }
}

const canvasNodeDetailForProject = (projectId: string, nodeId: string): CanvasNodeDetail => {
  const canvas = buildProjectCanvas(projectId)
  const node = canvas.nodes.find((item) => item.id === nodeId)
  if (!node) throw new Error(`Canvas node not found: ${nodeId}`)
  const outline = node.id.startsWith('outline:') ? state.outlineNodes.find((item) => item.projectId === projectId && item.id === node.refId) : undefined
  const chapter = node.id.startsWith('chapter:') ? chapterById(projectId, node.refId) : undefined
  const task = node.id.startsWith('task:') ? state.aiTasks.find((item) => item.projectId === projectId && item.id === node.refId) : undefined
  const detailChapter = chapter ?? (task?.chapterId ? chapterById(projectId, task.chapterId) : undefined)
  return {
    node,
    project: getProjectOrThrow(projectId),
    outline,
    chapter: detailChapter,
    versions: detailChapter
      ? state.chapterVersions
          .filter((item) => item.projectId === projectId && item.chapterId === detailChapter.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [],
    tasks: state.aiTasks.filter((item) => item.projectId === projectId && (!detailChapter || item.chapterId === detailChapter.id || item.id === task?.id)),
    contextPack: detailChapter ? chapterContextPackForProject(projectId, detailChapter.id, 'full') : undefined,
    worldFacts: state.worldFacts.filter((item) => item.projectId === projectId),
    characters: state.characters.filter((item) => item.projectId === projectId),
    styleLibrary: {
      profiles: state.styleProfiles.filter((item) => item.projectId === projectId),
      assets: state.styleAssets.filter((item) => item.projectId === projectId),
      activeProfileId: getProjectOrThrow(projectId).styleProfileId,
    },
    localChecks: detailChapter ? state.localCheckResults.filter((item) => item.projectId === projectId && item.chapterId === detailChapter.id) : [],
    candidateFacts: state.candidateFacts.filter((item) => item.projectId === projectId && (!detailChapter || item.chapterId === detailChapter.id)),
    auditReports: state.auditReports.filter((item) => item.projectId === projectId && (!detailChapter || item.chapterId === detailChapter.id)),
    longState: longStateForProject(projectId),
    humanSummary: detailChapter ? chapterHumanSummaryForProject(projectId, detailChapter.id) : undefined,
  }
}

const makePreviewBody = (projectId: string, chapter: Chapter, label: string) => {
  const project = getProjectOrThrow(projectId)
  const outline = state.outlineNodes.find((item) => item.projectId === projectId && item.chapterId === chapter.id)
  const style = activeStyleForProject(projectId)
  return [
    `【${label}】${project.title} / 第 ${chapter.index} 章：${chapter.title}`,
    '',
    outline ? `本章目标：${outline.goal}` : `本章意图：${chapter.intention}`,
    style ? `风格锚点：${style.tone}` : '风格锚点：沿用当前项目风格。',
    '',
    '雪压着驿道，灯火在风里一寸寸缩小。沈砚没有立刻开口，他把信纸翻到背面，指腹停在断开的印记上。',
    '这不是迟到。迟到只会让人焦急，篡改才会让所有人朝错误的方向奔跑。',
    '',
    '他抬眼时，驿卒已经退到门边。那一刻，北境的寒意不再只是天气，而像一只手，按住了每一封本该抵达的信。',
  ].join('\n')
}

const browserPreviewMcpToolNames = [
  'novel_project_list',
  'novel_project_create',
  'novel_project_update',
  'novel_project_canvas_get',
  'novel_outline_node_upsert',
  'novel_outline_batch_upsert',
  'novel_outline_node_delete',
  'novel_context_pack_get',
  'novel_ai_workbench_get',
  'novel_ai_task_queue_get',
  'novel_ai_task_queue_reorder',
  'novel_ai_task_create',
  'novel_ai_task_delete',
  'novel_pending_reviews_get',
  'novel_pending_review_resolve',
  'novel_chapter_context_pack_get',
  'novel_ai_task_package_get',
  'novel_save_draft',
  'novel_submit_chapter_version',
  'novel_apply_chapter_version',
  'novel_submit_candidate_fact',
  'novel_world_fact_upsert',
  'novel_world_fact_delete',
  'novel_character_upsert',
  'novel_character_delete',
  'novel_character_relation_graph_get',
  'novel_character_relation_upsert',
  'novel_character_relation_delete',
  'novel_local_check_run',
  'novel_rewrite_prepare',
  'novel_rewrite_mark_complete',
  'novel_style_extract_prepare',
  'novel_style_library_get',
  'novel_style_profile_upsert',
  'novel_style_profile_bind',
  'novel_style_profile_delete',
  'novel_style_asset_submit',
  'novel_style_asset_set_enabled',
  'novel_style_asset_delete',
  'novel_style_template_list',
  'novel_style_template_upsert',
  'novel_style_template_delete',
  'novel_style_template_import',
  'novel_style_process_mark_complete',
  'novel_ai_task_backfill',
  'novel_snapshot_create',
  'novel_snapshot_restore',
  'novel_project_state_export',
  'novel_project_state_import',
  'novel_long_state_upsert',
  'novel_long_state_get',
  'novel_long_state_delete',
  'novel_export_plain_text',
]

const browserPreviewMcpTools: McpToolDefinition[] = browserPreviewMcpToolNames.map((name) => ({
  name,
  description: getDesktopMcpToolDisplayInfo(name)?.description ?? 'NovelForge MCP 工具。',
  inputSchema: {
    type: 'object',
    additionalProperties: true,
  },
}))

const resourcePreviews = (projectId: string): McpResourcePreview[] => {
  const project = getProjectOrThrow(projectId)
  const updatedAt = project.updatedAt
  return [
    {
      id: 'res-project',
      projectId,
      uri: `novelforge://projects/${projectId}`,
      kind: 'project',
      title: '项目基础状态',
      description: '项目名、题材、当前章、目标章数、检查策略和 AI 回填偏好。',
      items: 1,
      contextMode: 'lite',
      updatedAt,
    },
    {
      id: 'res-outline',
      projectId,
      uri: `novelforge://projects/${projectId}/outline`,
      kind: 'outline',
      title: '大纲与故事线',
      description: '全书承诺、卷目标、章节功能、故事线、伏笔、代价和剧情债务。',
      items: state.outlineNodes.filter((item) => item.projectId === projectId).length,
      contextMode: 'full',
      updatedAt,
    },
    {
      id: 'res-long-state',
      projectId,
      uri: `novelforge://projects/${projectId}/long-state`,
      kind: 'ledger',
      title: '长篇状态账本',
      description: '时间、消息、压力、破声点、伏笔、代价和剧情债务。',
      items:
        state.storyThreads.filter((item) => item.projectId === projectId).length +
        state.debts.filter((item) => item.projectId === projectId).length,
      contextMode: 'deep',
      updatedAt,
    },
    {
      id: 'res-chapters',
      projectId,
      uri: `novelforge://projects/${projectId}/chapters`,
      kind: 'chapter',
      title: '章节正文与版本',
      description: '章节正文、场景卡、候选版本、重写条件、定版状态和本地检查记录。',
      items: state.chapters.filter((item) => item.projectId === projectId).length,
      contextMode: 'full',
      updatedAt,
    },
    {
      id: 'res-style',
      projectId,
      uri: `novelforge://projects/${projectId}/style`,
      kind: 'style',
      title: '风格与对白资产',
      description: '项目风格、卷风格、角色语气、好段落样本、坏模式和禁止项，支持外部 AI 提取后回填。',
      items: state.styleAssets.filter((item) => item.projectId === projectId).length,
      contextMode: 'full',
      updatedAt,
    },
    {
      id: 'res-world',
      projectId,
      uri: `novelforge://projects/${projectId}/world-facts`,
      kind: 'world',
      title: '世界事实库',
      description: '随章节沉淀的规则、地点、势力、术语、能力和物件，供外部 AI 写作时约束事实。',
      items: state.worldFacts.filter((item) => item.projectId === projectId).length,
      contextMode: 'full',
      updatedAt,
    },
    {
      id: 'res-characters',
      projectId,
      uri: `novelforge://projects/${projectId}/characters`,
      kind: 'character',
      title: '角色关系与状态',
      description: '角色目标、知识边界、关系账本、压力值和对白语气约束。',
      items: state.characters.filter((item) => item.projectId === projectId).length,
      contextMode: 'full',
      updatedAt,
    },
    {
      id: 'res-writeback',
      projectId,
      uri: `novelforge://projects/${projectId}/writeback`,
      kind: 'version',
      title: '外部 AI 回填记录',
      description: '外部 AI 回填的章节版本、风格资产、候选事实、审稿报告和快照记录。',
      items: state.mcpWriteLogs.filter((item) => item.projectId === projectId).length,
      contextMode: 'deep',
      updatedAt,
    },
  ]
}

const pendingReviews = (projectId: string): AiPendingReview[] => [
  ...state.candidateFacts
    .filter((item) => item.projectId === projectId && item.status === 'pending')
    .map((item) => ({
      id: item.id,
      kind: 'candidate_fact' as const,
      title: item.title,
      body: item.body,
      severity: item.risk,
      createdAt: item.createdAt,
    })),
  ...state.auditReports
    .filter((item) => item.projectId === projectId && item.status === 'open')
    .map((item) => ({
      id: item.id,
      kind: 'audit_report' as const,
      title: item.title,
      body: item.items.join('；'),
      severity: item.severity,
      createdAt: item.createdAt,
    })),
  ...state.chapterIssues
    .filter((item) => item.projectId === projectId && item.status === 'open')
    .map((item) => ({
      id: item.id,
      kind: 'chapter_issue' as const,
      title: item.title,
      body: item.body,
      severity: item.severity,
      createdAt: item.createdAt,
    })),
]

const executableTaskStatuses: AiTaskStatus[] = ['queued', 'context_ready']
const taskQueuePolicy = [
  'AI task queue is the ordering source for external AI task pickup.',
  'External AI should read the next executable task package before writing back.',
  'Completed or manually blocked tasks stay visible but are not executable.',
  'Reordering changes queue priority only; it does not apply chapter text or settle facts.',
]

const taskBlockingReason = (task: AiTask, reviews: AiPendingReview[]) => {
  if (task.status === 'completed') return '已完成，保留在队列中作为回写记录。'
  if (task.status === 'needs_review') return '等待人工确认后才能继续执行。'
  if (task.autoPause === 'any_issue' && reviews.length) return '存在待确认项，按任务策略暂停。'
  if (
    task.autoPause === 'high_risk' &&
    reviews.some((review) => review.severity === 'high' || review.severity === 'danger')
  ) {
    return '存在高风险确认项，按任务策略暂停。'
  }
  return undefined
}

const sortedQueueTasks = (projectId: string) => {
  getProjectOrThrow(projectId)
  const tasks = state.aiTasks.filter((item) => item.projectId === projectId)
  let nextOrder = Math.max(0, ...tasks.map((task) => task.queueOrder ?? 0)) + 10
  tasks.forEach((task) => {
    if (typeof task.queueOrder !== 'number') {
      task.queueOrder = nextOrder
      nextOrder += 10
    }
  })
  return [...tasks].sort((a, b) => {
    const orderDiff = (a.queueOrder ?? 0) - (b.queueOrder ?? 0)
    if (orderDiff) return orderDiff
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

const taskQueueForProject = (projectId: string): AiTaskQueue => {
  const reviews = pendingReviews(projectId)
  const writes = state.mcpWriteLogs.filter((item) => item.projectId === projectId)
  const items = sortedQueueTasks(projectId).map((task, index) => {
    const blockedReason = taskBlockingReason(task, reviews)
    const latestWrite = writes.find((write) => write.taskId === task.id)
    return {
      task,
      order: index + 1,
      executable: executableTaskStatuses.includes(task.status) && !blockedReason,
      blockedReason,
      latestWrite,
      packageUri: `novelforge://projects/${projectId}/ai-tasks/${task.id}`,
    }
  })
  return {
    projectId,
    generatedAt: now(),
    nextTask: items.find((item) => item.executable),
    items,
    policy: taskQueuePolicy,
  }
}

const nextTaskQueueOrder = (projectId: string) => {
  const tasks = sortedQueueTasks(projectId)
  return Math.max(0, ...tasks.map((task) => task.queueOrder ?? 0)) + 10
}

const toPositiveInteger = (value: unknown) => {
  const numeric = Number(value)
  return Number.isInteger(numeric) && numeric > 0 ? numeric : undefined
}

const syncPreviewChapterFromOutlineNode = (projectId: string, payload: Record<string, unknown>) => {
  if (payload.kind !== 'chapter') return payload
  const chapterByPayloadId = typeof payload.chapterId === 'string'
    ? state.chapters.find((item) => item.projectId === projectId && item.id === payload.chapterId)
    : undefined
  const chapterIndex =
    toPositiveInteger(payload.chapterIndex) ??
    toPositiveInteger(payload.order) ??
    toPositiveInteger(chapterByPayloadId?.index)
  if (!chapterIndex) return payload

  const chapter = chapterByPayloadId ?? state.chapters.find((item) => item.projectId === projectId && item.index === chapterIndex)
  const updatedAt = now()
  if (chapter) {
    chapter.index = chapterIndex
    chapter.title = String(payload.title ?? chapter.title).trim() || chapter.title
    chapter.intention = String(payload.goal ?? chapter.intention ?? '').trim()
    chapter.summary = String(payload.summary ?? chapter.summary ?? '').trim()
    chapter.status = String(payload.chapterStatus ?? chapter.status ?? 'planned') as ChapterStatus
    chapter.updatedAt = updatedAt
    return { ...payload, chapterId: chapter.id, chapterIndex, order: payload.order ?? chapterIndex }
  }

  const chapterId = uid('chapter')
  state.chapters.push({
    id: chapterId,
    projectId,
    index: chapterIndex,
    title: String(payload.title ?? `Chapter ${chapterIndex}`).trim() || `Chapter ${chapterIndex}`,
    status: 'planned',
    intention: String(payload.goal ?? '').trim(),
    summary: String(payload.summary ?? '').trim(),
    draft: '',
    wordCount: 0,
    sceneCards: [],
    updatedAt,
  })
  return { ...payload, chapterId, chapterIndex, order: payload.order ?? chapterIndex }
}

export const browserPreviewNovelApi = {
  listProjects: () => asyncResult(() => state.projects.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))),

  createProject: (payload: Pick<NovelProject, 'title'> & Partial<Pick<NovelProject, 'description' | 'genre' | 'targetChapters'>>) =>
    asyncResult(() => {
      const createdAt = now()
      const project: NovelProject = {
        id: uid('project'),
        title: payload.title.trim(),
        description: payload.description?.trim() || '新的本地小说项目，等待外部 AI 通过 MCP 读取写作参考。',
        genre: payload.genre?.trim() || '未设定',
        status: 'planning',
        targetChapters: payload.targetChapters || 300,
        currentChapter: 1,
        createdAt,
        updatedAt: createdAt,
      }
      state.projects.unshift(project)
      state.chapters.unshift({
        id: uid('chapter'),
        projectId: project.id,
        index: 1,
        title: '第 1 章',
        status: 'queued',
        intention: '等待建立本章写作意图。',
        summary: '尚未生成。',
        draft: '',
        wordCount: 0,
        sceneCards: [],
        updatedAt: createdAt,
      })
      const defaultProfile: StyleProfile = {
        id: uid('style'),
        projectId: project.id,
        title: '项目默认风格',
        description: '新项目默认风格，可在风格与对白页面调整。',
        tone: '克制、清晰、以场景压力推动情绪。',
        source: 'custom',
        active: true,
        updatedAt: createdAt,
      }
      state.styleProfiles.unshift(defaultProfile)
      project.styleProfileId = defaultProfile.id
      persist()
      return project
    }),

  updateProject: (projectId: string, payload: Partial<Pick<NovelProject, 'title' | 'description' | 'genre' | 'status' | 'targetChapters' | 'currentChapter'>>) =>
    asyncResult(() => {
      const project = getProjectOrThrow(projectId)
      if (payload.title !== undefined) project.title = payload.title.trim() || project.title
      if (payload.description !== undefined) project.description = payload.description.trim()
      if (payload.genre !== undefined) project.genre = payload.genre.trim()
      if (payload.status !== undefined) project.status = payload.status
      if (payload.targetChapters !== undefined) project.targetChapters = Number(payload.targetChapters)
      if (payload.currentChapter !== undefined) project.currentChapter = Number(payload.currentChapter)
      project.updatedAt = now()
      addWriteLog(projectId, { kind: 'project_state', title: 'Project settings updated', summary: project.title, actor: 'codex' })
      persist()
      return project
    }),

  getProjectDashboard: (projectId: string) =>
    asyncResult<ProjectDashboard>(() => {
      const project = getProjectOrThrow(projectId)
      const chapters = state.chapters.filter((item) => item.projectId === projectId)
      const sortedChapters = [...chapters].sort((a, b) => b.index - a.index)
      const currentChapter =
        chapters.find((item) => item.index === project.currentChapter) ??
        sortedChapters.find((item) => item.status !== 'committed') ??
        sortedChapters[0]
      const pendingFacts = state.candidateFacts.filter(
        (item) => item.projectId === projectId && item.status === 'pending',
      )
      const auditReports = state.auditReports.filter((item) => item.projectId === projectId)
      const writeLogs = state.mcpWriteLogs
        .filter((item) => item.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return {
        project,
        stats: {
          chapters: chapters.length,
          worldFacts: state.worldFacts.filter((item) => item.projectId === projectId).length,
          characters: state.characters.filter((item) => item.projectId === projectId).length,
          pendingFacts: pendingFacts.length,
          auditIssues: auditReports.filter((item) => item.status === 'open').length,
          snapshots: state.snapshots.filter((item) => item.projectId === projectId).length,
          plotDebts: state.debts.filter((item) => item.projectId === projectId).length,
          pressureAlerts: state.pressures.filter((item) => item.projectId === projectId && item.value >= 60).length,
        },
        recentChapters: sortedChapters.slice(0, 5),
        currentChapter,
        activeStyle: activeStyleForProject(projectId),
        latestWrite: writeLogs[0],
        pendingFacts,
        auditReports,
        snapshots: state.snapshots.filter((item) => item.projectId === projectId).slice(0, 5),
        mcp: {
          status: 'ready',
          tools: browserPreviewMcpTools.length,
          mode: 'Electron 被动工作台 / 外部 AI Host 主控',
        },
      }
    }),

  getProjectCanvas: (projectId: string) => asyncResult<ProjectCanvas>(() => buildProjectCanvas(projectId)),

  getCanvasNodeDetail: (projectId: string, nodeId: string) =>
    asyncResult<CanvasNodeDetail>(() => canvasNodeDetailForProject(projectId, nodeId)),

  getAiWorkbench: (projectId: string) =>
    asyncResult<AiWorkbench>(() => {
      const project = getProjectOrThrow(projectId)
      const reviews = pendingReviews(projectId)
      const taskQueue = taskQueueForProject(projectId)
      const tasks = taskQueue.items.map((item) => item.task)
      const writeLogs = state.mcpWriteLogs.filter((item) => item.projectId === projectId)
      return {
        project,
        stats: {
          queuedTasks: tasks.filter((item) => item.status !== 'completed').length,
          contextResources: resourcePreviews(projectId).length,
          pendingReviews: reviews.length,
          recentWrites: writeLogs.length,
        },
        tasks,
        taskQueue,
        runs: state.aiRuns.filter((item) => item.projectId === projectId),
        writeLogs,
        resourcePreviews: resourcePreviews(projectId),
        pendingReviews: reviews,
      }
    }),

  getPendingReviews: (projectId: string) => asyncResult<AiPendingReview[]>(() => pendingReviews(projectId)),

  listWorldFacts: (projectId: string) =>
    asyncResult(() => state.worldFacts.filter((item) => item.projectId === projectId)),

  saveWorldFact: (projectId: string, payload: Omit<WorldFact, 'id' | 'projectId' | 'updatedAt'> & { id?: string }) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const fact: WorldFact = { ...payload, id: payload.id || uid('fact'), projectId, updatedAt: now() }
      const index = state.worldFacts.findIndex((item) => item.projectId === projectId && item.id === fact.id)
      if (index >= 0) state.worldFacts[index] = fact
      else state.worldFacts.unshift(fact)
      addWriteLog(projectId, { kind: 'world_fact', title: '世界事实已更新', summary: fact.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return fact
    }),

  deleteWorldFact: (projectId: string, factId: string) =>
    asyncResult(() => {
      state.worldFacts = state.worldFacts.filter((item) => !(item.projectId === projectId && item.id === factId))
      touchProject(projectId)
      persist()
      return true
    }),

  listCharacters: (projectId: string) =>
    asyncResult(() => state.characters.filter((item) => item.projectId === projectId)),

  saveCharacter: (
    projectId: string,
    payload: Omit<CharacterProfile, 'id' | 'projectId' | 'updatedAt'> & { id?: string },
  ) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const character: CharacterProfile = { ...payload, id: payload.id || uid('char'), projectId, updatedAt: now() }
      const index = state.characters.findIndex((item) => item.projectId === projectId && item.id === character.id)
      if (index >= 0) state.characters[index] = character
      else state.characters.unshift(character)
      addWriteLog(projectId, { kind: 'character', title: '角色状态已更新', summary: character.name, actor: 'human' })
      touchProject(projectId)
      persist()
      return character
    }),

  deleteCharacter: (projectId: string, characterId: string) =>
    asyncResult(() => {
      state.characters = state.characters.filter((item) => !(item.projectId === projectId && item.id === characterId))
      state.characterRelations = state.characterRelations.filter(
        (item) => !(item.projectId === projectId && (item.sourceCharacterId === characterId || item.targetCharacterId === characterId)),
      )
      touchProject(projectId)
      persist()
      return true
    }),

  getCharacterRelationGraph: (projectId: string) =>
    asyncResult<CharacterRelationGraph>(() => characterRelationGraphForProject(projectId)),

  listCharacterRelations: (projectId: string) =>
    asyncResult(() => state.characterRelations.filter((item) => item.projectId === projectId)),

  saveCharacterRelation: (
    projectId: string,
    payload: Omit<CharacterRelation, 'id' | 'projectId' | 'updatedAt'> & { id?: string },
  ) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const relation: CharacterRelation = { ...payload, id: payload.id || uid('relation'), projectId, updatedAt: now() }
      const index = state.characterRelations.findIndex((item) => item.projectId === projectId && item.id === relation.id)
      if (index >= 0) state.characterRelations[index] = relation
      else state.characterRelations.unshift(relation)
      addWriteLog(projectId, { kind: 'character', title: '角色关系已更新', summary: relation.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return relation
    }),

  deleteCharacterRelation: (projectId: string, relationId: string) =>
    asyncResult(() => {
      state.characterRelations = state.characterRelations.filter((item) => !(item.projectId === projectId && item.id === relationId))
      addWriteLog(projectId, { kind: 'character', title: '角色关系已移除', summary: relationId, actor: 'human' })
      touchProject(projectId)
      persist()
      return characterRelationGraphForProject(projectId)
    }),

  listChapters: (projectId: string) =>
    asyncResult(() => state.chapters.filter((item) => item.projectId === projectId).sort((a, b) => a.index - b.index)),

  createChapter: (projectId: string) =>
    asyncResult(() => {
      const chapters = state.chapters.filter((item) => item.projectId === projectId)
      const index = Math.max(0, ...chapters.map((item) => item.index)) + 1
      const chapter: Chapter = {
        id: uid('chapter'),
        projectId,
        index,
        title: `第 ${index} 章`,
        status: 'queued',
        intention: '等待外部 AI 读取写作参考后生成。',
        summary: '待规划。',
        draft: '',
        wordCount: 0,
        sceneCards: [],
        updatedAt: now(),
      }
      state.chapters.push(chapter)
      getProjectOrThrow(projectId).currentChapter = index
      touchProject(projectId)
      persist()
      return chapter
    }),

  saveDraft: (
    projectId: string,
    chapterId: string,
    payload: { title?: string; status?: ChapterStatus; intention?: string; summary?: string; draft: string; sceneCards?: SceneCard[] },
  ) =>
    asyncResult(() => {
      const chapter = chapterById(projectId, chapterId)
      if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
      chapter.title = payload.title?.trim() || chapter.title
      chapter.status = payload.status ?? 'draft_saved'
      chapter.intention = payload.intention ?? chapter.intention
      chapter.summary = payload.summary ?? chapter.summary
      chapter.draft = payload.draft
      chapter.wordCount = wordCount(payload.draft)
      if (payload.sceneCards) chapter.sceneCards = payload.sceneCards
      chapter.updatedAt = now()
      state.chapterVersions.unshift({
        id: uid('version'),
        projectId,
        chapterId,
        title: `手动保存 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
        kind: 'manual',
        status: 'candidate',
        body: payload.draft,
        summary: chapter.summary,
        wordCount: chapter.wordCount,
        source: '手动编辑',
        createdAt: now(),
      })
      touchProject(projectId)
      persist()
      return chapter
    }),

  listChapterVersions: (projectId: string, chapterId: string) =>
    asyncResult(() =>
      state.chapterVersions
        .filter((item) => item.projectId === projectId && item.chapterId === chapterId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ),

  saveChapterVersion: (
    projectId: string,
    chapterId: string,
    payload: { title?: string; body: string; summary?: string; source?: string; kind?: ChapterVersionKind },
  ) =>
    asyncResult(() => {
      const chapter = chapterById(projectId, chapterId)
      if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
      const version: ChapterVersion = {
        id: uid('version'),
        projectId,
        chapterId,
        title: payload.title?.trim() || `外部 AI 回写 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
        kind: payload.kind ?? 'external',
        status: 'candidate',
        body: payload.body.trim(),
        summary: payload.summary?.trim() || chapter.summary || '外部 AI Host 回写的候选正文。',
        wordCount: wordCount(payload.body),
        source: payload.source?.trim() || '外部 AI 回写',
        createdAt: now(),
      }
      state.chapterVersions.unshift(version)
      chapter.status = 'draft_complete_signal_received'
      chapter.updatedAt = now()
      addWriteLog(projectId, { kind: 'chapter_version', title: `第 ${chapter.index} 章候选版本写入`, summary: version.title, actor: 'codex' })
      touchProject(projectId)
      persist()
      return version
    }),

  generateDraftCandidate: (projectId: string, chapterId: string) =>
    asyncResult(() => {
      const chapter = chapterById(projectId, chapterId)
      if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
      const body = makePreviewBody(projectId, chapter, '外部 AI 回写正文')
      const version: ChapterVersion = {
        id: uid('version'),
        projectId,
        chapterId,
        title: `外部 AI 回填候选 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
        kind: 'generated',
        status: 'candidate',
        body,
        summary: '本地生成的候选正文，不自动覆盖当前正文。',
        wordCount: wordCount(body),
        source: '外部 AI 回写',
        createdAt: now(),
      }
      state.chapterVersions.unshift(version)
      chapter.status = 'draft_complete_signal_received'
      chapter.updatedAt = now()
      addWriteLog(projectId, {
        kind: 'chapter_version',
        title: `第 ${chapter.index} 章外部 AI 回填候选`,
        summary: version.title,
        actor: 'system',
      })
      touchProject(projectId)
      persist()
      return version
    }),

  createRewriteTask: (projectId: string, chapterId: string, payload: { scope: RewriteScope; reason: string; mode: RewriteMode; level: RewriteLevel }) =>
    asyncResult(() => {
      const chapter = chapterById(projectId, chapterId)
      if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
      const task: RewriteTask = {
        id: uid('rewrite'),
        projectId,
        chapterId,
        scope: payload.scope,
        reason: payload.reason || '调整正文表达',
        mode: payload.mode,
        level: payload.level,
        status: 'requested',
        createdAt: now(),
      }
      const aiTask: AiTask = {
        id: uid('task'),
        projectId,
        title: `外部 AI 重写第 ${chapter.index} 章`,
        target: 'rewrite_chapter',
        status: 'context_ready',
        queueOrder: nextTaskQueueOrder(projectId),
        contextMode: payload.level === 'L4' ? 'deep' : payload.level === 'L0' || payload.level === 'L1' ? 'lite' : 'full',
        reviewMode: payload.level === 'L4' || payload.level === 'L3' ? 'strict' : 'token_saver',
        factStrategy: payload.level === 'L4' ? 'conservative' : 'balanced',
        checkpointEvery: 1,
        autoPause: payload.level === 'L4' ? 'any_issue' : 'high_risk',
        chapterId,
        rewriteTaskId: task.id,
        instruction: [
          `重写范围：${payload.scope}`,
          `重写模式：${payload.mode}`,
          `影响等级：${payload.level}`,
          `用户建议：${task.reason}`,
          '只通过 MCP 回填候选版本，不直接覆盖当前正文。',
        ].join('\n'),
        createdAt: now(),
        updatedAt: now(),
      }
      task.aiTaskId = aiTask.id
      state.rewriteTasks.unshift(task)
      state.aiTasks.unshift(aiTask)
      addWriteLog(projectId, { taskId: aiTask.id, kind: 'ai_task', title: `第 ${chapter.index} 章重写条件已提交`, summary: task.reason, actor: 'human' })
      touchProject(projectId)
      persist()
      return { task, aiTask }
    }),

  applyChapterVersion: (projectId: string, chapterId: string, versionId: string) =>
    asyncResult(() => {
      const chapter = chapterById(projectId, chapterId)
      if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
      const version = state.chapterVersions.find((item) => item.projectId === projectId && item.chapterId === chapterId && item.id === versionId)
      if (!version) throw new Error(`Chapter version not found: ${versionId}`)
      state.snapshots.unshift({
        id: uid('snapshot'),
        projectId,
        chapterId,
        versionId,
        payload: clone(projectSnapshotPayload(projectId)),
        title: `应用版本前快照：第 ${chapter.index} 章`,
        reason: `准备应用版本「${version.title}」，保留当前正文用于回滚。`,
        createdAt: now(),
      })
      state.chapterVersions.forEach((item) => {
        if (item.projectId === projectId && item.chapterId === chapterId && item.status === 'applied') item.status = 'archived'
      })
      version.status = 'applied'
      chapter.draft = version.body
      chapter.summary = version.summary
      chapter.wordCount = version.wordCount
      chapter.status = 'committed'
      chapter.updatedAt = now()
      const task = state.rewriteTasks.find((item) => item.versionId === versionId)
      if (task) task.status = 'applied'
      addWriteLog(projectId, { taskId: task?.id, kind: 'chapter_final', title: `第 ${chapter.index} 章已定版`, summary: version.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return chapter
    }),

  runLocalChapterCheck: (projectId: string, chapterId: string, payload: { draft: string }) =>
    asyncResult(() => {
      const chapter = chapterById(projectId, chapterId)
      if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)
      const issues: LocalCheckIssue[] = []
      const before = chapter.draft || ''
      const after = payload.draft || ''
      const beforeCount = Math.max(1, wordCount(before))
      const afterCount = wordCount(after)
      const ratio = Math.abs(afterCount - beforeCount) / beforeCount
      if (ratio > 0.45) {
        issues.push({
          id: uid('check-issue'),
          category: 'word_count',
          severity: 'warning',
          level: 'L2',
          title: '字数变化较大',
          body: '本地 diff 发现正文长度变化超过 45%，建议确认是否仍是表达层修改。',
          evidence: `${beforeCount} -> ${afterCount}`,
        })
      }
      if (before && after && before.slice(0, 12) !== after.slice(0, 12)) {
        issues.push({
          id: uid('check-issue'),
          category: 'chapter_boundary',
          severity: 'warning',
          level: 'L3',
          title: '章首发生变化',
          body: '章首通常承担前桥接契约，修改后建议检查前章衔接。',
        })
      }
      const lockedFacts = state.worldFacts.filter((item) => item.projectId === projectId && item.locked)
      lockedFacts.forEach((fact) => {
        if (before.includes(fact.title) && !after.includes(fact.title)) {
          issues.push({
            id: uid('check-issue'),
            category: 'locked_fact',
            severity: 'danger',
            level: 'L4',
            title: '锁定事实可能被删除',
            body: `正文中不再出现锁定事实「${fact.title}」。`,
          })
        }
      })
      const riskWords = ['死亡', '失忆', '突破', '抵达', '收到密信', '暴露身份', '背叛', '黑塔印记']
      const foundRisk = riskWords.filter((word) => !before.includes(word) && after.includes(word))
      if (foundRisk.length) {
        issues.push({
          id: uid('check-issue'),
          category: 'risk_keyword',
          severity: 'danger',
          level: 'L4',
          title: '出现高风险剧情词',
          body: '这些词可能改变事实、代价、关系或后文依赖。',
          evidence: foundRisk.join('、'),
        })
      }
      const newTerms = ['塔心', '禁门', '王印', '密信'].filter((word) => !before.includes(word) && after.includes(word))
      if (newTerms.length) {
        issues.push({
          id: uid('check-issue'),
          category: 'new_entity',
          severity: 'warning',
          level: 'L2',
          title: '疑似新增术语或物件',
          body: '可能只是修辞，也可能需要进入候选事实。',
          evidence: newTerms.join('、'),
        })
      }
      const breakpointWords = ['崩溃', '失控', '破防', '喊出真相', '爆发', '决裂', '昏迷', '跪下', '认输', '暴走']
      const foundBreakpoints = breakpointWords.filter((word) => !before.includes(word) && after.includes(word))
      if (foundBreakpoints.length) {
        issues.push({
          id: uid('check-issue'),
          category: 'breakpoint',
          severity: 'danger',
          level: 'L4',
          title: '疑似新增破声点',
          body: '破声点会改变角色压力释放、关系走向和后续回报窗口，需要外部 AI 在回填时同步更新长篇状态。',
          evidence: foundBreakpoints.join('、'),
        })
      }
      const pressureRecords = state.pressures.filter((item) => item.projectId === projectId)
      const activePressureNames = pressureRecords
        .filter((item) => item.value >= item.threshold * 0.85 || item.status === 'breakpoint')
        .map((item) => state.characters.find((character) => character.id === item.characterId)?.name)
        .filter(Boolean) as string[]
      const touchedPressureNames = activePressureNames.filter((name) => after.includes(name))
      if (touchedPressureNames.length && foundBreakpoints.length === 0 && ['沉默', '平静', '释然', '无事'].some((word) => after.includes(word))) {
        issues.push({
          id: uid('check-issue'),
          category: 'pressure_curve',
          severity: 'warning',
          level: 'L3',
          title: '高压角色被低成本释放',
          body: '当前角色压力接近或已经越过阈值，若正文让其突然平静，需要回填压力值、余波或破声点处理。',
          evidence: touchedPressureNames.join('、'),
        })
      }
      const highDebts = state.debts.filter((item) => item.projectId === projectId && ['high', 'danger', 'this_batch'].includes(item.severity))
      const payoffWords = ['真相', '揭开', '摊牌', '解决', '还清', '偿还', '兑现', '了结']
      const hasPayoffSignal = payoffWords.some((word) => !before.includes(word) && after.includes(word))
      if (hasPayoffSignal && highDebts.length) {
        issues.push({
          id: uid('check-issue'),
          category: 'plot_debt',
          severity: 'warning',
          level: 'L3',
          title: '可能触发剧情债务回报',
          body: '正文出现真相、摊牌、偿还或兑现类信号；若涉及已有债务，需要外部 AI 回填剧情债务状态和快照。',
          evidence: highDebts.map((item) => item.title).slice(0, 3).join('、'),
        })
      }
      const characterStateWords = ['死亡', '重伤', '失忆', '突破', '叛变', '暴露身份', '离队', '入魔', '背叛']
      const affectedCharacters = state.characters
        .filter((item) => item.projectId === projectId && after.includes(item.name))
        .map((item) => item.name)
      const stateSignals = characterStateWords.filter((word) => !before.includes(word) && after.includes(word))
      if (affectedCharacters.length && stateSignals.length) {
        issues.push({
          id: uid('check-issue'),
          category: 'character_state',
          severity: 'danger',
          level: 'L4',
          title: '角色状态可能发生硬变化',
          body: '角色死亡、重伤、失忆、突破、离队或身份暴露都必须回填角色状态、知识边界和后续依赖。',
          evidence: `${affectedCharacters.slice(0, 3).join('、')} / ${stateSignals.join('、')}`,
        })
      }
      issues.push({
        id: uid('check-issue'),
        category: 'index_dirty',
        severity: 'info',
        level: 'L0',
        title: '索引需要稍后重建',
        body: '保存正文后，章节索引、全文索引和候选事实抽取应标记为 dirty。',
      })
      const maxLevel = issues.some((item) => item.level === 'L4')
        ? 'L4'
        : issues.some((item) => item.level === 'L3')
          ? 'L3'
          : issues.some((item) => item.level === 'L2')
            ? 'L2'
            : issues.some((item) => item.level === 'L1')
              ? 'L1'
              : 'L0'
      const result: LocalCheckResult = {
        id: uid('check'),
        projectId,
        chapterId,
        level: maxLevel,
        requiresConfirmation: maxLevel === 'L2' || maxLevel === 'L3' || maxLevel === 'L4',
        tokenPolicy: 'local_only',
        suggestedAction: maxLevel === 'L0' || maxLevel === 'L1' ? 'direct_save' : 'confirm_save',
        issues,
        createdAt: now(),
      }
      state.localCheckResults.unshift(result)
      if (maxLevel === 'L3' || maxLevel === 'L4') {
        state.auditReports.unshift({
          id: uid('audit'),
          projectId,
          chapterId,
          title: `本地检查 ${maxLevel}：第 ${chapter.index} 章需要复核`,
          stage: 'postcheck',
          severity: maxLevel === 'L4' ? 'danger' : 'warning',
          status: 'open',
          items: issues.filter((item) => item.level === 'L3' || item.level === 'L4').map((item) => `${item.title}：${item.body}`),
          createdAt: now(),
        })
      }
      persist()
      return result
    }),

  listLocalCheckResults: (projectId: string, chapterId?: string) =>
    asyncResult(() =>
      state.localCheckResults
        .filter((item) => item.projectId === projectId && (!chapterId || item.chapterId === chapterId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ),

  listStyleProfiles: (projectId: string) =>
    asyncResult<StyleLibrary>(() => ({
      profiles: state.styleProfiles.filter((item) => item.projectId === projectId),
      assets: state.styleAssets.filter((item) => item.projectId === projectId),
      activeProfileId: getProjectOrThrow(projectId).styleProfileId,
    })),

  listStyleAssetTemplates: () =>
    asyncResult<StyleAssetTemplate[]>(() => state.styleAssetTemplates.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))),

  saveStyleAssetTemplate: (payload: Omit<StyleAssetTemplate, 'id' | 'updatedAt'> & { id?: string }) =>
    asyncResult(() => {
      const template: StyleAssetTemplate = {
        ...payload,
        id: payload.id || uid('style-template'),
        title: payload.title.trim(),
        body: payload.body.trim(),
        scope: payload.scope.trim() || '全书',
        tags: payload.tags.map((tag) => tag.trim()).filter(Boolean),
        updatedAt: now(),
      }
      const index = state.styleAssetTemplates.findIndex((item) => item.id === template.id)
      if (index >= 0) state.styleAssetTemplates[index] = template
      else state.styleAssetTemplates.unshift(template)
      persist()
      return template
    }),

  deleteStyleAssetTemplate: (templateId: string) =>
    asyncResult(() => {
      state.styleAssetTemplates = state.styleAssetTemplates.filter((item) => item.id !== templateId)
      persist()
      return true
    }),

  importStyleAssetTemplate: (projectId: string, templateId: string, options: { enabled?: boolean } = {}) =>
    asyncResult(() => {
      const project = getProjectOrThrow(projectId)
      const template = state.styleAssetTemplates.find((item) => item.id === templateId)
      if (!template) throw new Error(`Style template not found: ${templateId}`)
      const existing = state.styleAssets.find(
        (item) =>
          item.projectId === projectId &&
          (item.templateId === templateId || (item.kind === template.kind && item.title === template.title && item.body === template.body)),
      )
      if (existing) {
        if (typeof options.enabled === 'boolean' && existing.enabled !== options.enabled) {
          existing.enabled = options.enabled
          existing.updatedAt = now()
          addWriteLog(projectId, { kind: 'style', title: options.enabled ? '风格资产已应用' : '风格资产已停用', summary: existing.title, actor: 'human' })
          touchProject(projectId)
          persist()
        }
        return existing
      }
      const asset: StyleAsset = {
        id: uid('asset'),
        projectId,
        profileId: project.styleProfileId,
        templateId: template.id,
        kind: template.kind,
        title: template.title,
        body: template.body,
        scope: template.scope,
        source: template.source,
        enabled: options.enabled ?? true,
        updatedAt: now(),
      }
      state.styleAssets.unshift(asset)
      addWriteLog(projectId, { kind: 'style', title: '已从全局风格库引入模板', summary: asset.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return asset
    }),

  setStyleAssetEnabled: (projectId: string, assetId: string, enabled: boolean) =>
    asyncResult(() => {
      const asset = state.styleAssets.find((item) => item.projectId === projectId && item.id === assetId)
      if (!asset) throw new Error(`Style asset not found: ${assetId}`)
      asset.enabled = enabled
      asset.updatedAt = now()
      addWriteLog(projectId, { kind: 'style', title: enabled ? '风格资产已应用' : '风格资产已停用', summary: asset.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return asset
    }),

  saveStyleProfile: (projectId: string, payload: Omit<StyleProfile, 'id' | 'projectId' | 'updatedAt'> & { id?: string }) =>
    asyncResult(() => {
      const project = getProjectOrThrow(projectId)
      const profile: StyleProfile = { ...payload, id: payload.id || uid('style'), projectId, updatedAt: now() }
      if (profile.active) {
        state.styleProfiles.forEach((item) => {
          if (item.projectId === projectId) item.active = false
        })
        project.styleProfileId = profile.id
      }
      const index = state.styleProfiles.findIndex((item) => item.projectId === projectId && item.id === profile.id)
      if (index >= 0) state.styleProfiles[index] = profile
      else state.styleProfiles.unshift(profile)
      touchProject(projectId)
      persist()
      return profile
    }),

  bindProjectStyle: (projectId: string, profileId: string) =>
    asyncResult(() => {
      const project = getProjectOrThrow(projectId)
      const profile = state.styleProfiles.find((item) => item.projectId === projectId && item.id === profileId)
      if (!profile) throw new Error(`Style profile not found: ${profileId}`)
      state.styleProfiles.forEach((item) => {
        if (item.projectId === projectId) item.active = item.id === profileId
      })
      project.styleProfileId = profileId
      addWriteLog(projectId, { kind: 'style', title: '当前风格方案已切换', summary: profile.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return profile
    }),

  deleteStyleProfile: (projectId: string, profileId: string) =>
    asyncResult(() => {
      const project = getProjectOrThrow(projectId)
      if (project.styleProfileId === profileId) throw new Error('当前启用的风格方案不能删除。')
      const profile = state.styleProfiles.find((item) => item.projectId === projectId && item.id === profileId)
      if (!profile) throw new Error(`Style profile not found: ${profileId}`)
      state.styleProfiles = state.styleProfiles.filter((item) => !(item.projectId === projectId && item.id === profileId))
      state.styleAssets.forEach((asset) => {
        if (asset.projectId === projectId && asset.profileId === profileId) asset.profileId = project.styleProfileId
      })
      addWriteLog(projectId, { kind: 'style', title: '风格方案已删除', summary: profile.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return true
    }),

  saveStyleAsset: (projectId: string, payload: Omit<StyleAsset, 'id' | 'projectId' | 'updatedAt'> & { id?: string }) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const asset: StyleAsset = { ...payload, id: payload.id || uid('asset'), projectId, updatedAt: now() }
      const index = state.styleAssets.findIndex((item) => item.projectId === projectId && item.id === asset.id)
      if (index >= 0) state.styleAssets[index] = asset
      else state.styleAssets.unshift(asset)
      addWriteLog(projectId, { kind: 'style', title: '风格资产已更新', summary: asset.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return asset
    }),

  deleteStyleAsset: (projectId: string, assetId: string) =>
    asyncResult(() => {
      state.styleAssets = state.styleAssets.filter((item) => !(item.projectId === projectId && item.id === assetId))
      touchProject(projectId)
      persist()
      return true
    }),

  listChapterIssues: (projectId: string, chapterId?: string) =>
    asyncResult(() => state.chapterIssues.filter((item) => item.projectId === projectId && (!chapterId || item.chapterId === chapterId))),

  submitCandidateFact: (projectId: string, payload: Omit<CandidateFact, 'id' | 'projectId' | 'status' | 'createdAt'>) =>
    asyncResult(() => {
      const fact: CandidateFact = { ...payload, id: uid('candidate'), projectId, status: 'pending', createdAt: now() }
      state.candidateFacts.unshift(fact)
      touchProject(projectId)
      persist()
      return fact
    }),

  confirmCandidateFact: (projectId: string, candidateId: string, decision: Exclude<CandidateFactStatus, 'pending'>) =>
    asyncResult(() => {
      const candidate = state.candidateFacts.find((item) => item.projectId === projectId && item.id === candidateId)
      if (!candidate) throw new Error(`Candidate fact not found: ${candidateId}`)
      candidate.status = decision
      if (decision === 'confirmed') {
        state.worldFacts.unshift({
          id: uid('fact'),
          projectId,
          kind: candidate.kind,
          title: candidate.title,
          body: candidate.body,
          source: candidate.source,
          locked: candidate.risk === 'high',
          updatedAt: now(),
        })
      }
      addWriteLog(projectId, {
        kind: 'world_fact',
        title: decision === 'confirmed' ? '候选事实已沉淀' : '候选事实已忽略',
        summary: candidate.title,
        actor: 'human',
      })
      touchProject(projectId)
      persist()
      return candidate
    }),

  settleCandidateFacts: (
    projectId: string,
    options: { risks?: CandidateRisk[]; decision?: Exclude<CandidateFactStatus, 'pending'> } = {},
  ) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const risks = options.risks ?? ['low', 'medium']
      const decision = options.decision ?? 'confirmed'
      const candidates = state.candidateFacts.filter((item) => item.projectId === projectId && item.status === 'pending' && risks.includes(item.risk))
      candidates.forEach((candidate) => {
        candidate.status = decision
        if (decision === 'confirmed') {
          state.worldFacts.unshift({
            id: uid('fact'),
            projectId,
            kind: candidate.kind,
            title: candidate.title,
            body: candidate.body,
            source: candidate.source,
            locked: false,
            updatedAt: now(),
          })
        }
      })
      if (candidates.length) {
        addWriteLog(projectId, {
          kind: 'world_fact',
          title: decision === 'confirmed' ? '候选事实已批量沉淀' : '候选事实已批量忽略',
          summary: candidates.map((item) => item.title).join('、'),
          actor: 'codex',
        })
      }
      touchProject(projectId)
      persist()
      return candidates
    }),

  listAuditReports: (projectId: string) => asyncResult(() => state.auditReports.filter((item) => item.projectId === projectId)),

  resolveAuditReport: (projectId: string, reportId: string) =>
    asyncResult(() => {
      const report = state.auditReports.find((item) => item.projectId === projectId && item.id === reportId)
      if (!report) throw new Error(`Audit report not found: ${reportId}`)
      report.status = 'resolved'
      addWriteLog(projectId, { kind: 'ledger', title: '审稿报告已解决', summary: report.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return report
    }),

  resolveOpenAuditReports: (projectId: string) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const reports = state.auditReports.filter((item) => item.projectId === projectId && item.status === 'open')
      reports.forEach((report) => {
        report.status = 'resolved'
      })
      if (reports.length) {
        addWriteLog(projectId, {
          kind: 'ledger',
          title: '审稿报告已批量解决',
          summary: reports.map((item) => item.title).join('、'),
          actor: 'human',
        })
      }
      touchProject(projectId)
      persist()
      return reports
    }),

  listProjectOutline: (projectId: string, chapterId?: string) =>
    asyncResult<ProjectOutline>(() => ({
      nodes: state.outlineNodes.filter((item) => item.projectId === projectId).sort((a, b) => a.order - b.order),
      activeChapterNode: state.outlineNodes.find((item) => item.projectId === projectId && item.chapterId === chapterId),
    })),

  saveOutlineNode: (projectId: string, payload: Omit<OutlineNode, 'id' | 'projectId' | 'updatedAt'> & { id?: string }) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const normalized = syncPreviewChapterFromOutlineNode(projectId, payload as Record<string, unknown>)
      const node: OutlineNode = { ...(normalized as Omit<OutlineNode, 'id' | 'projectId' | 'updatedAt'>), id: payload.id || uid('outline'), projectId, updatedAt: now() }
      const index = state.outlineNodes.findIndex((item) => item.projectId === projectId && item.id === node.id)
      if (index >= 0) state.outlineNodes[index] = node
      else state.outlineNodes.push(node)
      addWriteLog(projectId, { kind: 'outline', title: 'Outline node saved', summary: node.title, actor: 'codex' })
      touchProject(projectId)
      persist()
      return node
    }),

  saveOutlineBatch: (projectId: string, payload: { project?: Record<string, unknown>; nodes?: Array<Record<string, unknown>> }) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      if (payload.project) {
        const project = getProjectOrThrow(projectId)
        const patch = payload.project as Partial<Pick<NovelProject, 'title' | 'description' | 'genre' | 'status' | 'targetChapters' | 'currentChapter'>>
        if (patch.title !== undefined) project.title = String(patch.title).trim() || project.title
        if (patch.description !== undefined) project.description = String(patch.description).trim()
        if (patch.genre !== undefined) project.genre = String(patch.genre).trim()
        if (patch.status !== undefined) project.status = patch.status
        if (patch.targetChapters !== undefined) project.targetChapters = Number(patch.targetChapters)
        if (patch.currentChapter !== undefined) project.currentChapter = Number(patch.currentChapter)
        project.updatedAt = now()
      }
      const savedNodes: OutlineNode[] = []
      for (const rawNode of payload.nodes ?? []) {
        const normalized = syncPreviewChapterFromOutlineNode(projectId, rawNode)
        const id = typeof normalized.id === 'string' && normalized.id ? normalized.id : uid('outline')
        const node = { ...normalized, id, projectId, updatedAt: now() } as OutlineNode
        const index = state.outlineNodes.findIndex((item) => item.projectId === projectId && item.id === node.id)
        if (index >= 0) state.outlineNodes[index] = node
        else state.outlineNodes.push(node)
        savedNodes.push(node)
      }
      addWriteLog(projectId, { kind: 'outline', title: 'Outline batch saved', summary: `${savedNodes.length} outline nodes`, actor: 'codex' })
      touchProject(projectId)
      persist()
      return { project: getProjectOrThrow(projectId), outline: { nodes: state.outlineNodes.filter((item) => item.projectId === projectId), activeChapterNode: undefined }, savedNodes }
    }),
  deleteOutlineNode: (projectId: string, nodeId: string) =>
    asyncResult(() => {
      state.outlineNodes = state.outlineNodes.filter((item) => !(item.projectId === projectId && item.id === nodeId))
      touchProject(projectId)
      persist()
      return true
    }),

  getLongState: (projectId: string) => asyncResult(() => longStateForProject(projectId)),

  saveLongStateRecord: (
    projectId: string,
    kind: 'thread' | 'foreshadow' | 'cost' | 'debt' | 'timeline' | 'message' | 'pressure' | 'dialogueProfile',
    payload: Record<string, unknown> & { id?: string },
  ) =>
    asyncResult(() => {
      getProjectOrThrow(projectId)
      const id = payload.id || uid(kind)
      if (kind === 'thread') {
        const record = { ...payload, id, projectId, updatedAt: now() } as unknown as StoryThread
        const index = state.storyThreads.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.storyThreads[index] = record
        else state.storyThreads.unshift(record)
      }
      if (kind === 'foreshadow') {
        const record = { ...payload, id, projectId } as unknown as ForeshadowRecord
        const index = state.foreshadows.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.foreshadows[index] = record
        else state.foreshadows.unshift(record)
      }
      if (kind === 'cost') {
        const record = { ...payload, id, projectId } as unknown as CostRecord
        const index = state.costs.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.costs[index] = record
        else state.costs.unshift(record)
      }
      if (kind === 'debt') {
        const record = { ...payload, id, projectId } as unknown as PlotDebt
        const index = state.debts.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.debts[index] = record
        else state.debts.unshift(record)
      }
      if (kind === 'timeline') {
        const record = { ...payload, id, projectId } as unknown as TimelineEvent
        const index = state.timeline.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.timeline[index] = record
        else state.timeline.unshift(record)
      }
      if (kind === 'message') {
        const record = { ...payload, id, projectId } as unknown as MessageRecord
        const index = state.messages.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.messages[index] = record
        else state.messages.unshift(record)
      }
      if (kind === 'pressure') {
        const record = { ...payload, id, projectId } as unknown as PressureRecord
        const index = state.pressures.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.pressures[index] = record
        else state.pressures.unshift(record)
      }
      if (kind === 'dialogueProfile') {
        const record = { ...payload, id, projectId, updatedAt: now() } as unknown as DialogueProfile
        const index = state.dialogueProfiles.findIndex((item) => item.projectId === projectId && item.id === id)
        if (index >= 0) state.dialogueProfiles[index] = record
        else state.dialogueProfiles.unshift(record)
      }
      addWriteLog(projectId, { kind: 'ledger', title: '长篇状态已写入', summary: `${kind} / ${id}`, actor: 'codex' })
      touchProject(projectId)
      persist()
      return longStateForProject(projectId)
    }),

  getChapterContextPack: (projectId: string, chapterId: string, mode: McpContextMode = 'full') =>
    asyncResult<ChapterContextPack>(() => chapterContextPackForProject(projectId, chapterId, mode)),

  getAiTaskPackage: (projectId: string, taskId: string) => asyncResult<AiTaskPackage>(() => aiTaskPackageForProject(projectId, taskId)),

  getAiTaskQueue: (projectId: string) => asyncResult<AiTaskQueue>(() => taskQueueForProject(projectId)),

  reorderAiTaskQueue: (projectId: string, orderedTaskIds: string[]) =>
    asyncResult<AiTaskQueue>(() => {
      getProjectOrThrow(projectId)
      const tasks = sortedQueueTasks(projectId)
      const uniqueIds = [...new Set(orderedTaskIds)]
      const byId = new Map(tasks.map((task) => [task.id, task]))
      const reordered = uniqueIds.map((id) => byId.get(id)).filter((task): task is AiTask => Boolean(task))
      const rest = tasks.filter((task) => !uniqueIds.includes(task.id))
      ;[...reordered, ...rest].forEach((task, index) => {
        task.queueOrder = (index + 1) * 10
        task.updatedAt = now()
      })
      addWriteLog(projectId, {
        kind: 'ai_task',
        title: '任务包队列顺序已更新',
        summary: uniqueIds.length ? uniqueIds.join(' -> ') : '保留当前队列顺序',
        actor: 'human',
      })
      touchProject(projectId)
      persist()
      return taskQueueForProject(projectId)
    }),

  createAiTask: (projectId: string, payload: Omit<AiTask, 'id' | 'projectId' | 'status' | 'queueOrder' | 'createdAt' | 'updatedAt'>) =>
    asyncResult(() => {
      const task: AiTask = {
        ...payload,
        id: uid('task'),
        projectId,
        status: 'context_ready',
        queueOrder: nextTaskQueueOrder(projectId),
        createdAt: now(),
        updatedAt: now(),
      }
      state.aiTasks.unshift(task)
      addWriteLog(projectId, { taskId: task.id, kind: 'ai_task', title: '已记录外部 AI 任务', summary: task.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return task
    }),

  deleteAiTask: (projectId: string, taskId: string) =>
    asyncResult<AiTaskQueue>(() => {
      const task = state.aiTasks.find((item) => item.projectId === projectId && item.id === taskId)
      if (!task) throw new Error(`AI task not found: ${taskId}`)
      if (task.status === 'completed') throw new Error('已回填任务保留为记录，不能移除。')
      state.aiTasks = state.aiTasks.filter((item) => !(item.projectId === projectId && item.id === taskId))
      const rewriteTask = task.rewriteTaskId
        ? state.rewriteTasks.find((item) => item.projectId === projectId && item.id === task.rewriteTaskId)
        : state.rewriteTasks.find((item) => item.projectId === projectId && item.aiTaskId === taskId)
      if (rewriteTask && rewriteTask.status === 'requested') rewriteTask.status = 'rejected'
      addWriteLog(projectId, { taskId, kind: 'ai_task', title: '未执行任务包已移除', summary: task.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return taskQueueForProject(projectId)
    }),

  completeAiTask: (projectId: string, taskId: string) =>
    asyncResult(() => {
      const task = state.aiTasks.find((item) => item.projectId === projectId && item.id === taskId)
      if (!task) throw new Error(`AI task not found: ${taskId}`)
      task.status = 'completed'
      task.updatedAt = now()
      let version: ChapterVersion | undefined
      let styleAsset: StyleAsset | undefined
      const chapter =
        chapterById(projectId, task.chapterId) ??
        state.chapters.find((item) => item.projectId === projectId && item.status !== 'committed') ??
        state.chapters.find((item) => item.projectId === projectId)
      if (chapter && (task.target === 'next_chapter' || task.target === 'rewrite_chapter')) {
        const body = makePreviewBody(projectId, chapter, task.target === 'rewrite_chapter' ? '外部 AI 重写回写' : '外部 AI 章节回写')
        version = {
          id: uid('version'),
          projectId,
          chapterId: chapter.id,
          title: `${task.target === 'rewrite_chapter' ? 'AI 重写候选' : 'AI 生成候选'} ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
          kind: task.target === 'rewrite_chapter' ? 'rewrite' : 'external',
          status: 'candidate',
          body,
          summary: task.instruction,
          wordCount: wordCount(body),
          source: '外部 AI Host',
          createdAt: now(),
        }
        state.chapterVersions.unshift(version)
        const rewriteTask = state.rewriteTasks.find((item) => item.projectId === projectId && (item.id === task.rewriteTaskId || item.aiTaskId === task.id))
        if (rewriteTask) {
          rewriteTask.versionId = version.id
          rewriteTask.status = 'completed'
        }
        chapter.status = 'draft_complete_signal_received'
        chapter.updatedAt = now()
        addWriteLog(projectId, { taskId: task.id, kind: 'chapter_version', title: `第 ${chapter.index} 章 AI 候选版本`, summary: version.title, actor: 'system' })
      }
      if (task.target === 'next_10_chapters' || task.target === 'next_50_chapters' || task.target === 'next_100_chapters') {
        const count = task.target === 'next_10_chapters' ? 10 : task.target === 'next_50_chapters' ? 50 : 100
        backfillBatchPlan(projectId, task, count)
        addWriteLog(projectId, { taskId: task.id, kind: 'outline', title: `${count} 章路线图完成`, summary: '已在 MCP 状态台记录检查点和批次结果。', actor: 'system' })
      }
      if (task.target === 'style_extract' || task.target === 'style_process' || task.target === 'style_adjustment') {
        const profile = activeStyleForProject(projectId)
        const scope = chapter ? `第 ${chapter.index} 章` : '全书'
        styleAsset = {
          id: uid('asset'),
          projectId,
          profileId: profile?.id,
          kind: task.target === 'style_extract' ? 'good_sample' : 'forbidden',
          title:
            task.target === 'style_extract'
              ? `外部 AI 提取风格样本 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`
              : `外部 AI 风格处理结果 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
          body:
            task.target === 'style_extract'
              ? `从 ${scope} 提取：短句压迫、信息差推进、动作少但压力清晰。建议用于当前写作参考。`
              : `处理 ${scope}：避免解释性对白过长；重写时优先保留动作后果、消息版本和人物知识边界。`,
          scope,
          source: 'codex',
          enabled: true,
          updatedAt: now(),
        }
        state.styleAssets.unshift(styleAsset)
        addWriteLog(projectId, { taskId: task.id, kind: 'style', title: '外部 AI 风格资产已回填', summary: styleAsset.title, actor: 'system' })
      }
      state.aiRuns.unshift({
        id: uid('run'),
        projectId,
        taskId,
        title: `${task.title} 已完成`,
        summary: version ? '候选版本已写入版本池。' : styleAsset ? '风格资产已写入项目风格库。' : '任务状态已完成，等待真实 MCP 接入。',
        status: 'completed',
        startedAt: task.createdAt,
        finishedAt: now(),
      })
      touchProject(projectId)
      persist()
      return { task, version, styleAsset }
    }),

  resolveAiPendingReview: (projectId: string, reviewId: string, decision: AiReviewDecision) =>
    asyncResult(() => {
      const candidate = state.candidateFacts.find((item) => item.projectId === projectId && item.id === reviewId)
      if (candidate) {
        candidate.status = decision === 'accept' ? 'confirmed' : 'rejected'
        if (decision === 'accept') {
          state.worldFacts.unshift({
            id: uid('fact'),
            projectId,
            kind: candidate.kind,
            title: candidate.title,
            body: candidate.body,
            source: candidate.source,
            locked: candidate.risk === 'high',
            updatedAt: now(),
          })
        }
        addWriteLog(projectId, { kind: 'world_fact', title: decision === 'accept' ? '候选事实已沉淀' : '候选事实已忽略', summary: candidate.title, actor: 'human' })
        touchProject(projectId)
        persist()
        return { kind: 'candidate_fact', decision }
      }
      const report = state.auditReports.find((item) => item.projectId === projectId && item.id === reviewId)
      if (report) {
        report.status = 'resolved'
        touchProject(projectId)
        persist()
        return { kind: 'audit_report', decision: 'resolve' }
      }
      const issue = state.chapterIssues.find((item) => item.projectId === projectId && item.id === reviewId)
      if (issue) {
        issue.status = 'resolved'
        touchProject(projectId)
        persist()
        return { kind: 'chapter_issue', decision: 'resolve' }
      }
      throw new Error(`Pending review not found: ${reviewId}`)
    }),

  listSnapshots: (projectId: string) =>
    asyncResult(() =>
      state.snapshots
        .filter((item) => item.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ),

  createSnapshot: (projectId: string, payload?: { title?: string; reason?: string; chapterId?: string; versionId?: string }) =>
    asyncResult(() => {
      const snapshot = createSnapshotRecord(projectId, {
        chapterId: payload?.chapterId,
        versionId: payload?.versionId,
        title: payload?.title?.trim() || '手动 本地快照',
        reason: payload?.reason?.trim() || '保存当前项目状态，供后续外部 AI 回填或人工定版前回滚。',
      })
      touchProject(projectId)
      persist()
      return snapshot
    }),

  restoreSnapshot: (projectId: string, snapshotId: string) =>
    asyncResult(() => {
      const snapshot = state.snapshots.find((item) => item.projectId === projectId && item.id === snapshotId)
      if (!snapshot?.payload) throw new Error('Snapshot has no restorable payload')
      replaceProjectSlice(projectId, clone(snapshot.payload))
      addWriteLog(projectId, { kind: 'snapshot', title: '已恢复快照', summary: snapshot.title, actor: 'human' })
      touchProject(projectId)
      persist()
      return getProjectOrThrow(projectId)
    }),

  exportProjectState: (projectId: string) =>
    asyncResult(() =>
      JSON.stringify(
        {
          version: 1,
          exportedAt: now(),
          projectId,
          payload: projectSnapshotPayload(projectId),
        },
        null,
        2,
      ),
    ),

  importProjectState: (raw: string) =>
    asyncResult(() => {
      const parsed = JSON.parse(raw) as { payload?: ProjectSnapshotPayload } | ProjectSnapshotPayload
      const payload = 'payload' in parsed && parsed.payload ? parsed.payload : (parsed as ProjectSnapshotPayload)
      if (!payload.project?.id) throw new Error('Invalid project state payload')
      replaceProjectSlice(payload.project.id, payload)
      payload.project.updatedAt = now()
      addWriteLog(payload.project.id, { kind: 'snapshot', title: '已导入项目状态', summary: payload.project.title, actor: 'human' })
      persist()
      return payload.project
    }),

  exportProjectText: (projectId: string) =>
    asyncResult(() => {
      const project = getProjectOrThrow(projectId)
      const chapters = state.chapters.filter((item) => item.projectId === projectId).sort((a, b) => a.index - b.index)
      return [`# ${project.title}`, project.description, '', ...chapters.map((chapter) => `## 第 ${chapter.index} 章 ${chapter.title}\n\n${chapter.draft || chapter.summary}`)].join('\n\n')
    }),

  listMcpTools: async () => {
    await ensureStateReady()
    if (!hasDesktopBridge()) return clone(browserPreviewMcpTools)
    try {
      const tools = await novelDbApi.listMcpTools()
      return tools
    } catch {
      return clone(browserPreviewMcpTools)
    }
  },

  callMcpTool: async (name: string, args: Record<string, unknown> = {}) => {
    await ensureStateReady()
    if (!hasDesktopBridge()) throw new Error('Electron MCP bridge is not available in browser preview')
    return novelDbApi.callMcpTool(name, args)
  },

  getContentStorageSettings: async (): Promise<NovelContentStorageSettings> => {
    await ensureStateReady()
    if (!hasDesktopBridge()) {
      return {
        source: 'browser_preview',
        rootDir: '浏览器预览使用 localStorage',
        defaultRootDir: '',
        isCustom: false,
        exists: false,
        contentBlobs: 0,
      }
    }
    return novelDbApi.getContentStorageSettings()
  },

  chooseContentStorageDirectory: async (): Promise<NovelContentStorageSettings> => {
    await ensureStateReady()
    if (!hasDesktopBridge()) throw new Error('浏览器预览不能选择本机目录，请在 Electron 应用中设置。')
    return novelDbApi.chooseContentStorageDirectory()
  },

  resetContentStorageDirectory: async (): Promise<NovelContentStorageSettings> => {
    await ensureStateReady()
    if (!hasDesktopBridge()) throw new Error('浏览器预览不能修改本机目录，请在 Electron 应用中设置。')
    return novelDbApi.resetContentStorageDirectory()
  },

  syncContentStorage: async (): Promise<NovelContentStorageSyncResult> => {
    await ensureStateReady()
    if (!hasDesktopBridge()) throw new Error('浏览器预览不能同步正文文件，请在 Electron 应用中执行。')
    const result = await novelDbApi.syncContentStorage(state)
    return result
  },

  clearWorkspace: () =>
    asyncResult(() => {
      state = seedState()
      persist()
      return true
    }),
}

export type NovelApi = typeof browserPreviewNovelApi

export const novelApi = new Proxy({} as NovelApi, {
  get(_target, property: string) {
    const browserMember = (browserPreviewNovelApi as Record<string, unknown>)[property]
    if (typeof browserMember !== 'function') return browserMember
    return async (...args: unknown[]) => {
      if (!hasDesktopBridge()) return (browserMember as (...browserArgs: unknown[]) => unknown)(...args)
      const dbMember = (novelDbApi as Record<string, unknown>)[property]
      if (typeof dbMember === 'function') return (dbMember as (...dbArgs: unknown[]) => unknown)(...args)
      throw new Error(`Novel API method is not exposed by module API: ${property}`)
    }
  },
})

export { browserPreviewMcpTools }
