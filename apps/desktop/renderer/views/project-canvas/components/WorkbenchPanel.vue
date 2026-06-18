<template>
  <section v-if="modelValue" class="floating-workbench-panel">
    <template v-if="modelValue === 'project'">
      <div class="section-head">
        <div>
          <span class="eyebrow">项目状态</span>
          <h3>{{ canvas?.project.title ?? 'NovelForge' }}</h3>
        </div>
        <button type="button" class="panel-close" @click="closePanel">×</button>
      </div>
      <p class="panel-summary">{{ canvas?.project.description ?? '等待读取项目状态。' }}</p>
      <div class="progress-block">
        <div>
          <span>总体进度</span>
          <strong>{{ projectProgress }}%</strong>
        </div>
        <el-progress :percentage="projectProgress" :stroke-width="8" :show-text="false" />
      </div>
      <div class="snapshot-metrics">
        <span>当前 {{ canvas?.project.currentChapter ?? 0 }} / {{ canvas?.project.targetChapters ?? 0 }} 章</span>
        <span>压力预警 {{ dashboard?.stats.pressureAlerts ?? 0 }}</span>
        <span>破声点 {{ pressureAlertText }}</span>
      </div>
      <div class="state-brief-list">
        <article>
          <b>当前章节</b>
          <strong>{{ dashboard?.currentChapter ? `第 ${dashboard.currentChapter.index} 章：${dashboard.currentChapter.title}` : '未选择章节' }}</strong>
          <span>{{ dashboard?.currentChapter?.summary || dashboard?.currentChapter?.intention || '等待补充章节摘要' }}</span>
        </article>
        <article>
          <b>当前风格</b>
          <strong>{{ dashboard?.activeStyle?.title || '未绑定风格方案' }}</strong>
          <span>{{ dashboard?.activeStyle?.tone || '请在风格资产中启用一个全书风格方案' }}</span>
        </article>
        <article>
          <b>最近回填</b>
          <strong>{{ dashboard?.latestWrite?.title || '暂无回填记录' }}</strong>
          <span>{{ dashboard?.latestWrite?.summary || '外部 AI 回填后会在这里显示最近结果' }}</span>
        </article>
        <article>
          <b>确认压力</b>
          <strong>{{ (dashboard?.stats.pendingFacts ?? 0) + (dashboard?.stats.auditIssues ?? 0) }} 项待处理</strong>
          <span>候选事实 {{ dashboard?.stats.pendingFacts ?? 0 }} / 审稿问题 {{ dashboard?.stats.auditIssues ?? 0 }}</span>
        </article>
      </div>
    </template>

    <template v-else-if="modelValue === 'tasks'">
      <div class="section-head">
        <div>
          <span class="eyebrow">任务队列</span>
          <h3>任务包列表</h3>
        </div>
        <el-button size="small" text @click="$emit('openPanel', 'task-package')">查看详情</el-button>
      </div>
      <div v-if="aiWorkbench?.taskQueue.nextTask" class="queue-next">
        <b>下一任务</b>
        <span>{{ aiWorkbench.taskQueue.nextTask.task.title }}</span>
      </div>
      <div class="queue-list">
        <article v-for="(task, index) in orderedTasks.slice(0, 5)" :key="task.id">
          <b>{{ index + 1 }}</b>
          <div>
            <strong>{{ task.title }}</strong>
            <span>{{ aiTaskTargetLabel(task.target) }} / {{ aiTaskStatusLabel(task.status) }}</span>
            <em v-if="queueItemForTask(task.id)?.blockedReason">{{ queueItemForTask(task.id)?.blockedReason }}</em>
          </div>
          <div class="queue-actions">
            <button type="button" :disabled="index === 0" @click="$emit('moveTask', task.id, -1)">↑</button>
            <button type="button" :disabled="index === orderedTasks.length - 1" @click="$emit('moveTask', task.id, 1)">↓</button>
            <button v-if="task.status !== 'completed'" type="button" class="danger" @click="$emit('removeTask', task.id)">×</button>
          </div>
        </article>
        <div v-if="!orderedTasks.length" class="empty-mini">等待任务包</div>
      </div>
    </template>

    <template v-else-if="modelValue === 'confirm'">
      <div class="section-head">
        <div>
          <span class="eyebrow">人工确认</span>
          <h3>需要手动确认</h3>
        </div>
        <el-button size="small" text @click="$emit('openPanel', 'audit')">审稿检查</el-button>
      </div>
      <div class="confirm-list">
        <article v-for="review in (aiWorkbench?.pendingReviews ?? []).slice(0, 5)" :key="review.id">
          <strong>{{ review.title }}</strong>
          <span>{{ reviewKindLabel(review.kind) }} / {{ reviewSeverityLabel(review.severity) }}</span>
          <el-button size="small" @click="resolveReviewItem(review)">
            {{ review.kind === 'candidate_fact' ? '沉淀' : '解决' }}
          </el-button>
        </article>
        <div v-if="!(aiWorkbench?.pendingReviews ?? []).length" class="empty-mini">暂无待确认</div>
      </div>
    </template>

    <template v-else-if="modelValue === 'modules'">
      <div class="section-head">
        <div>
          <span class="eyebrow">功能模块</span>
          <h3>项目功能</h3>
        </div>
        <button type="button" class="panel-close" @click="closePanel">×</button>
      </div>
      <nav class="module-strip expanded" aria-label="NovelForge modules">
        <button v-for="item in moduleTabs" :key="item.panel" type="button" @click="$emit('openPanel', item.panel)">
          <strong>{{ item.label }}</strong>
          <span>{{ item.meta }}</span>
        </button>
      </nav>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { AiPendingReview, AiReviewDecision, AiTask, AiWorkbench, ProjectCanvas, ProjectDashboard } from '@/api'
import { aiTaskStatusLabel, aiTaskTargetLabel, reviewKindLabel, reviewSeverityLabel } from '../labels'
import type { PanelKey, WorkbenchPanelKey } from '../types'

defineProps<{
  modelValue: WorkbenchPanelKey | ''
  canvas: ProjectCanvas | null
  dashboard: ProjectDashboard | null
  aiWorkbench: AiWorkbench | null
  projectProgress: number
  pressureAlertText: string
  orderedTasks: AiTask[]
  moduleTabs: Array<{ label: string; panel: PanelKey; meta: string }>
  queueItemForTask: (taskId: string) => { blockedReason?: string } | undefined
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: WorkbenchPanelKey | ''): void
  (event: 'openPanel', panel: PanelKey): void
  (event: 'moveTask', taskId: string, direction: -1 | 1): void
  (event: 'removeTask', taskId: string): void
  (event: 'resolveReview', reviewId: string, decision: AiReviewDecision): void
}>()

const closePanel = () => emit('update:modelValue', '')
const resolveReviewItem = (review: AiPendingReview) => emit('resolveReview', review.id, review.kind === 'candidate_fact' ? 'accept' : 'resolve')
</script>

<style scoped lang="scss">
.floating-workbench-panel {
  position: absolute;
  top: 84px;
  left: 86px;
  z-index: 6;
  width: min(430px, calc(100% - 128px));
  max-height: calc(100% - 118px);
  min-width: 0;
  overflow: auto;
  padding-bottom: 8px;
  border: 1px solid var(--bd-line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--paper-surface) 78%, transparent);
  box-shadow: 0 18px 42px color-mix(in srgb, var(--shadow-color) 18%, transparent);
  pointer-events: auto;
  backdrop-filter: blur(16px);
}

.panel-close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--bd-line);
  border-radius: 999px;
  color: var(--t5);
  background: color-mix(in srgb, var(--surface-field) 70%, transparent);
  cursor: pointer;
}

.panel-summary {
  margin: 0;
  padding: 9px 12px 0;
  color: var(--t5);
  font-size: 12px;
  font-weight: 750;
  line-height: 1.55;
}

.floating-workbench-panel h3 {
  margin: 3px 0 0;
  overflow: hidden;
  color: var(--t2);
  font-size: 15px;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 11px 7px;
  border-bottom: 1px solid var(--bd-line);

  h3 {
    margin: 3px 0 0;
    color: var(--t2);
    font-size: 13px;
    font-weight: 950;
  }
}

.progress-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  margin: 10px 12px 0;
  padding: 9px;
  border: 1px solid color-mix(in srgb, var(--brand-moss) 32%, var(--bd-line));
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-moss) 8%, transparent);

  div {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  span,
  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--t5);
    font-size: 11px;
    font-weight: 850;
  }

  strong {
    color: var(--brand-moss);
    font-size: 18px;
    font-weight: 950;
  }
}

.snapshot-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px 0;

  span {
    min-width: 0;
    padding: 3px 7px;
    border: 1px solid var(--bd-line);
    border-radius: 7px;
    color: var(--t5);
    background: color-mix(in srgb, var(--surface-field) 82%, transparent);
    font-size: 11px;
    font-weight: 850;
  }
}

.state-brief-list {
  display: grid;
  gap: 7px;
  padding: 10px 12px 2px;

  article {
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 8px 9px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: color-mix(in srgb, var(--surface-field) 70%, transparent);
  }

  b,
  strong,
  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    color: var(--brand-copper);
    font-size: 10px;
    font-weight: 950;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }

  span {
    color: var(--t5);
    font-size: 11px;
    font-weight: 750;
  }
}

.module-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 10px;

  button {
    min-width: 0;
    padding: 7px 8px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    color: inherit;
    background: var(--paper-surface);
    text-align: left;
    cursor: pointer;
  }

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 11px;
    font-weight: 950;
  }

  span {
    margin-top: 3px;
    color: var(--t5);
    font-size: 10px;
    font-weight: 750;
  }
}

.queue-list,
.confirm-list {
  display: grid;
  gap: 6px;
  padding: 8px;
  max-height: 260px;
  overflow: auto;
}

.queue-next {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 7px;
  margin: 8px 8px 0;
  padding: 7px 8px;
  border: 1px solid color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
  border-radius: 8px;
  color: var(--t4);
  background: color-mix(in srgb, var(--brand-moss) 8%, transparent);
  font-size: 11px;
  font-weight: 850;

  b,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    color: var(--brand-moss);
  }
}

.queue-list article,
.confirm-list article {
  min-width: 0;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--paper-surface) 76%, transparent);
}

.empty-mini {
  display: grid;
  place-items: center;
  min-height: 52px;
  border: 1px dashed color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
  border-radius: 9px;
  color: var(--t5);
  background: color-mix(in srgb, var(--surface-field) 52%, transparent);
  font-size: 12px;
  font-weight: 850;
}

.queue-list article {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 6px 7px;

  b {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    color: var(--brand-copper);
    background: color-mix(in srgb, var(--brand-copper) 10%, transparent);
    font-size: 10px;
  }

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 11px;
    font-weight: 950;
  }

  span {
    margin-top: 3px;
    color: var(--t5);
    font-size: 10px;
    font-weight: 750;
  }

  em {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    color: var(--brand-copper);
    font-size: 10px;
    font-style: normal;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.queue-actions {
  display: flex;
  gap: 3px;

  button {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid var(--bd-line);
    border-radius: 6px;
    color: var(--t4);
    background: var(--surface-field);
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.35;
    }

    &.danger {
      color: var(--status-danger);
      border-color: color-mix(in srgb, var(--status-danger) 32%, var(--bd-line));
      background: color-mix(in srgb, var(--status-danger) 7%, var(--surface-field));
    }
  }
}

.confirm-list article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 8px;
  align-items: center;
  padding: 7px 8px;

  strong,
  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 11px;
    font-weight: 950;
  }

  span {
    color: var(--t5);
    font-size: 10px;
    font-weight: 750;
  }

  .el-button {
    grid-row: 1 / span 2;
    grid-column: 2;
  }
}
</style>
