<template>
  <el-drawer v-model="visible" direction="rtl" size="430px" class="canvas-drawer" :with-header="false">
    <template v-if="detail">
      <div class="drawer-head">
        <span class="eyebrow">{{ nodeKindLabel(detail.node.kind) }}</span>
        <h2>{{ detail.node.title }}</h2>
        <p>{{ detail.node.subtitle }}</p>
      </div>

      <div class="drawer-actions" :class="{ 'is-task-detail': isTaskNodeDetail, 'is-outline-detail': isOutlineNodeDetail }">
        <el-button :icon="CopyDocument" @click="$emit('copy-codex-prompt')">复制 AI 提示</el-button>
        <template v-if="isTaskNodeDetail">
          <el-button type="primary" :icon="Collection" @click="$emit('open-task-package')">任务包详情</el-button>
          <el-button :icon="Finished" @click="$emit('open-panel', 'mcp-status')">MCP 状态</el-button>
          <el-button :icon="DocumentChecked" @click="$emit('open-panel', 'audit')">确认项</el-button>
          <el-button v-if="detailHasBody" :icon="EditPen" @click="$emit('open-reader')">查看目标正文</el-button>
        </template>
        <template v-else-if="isChapterNodeDetail">
          <el-button :icon="Collection" @click="$emit('open-panel', 'context-pack')">写作参考</el-button>
          <el-button :icon="EditPen" @click="$emit('open-reader')" :disabled="!detailHasBody">正文查看/小修</el-button>
          <el-button :icon="EditPen" @click="$emit('open-rewrite')" :disabled="!detail.chapter">重写条件</el-button>
          <el-button type="primary" :icon="Finished" @click="$emit('open-version')" :disabled="!detail.chapter">版本对比定版</el-button>
          <el-button :icon="DocumentChecked" @click="$emit('run-local-check')" :disabled="!detail.chapter">本地检查</el-button>
        </template>
        <template v-else>
          <el-button :icon="Collection" @click="$emit('open-panel', 'outline')">大纲预览</el-button>
          <el-button :icon="Finished" @click="$emit('open-panel', 'long-state')">长篇状态</el-button>
          <el-button :icon="DocumentChecked" @click="$emit('open-panel', 'audit')">审稿检查</el-button>
        </template>
      </div>

      <section v-if="isTaskNodeDetail" class="drawer-section drawer-section-strong">
        <h3>任务节点</h3>
        <div class="detail-grid detail-grid-task">
          <div><span>类型</span><strong>{{ activeDetailTask ? aiTaskTargetLabel(activeDetailTask.target) : detail.node.subtitle }}</strong></div>
          <div><span>状态</span><strong>{{ activeDetailTask ? aiTaskStatusLabel(activeDetailTask.status) : detail.node.status }}</strong></div>
          <div><span>写作参考</span><strong>{{ activeDetailTask ? contextModeLabel(activeDetailTask.contextMode) : '-' }}</strong></div>
          <div><span>检查</span><strong>{{ activeDetailTask ? reviewModeLabel(activeDetailTask.reviewMode) : '-' }}</strong></div>
        </div>
        <p>{{ activeDetailTask?.instruction || detail.node.summary }}</p>
      </section>

      <section v-if="isTaskNodeDetail && detail.chapter" class="drawer-section">
        <h3>目标章节</h3>
        <div class="detail-grid">
          <div><span>章节</span><strong>第 {{ detail.chapter.index }} 章</strong></div>
          <div><span>字数</span><strong>{{ detail.chapter.wordCount }}</strong></div>
          <div><span>版本</span><strong>{{ detail.versions.length }}</strong></div>
          <div><span>检查</span><strong>{{ latestLocalCheckLevel }}</strong></div>
        </div>
        <p>{{ detail.chapter.intention || detail.chapter.summary }}</p>
      </section>

      <section v-if="isChapterNodeDetail && detail.chapter" class="drawer-section">
        <h3>正文与版本</h3>
        <div class="detail-grid">
          <div><span>状态</span><strong>{{ chapterStatusLabel(detail.chapter.status) }}</strong></div>
          <div><span>字数</span><strong>{{ detail.chapter.wordCount }}</strong></div>
          <div><span>版本</span><strong>{{ detail.versions.length }}</strong></div>
          <div><span>检查</span><strong>{{ latestLocalCheckLevel }}</strong></div>
        </div>
        <p>{{ detail.chapter.intention || detail.chapter.summary }}</p>
      </section>

      <section v-if="detail.chapter && detail.humanSummary" class="drawer-section human-summary">
        <h3>本章摘要（给人看）</h3>
        <p><b>意图：</b>{{ detail.humanSummary.intention }}</p>
        <p><b>剧情：</b>{{ detail.humanSummary.plot }}</p>
        <div class="summary-list">
          <article v-for="participant in detail.humanSummary.participants" :key="participant.character.id">
            <strong>{{ participant.character.name }} / {{ participant.character.role }}</strong>
            <span>{{ participant.character.status }}</span>
            <small>{{ participant.pressure ? `${participant.pressure.emotion} ${participant.pressure.value}/${participant.pressure.threshold}` : '暂无压力记录' }}</small>
          </article>
        </div>
        <div class="signal-list">
          <span v-for="item in detail.humanSummary.pressureSignals.slice(0, 3)" :key="`pressure-${item}`">{{ item }}</span>
          <span v-for="item in detail.humanSummary.relationshipChanges.slice(0, 3)" :key="`relation-${item}`">{{ item }}</span>
          <span v-for="item in detail.humanSummary.debts.slice(0, 2)" :key="`debt-${item}`">{{ item }}</span>
          <span v-for="item in detail.humanSummary.hooks.slice(0, 2)" :key="`hook-${item}`">{{ item }}</span>
        </div>
      </section>

      <section v-if="isOutlineNodeDetail" class="drawer-section">
        <h3>范围指标</h3>
        <div class="detail-grid detail-grid-node">
          <div v-for="metric in detail.node.metrics" :key="`${detail.node.id}-${metric.label}`">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </div>
        </div>
        <p>{{ detail.node.summary }}</p>
      </section>

      <section v-if="detail.outline" class="drawer-section">
        <h3>大纲契约</h3>
        <p><b>目标：</b>{{ detail.outline.goal }}</p>
        <p><b>冲突：</b>{{ detail.outline.conflict }}</p>
        <p><b>回报：</b>{{ detail.outline.payoff }}</p>
      </section>

      <section class="drawer-section">
        <h3>AI 可读摘要</h3>
        <div class="compact-list">
          <article>
            <strong>事实 {{ detail.worldFacts.length }}</strong>
            <span>{{ detail.worldFacts.slice(0, 3).map((item) => item.title).join(' / ') || '暂无' }}</span>
          </article>
          <article>
            <strong>角色 {{ detail.characters.length }}</strong>
            <span>{{ detail.characters.slice(0, 3).map((item) => item.name).join(' / ') || '暂无' }}</span>
          </article>
          <article>
            <strong>风格资产 {{ detail.styleLibrary.assets.length }}</strong>
            <span>{{ activeStyleTitle }}</span>
          </article>
          <article>
            <strong>破声点 / 压力</strong>
            <span>{{ pressureSummary }}</span>
          </article>
        </div>
      </section>

      <section class="drawer-section">
        <h3>待处理信号</h3>
        <div class="compact-list">
          <article v-for="item in detail.candidateFacts.slice(0, 3)" :key="item.id">
            <strong>{{ item.title }}</strong>
            <span>{{ riskLabel(item.risk) }} / {{ item.status }}</span>
          </article>
          <article v-for="item in detail.auditReports.slice(0, 3)" :key="item.id">
            <strong>{{ item.title }}</strong>
            <span>{{ severityLabel(item.severity) }} / {{ item.status }}</span>
          </article>
          <el-empty v-if="detail.candidateFacts.length + detail.auditReports.length === 0" description="暂无高影响确认项" />
        </div>
      </section>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { Collection, CopyDocument, DocumentChecked, EditPen, Finished } from '@element-plus/icons-vue'
import { computed } from 'vue'
import type { CanvasNodeDetail } from '@/api'
import type { PanelKey } from '../types'
import {
  aiTaskStatusLabel,
  aiTaskTargetLabel,
  chapterStatusLabel,
  contextModeLabel,
  nodeKindLabel,
  reviewModeLabel,
  riskLabel,
  severityLabel,
} from '../labels'

const props = defineProps<{
  modelValue: boolean
  detail: CanvasNodeDetail | null
  activeStyleTitle: string
  pressureSummary: string
  latestLocalCheckLevel: string
  detailHasBody: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'copy-codex-prompt': []
  'open-task-package': []
  'open-panel': [panel: PanelKey]
  'open-reader': []
  'open-rewrite': []
  'open-version': []
  'run-local-check': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const detailNodeKind = computed(() => props.detail?.node.kind ?? '')
const isTaskNodeDetail = computed(() => detailNodeKind.value === 'task')
const isChapterNodeDetail = computed(() => detailNodeKind.value === 'chapter' || detailNodeKind.value === 'version')
const isOutlineNodeDetail = computed(() => ['book', 'volume', 'arc'].includes(detailNodeKind.value))
const activeDetailTask = computed(() => (isTaskNodeDetail.value ? props.detail?.tasks.find((task) => task.id === props.detail?.node.refId) : undefined))
</script>

<style lang="scss" scoped>
.drawer-head {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--bd-line);

  h2,
  p {
    margin: 0;
  }

  h2 {
    margin-top: 5px;
    color: var(--t1);
    font-size: 21px;
    font-weight: 950;
  }

  p {
    margin-top: 5px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 800;
  }
}

.drawer-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 14px;

  :deep(.el-button) {
    justify-content: center;
    margin-left: 0;
  }
}

.drawer-actions.is-task-detail,
.drawer-actions.is-outline-detail {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.drawer-section {
  padding: 14px 18px;
  border-top: 1px solid var(--bd-line);

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: var(--t2);
    font-size: 13px;
    font-weight: 950;
  }

  p {
    margin-top: 8px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.65;
  }
}

.drawer-section-strong {
  background: color-mix(in srgb, var(--brand-amber) 7%, transparent);
}

.human-summary {
  background: color-mix(in srgb, var(--brand-moss) 5%, transparent);
}

.summary-list,
.signal-list {
  display: grid;
  gap: 7px;
  margin-top: 10px;
}

.summary-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));

  article {
    min-width: 0;
    padding: 8px 9px;
    border: 1px solid color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
    border-radius: 8px;
    background: color-mix(in srgb, var(--surface-field) 82%, transparent);
  }

  strong,
  span,
  small {
    display: block;
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

  span,
  small {
    margin-top: 3px;
    color: var(--t5);
    font-size: 10px;
    font-weight: 750;
  }
}

.signal-list span {
  min-width: 0;
  padding: 8px 9px;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  color: var(--t5);
  background: color-mix(in srgb, var(--surface-field) 72%, transparent);
  font-size: 11px;
  font-weight: 750;
  line-height: 1.55;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--bd-line);

  div {
    min-width: 0;
    padding: 8px;
    background: var(--surface-field);
  }

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--t5);
    font-size: 10px;
    font-weight: 850;
  }

  strong {
    margin-top: 3px;
    color: var(--t1);
    font-size: 13px;
    font-weight: 950;
  }
}

.detail-grid-task,
.detail-grid-node {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.compact-list {
  display: grid;
  gap: 7px;
  margin-top: 10px;

  article {
    min-width: 0;
    padding: 9px 10px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: var(--surface-field);
  }

  strong,
  span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 900;
  }

  span {
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 750;
  }
}
</style>
