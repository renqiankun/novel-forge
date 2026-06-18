<template>
  <div class="flow-shell">
    <VueFlow
      id="novel-canvas"
      :nodes="flowNodes"
      :edges="flowEdges"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :edges-updatable="false"
      :fit-view-on-init="true"
      :min-zoom="0.22"
      :max-zoom="1"
      class="story-flow"
    >
      <template #node-story="{ data }">
        <div class="story-node-frame">
          <Handle type="target" :position="Position.Left" class="node-handle is-target" />
          <article
            class="story-node"
            :class="[`is-${data.kind}`, `tone-${data.tone}`, { selected: selectedNodeId === data.id }]"
            :title="nodeTooltip(data)"
            role="button"
            tabindex="0"
            @click.stop="$emit('open-node', data.id)"
            @keydown.enter.stop.prevent="$emit('open-node', data.id)"
            @keydown.space.stop.prevent="$emit('open-node', data.id)"
          >
            <span class="node-kicker">{{ nodeKindLabel(data.kind) }}</span>
            <strong>{{ data.title }}</strong>
            <em>{{ data.subtitle }}</em>
            <p>{{ data.summary }}</p>
            <dl class="node-brief">
              <div v-for="metric in data.metrics" :key="`${data.id}-brief-${metric.label}`">
                <dt>{{ metric.label }}</dt>
                <dd>{{ metric.value }}</dd>
              </div>
            </dl>
            <div class="node-metrics">
              <span v-for="metric in data.metrics" :key="`${data.id}-${metric.label}`">
                {{ metric.label }} {{ metric.value }}
              </span>
            </div>
            <div v-if="data.badges.length || data.hasBody" class="node-footer">
              <div v-if="data.badges.length" class="node-badges">
                <span v-for="badge in data.badges" :key="`${data.id}-${badge}`">{{ badge }}</span>
              </div>
              <button v-if="data.hasBody" type="button" class="node-action" @click.stop="$emit('open-reader-from-node', data.id)">查看正文</button>
            </div>
          </article>
          <Handle type="source" :position="Position.Right" class="node-handle is-source" />
        </div>
      </template>

      <template #node-version="{ data }">
        <div class="story-node-frame">
          <Handle type="target" :position="Position.Left" class="node-handle is-target" />
          <article
            class="version-node"
            :class="[`status-${data.version?.status ?? 'candidate'}`, { selected: selectedVersionId === data.version?.id }]"
            :title="nodeTooltip(data)"
            role="button"
            tabindex="0"
            @click.stop="$emit('open-version', data.version?.id)"
            @keydown.enter.stop.prevent="$emit('open-version', data.version?.id)"
            @keydown.space.stop.prevent="$emit('open-version', data.version?.id)"
          >
            <b>#{{ data.versionIndex }}</b>
            <span>{{ versionStatusLabel(data.version?.status) }}</span>
            <strong>{{ data.version?.title }}</strong>
            <em>{{ data.version?.source }} / {{ data.version?.wordCount ?? 0 }} 字</em>
            <button v-if="data.hasBody" type="button" class="version-action" @click.stop="$emit('open-version-body', data.version?.id)">查看正文</button>
          </article>
          <Handle type="source" :position="Position.Right" class="node-handle is-source" />
        </div>
      </template>

      <Background :gap="26" :size="1.2" pattern-color="var(--canvas-dot)" />
      <Controls position="bottom-left" />
      <MiniMap pannable zoomable position="bottom-right" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/controls/dist/style.css'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/minimap/dist/style.css'
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { computed } from 'vue'
import type { CanvasNodeDetail, ChapterVersion, ProjectCanvas, ProjectCanvasNode } from '@/api'
import { nodeKindLabel, versionStatusLabel } from '../labels'

type FlowNodeData = ProjectCanvasNode & {
  version?: ChapterVersion
  versionIndex?: number
}

const props = defineProps<{
  canvas: ProjectCanvas | null
  detail: CanvasNodeDetail | null
  selectedNodeId: string
  selectedVersionId: string
}>()

defineEmits<{
  'open-node': [nodeId: string]
  'open-reader-from-node': [nodeId: string]
  'open-version': [versionId?: string]
  'open-version-body': [versionId?: string]
}>()

const { fitView } = useVueFlow('novel-canvas')

const nodeTooltip = (data: FlowNodeData) => {
  const metrics = data.metrics.map((metric) => `${metric.label} ${metric.value}`).join(' / ')
  return [nodeKindLabel(data.kind), data.title, data.subtitle, data.summary, metrics, data.badges.join(' / ')].filter(Boolean).join('\n')
}

const flowNodes = computed<Node<FlowNodeData>[]>(() => {
  const base =
    props.canvas?.nodes.map((node) => ({
      id: node.id,
      type: 'story',
      position: { x: node.x, y: node.y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: node,
      draggable: false,
      selectable: true,
      style: { width: `${node.width}px`, height: `${node.height}px` },
    })) ?? []

  if (!props.detail?.chapter || !props.detail.versions.length) return base
  const source = props.detail.node
  const versionNodes = props.detail.versions.slice(0, 8).map((version, index) => {
    const tone: ProjectCanvasNode['tone'] = version.status === 'applied' ? 'moss' : version.status === 'archived' ? 'muted' : 'amber'
    return {
      id: `version:${version.id}`,
      type: 'version',
      position: { x: source.x + source.width + 90, y: source.y + index * 98 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        id: `version:${version.id}`,
        kind: 'version' as const,
        refId: version.id,
        title: version.title,
        subtitle: version.source,
        status: version.status,
        x: source.x + source.width + 90,
        y: source.y + index * 98,
        width: 240,
        height: 86,
        tone,
        metrics: [{ label: '字', value: version.wordCount }],
        badges: [version.kind],
        summary: version.summary,
        hasBody: Boolean(version.body.trim()),
        version,
        versionIndex: index + 1,
      },
      draggable: false,
      selectable: true,
      style: { width: '240px', height: '86px' },
    }
  })
  return [...base, ...versionNodes]
})

const flowEdges = computed<Edge[]>(() => {
  const base =
    props.canvas?.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated,
      type: 'smoothstep',
      class: `edge-${edge.kind}`,
    })) ?? []
  if (!props.detail?.chapter) return base
  const versionEdges =
    props.detail.versions.slice(0, 8).map((version) => ({
      id: `edge:version:${props.detail?.chapter?.id}:${version.id}`,
      source: `chapter:${props.detail?.chapter?.id}`,
      target: `version:${version.id}`,
      type: 'smoothstep',
      class: 'edge-version_of',
    })) ?? []
  return [...base, ...versionEdges]
})

const fitCanvas = () => {
  ;[80, 220, 420].forEach((delay, index) => {
    window.setTimeout(() => fitView({ padding: 0.18, duration: index === 0 ? 220 : 0 }), delay)
  })
}

defineExpose({ fitCanvas })
</script>

<style lang="scss" scoped>
.flow-shell {
  position: absolute;
  inset: 12px;
  z-index: 1;
  min-height: 0;
  margin-top: 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 16px;
  background:
    linear-gradient(color-mix(in srgb, var(--paper-surface) 72%, transparent), color-mix(in srgb, var(--surface-soft) 60%, transparent)),
    var(--app-bg);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 45%, transparent),
    0 18px 52px color-mix(in srgb, var(--shadow-color) 14%, transparent);
}

.story-flow {
  width: 100%;
  height: 100%;
  --vf-node-bg: transparent;
  --vf-node-color: var(--t2);
  --vf-node-border: transparent;
  --vf-handle: var(--brand-moss);
  --vf-connection-path: var(--brand-copper);
}

:deep(.vue-flow__edges) {
  z-index: 1 !important;
  pointer-events: none;
}

:deep(.vue-flow__pane) {
  z-index: 0 !important;
}

:deep(.vue-flow__nodes),
:deep(.vue-flow__node) {
  z-index: 2 !important;
}

:deep(.vue-flow__node) {
  visibility: visible !important;
}

.story-node-frame {
  position: relative;
  width: 100%;
  height: 100%;
}

:deep(.node-handle) {
  width: 9px;
  height: 9px;
  border: 2px solid var(--surface-raised);
  background: var(--brand-moss);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--brand-moss) 34%, transparent);
  opacity: 0.92;
  pointer-events: none;
}

:deep(.node-handle.is-target) {
  left: -7px;
}

:deep(.node-handle.is-source) {
  right: -7px;
  background: var(--brand-copper);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--brand-copper) 36%, transparent);
}

.story-node,
.version-node {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--brand-moss) 30%, var(--bd-line));
  color: var(--t2);
  background: color-mix(in srgb, var(--paper-surface) 88%, transparent);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 18px 38px color-mix(in srgb, var(--shadow-color) 14%, transparent);
  backdrop-filter: blur(10px);
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover,
  &.selected {
    border-color: var(--brand-moss);
    box-shadow: 0 18px 38px color-mix(in srgb, var(--brand-moss) 22%, transparent);
    transform: translateY(-1px);
  }
}

.story-node {
  gap: 6px;
  padding: 12px 13px;
  border-radius: 11px;

  strong,
  em,
  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    display: -webkit-box;
    color: var(--t1);
    font-size: 14px;
    font-weight: 950;
    line-height: 1.25;
    white-space: normal;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  em {
    color: var(--t4);
    font-size: 11px;
    font-style: normal;
    font-weight: 850;
    line-height: 1.25;
  }

  p {
    color: var(--t5);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.45;
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  &.is-task p {
    -webkit-line-clamp: 3;
  }
}

.story-node.is-task {
  gap: 5px;
  padding: 13px 14px 12px;
  border-style: solid;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--brand-amber) 10%, transparent), transparent 42%),
    color-mix(in srgb, var(--paper-surface) 90%, transparent);

  .node-kicker {
    color: var(--brand-copper);
  }

  strong {
    font-size: 13px;
    line-height: 1.22;
    -webkit-line-clamp: 2;
  }

  em {
    color: var(--t4);
    font-size: 10px;
    line-height: 1.15;
  }

  p {
    margin-top: 1px;
    color: var(--t4);
    font-size: 10.5px;
    line-height: 1.38;
    -webkit-line-clamp: 3;
  }

  .node-brief {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 2px;
    border-color: color-mix(in srgb, var(--brand-amber) 26%, var(--bd-line));
    background: color-mix(in srgb, var(--brand-amber) 22%, transparent);
  }

  .node-brief > div {
    padding: 5px 8px;
    background: color-mix(in srgb, var(--surface-field) 82%, transparent);
  }

  .node-brief dt {
    flex: 0 0 auto;
  }

  .node-brief dd {
    font-size: 11px;
  }

  .node-footer {
    margin-top: auto;
  }
}

.node-brief {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 3px 0 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bd-line) 82%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--bd-line) 74%, transparent);

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    min-width: 0;
    padding: 5px 7px;
    background: color-mix(in srgb, var(--surface-field) 72%, transparent);
  }

  dt,
  dd {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dt {
    color: var(--t5);
    font-size: 10px;
    font-weight: 850;
  }

  dd {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }
}

.is-volume {
  border-left: 5px solid var(--brand-moss);
}

.is-chapter {
  border-left: 5px solid var(--brand-copper);
}

.is-task {
  border-style: dashed;
  border-left: 5px solid var(--brand-amber);
}

.tone-moss {
  background: color-mix(in srgb, var(--brand-moss) 10%, var(--paper-surface));
}

.tone-copper,
.tone-amber {
  background: color-mix(in srgb, var(--brand-copper) 10%, var(--paper-surface));
}

.tone-danger {
  border-color: color-mix(in srgb, var(--status-danger) 46%, var(--bd-line));
  background: color-mix(in srgb, var(--status-danger) 8%, var(--paper-surface));
}

.node-kicker,
.node-metrics span,
.node-badges span,
.text-mark {
  color: var(--t5);
  font-size: 10px;
  font-weight: 900;
}

.node-metrics,
.node-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.node-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
  margin-top: auto;
}

.node-metrics {
  display: none;
  margin-top: auto;

  span {
    padding-right: 6px;
    border-right: 1px solid var(--bd-line);

    &:last-child {
      border-right: 0;
    }
  }
}

.node-badges span {
  padding: 2px 6px;
  border: 1px solid color-mix(in srgb, var(--brand-copper) 34%, var(--bd-line));
  border-radius: 999px;
  color: var(--brand-copper);
  background: color-mix(in srgb, var(--brand-copper) 7%, transparent);
}

.node-action,
.version-action {
  flex: 0 0 auto;
  min-width: max-content;
  border: 1px solid color-mix(in srgb, var(--brand-moss) 34%, var(--bd-line));
  border-radius: 999px;
  color: var(--brand-moss);
  background: color-mix(in srgb, var(--brand-moss) 8%, var(--surface-raised));
  font-family: inherit;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;

  &:hover {
    border-color: var(--brand-moss);
    background: color-mix(in srgb, var(--brand-moss) 14%, var(--surface-raised));
  }
}

.node-action {
  padding: 4px 8px;
}

.version-node {
  gap: 4px;
  padding: 9px 10px 9px 42px;
  border-radius: 10px;

  b {
    position: absolute;
    left: 9px;
    top: 9px;
    display: grid;
    place-items: center;
    width: 25px;
    height: 25px;
    border: 1px solid var(--bd-line);
    border-radius: 999px;
    color: var(--t5);
    font-size: 10px;
  }

  span,
  strong,
  em {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--brand-copper);
    font-size: 10px;
    font-weight: 900;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 900;
  }

  em {
    color: var(--t5);
    font-size: 10px;
    font-style: normal;
    font-weight: 750;
  }

  &.status-applied {
    border-color: var(--brand-moss);
    background: color-mix(in srgb, var(--brand-moss) 11%, var(--paper-surface));
  }

  &.status-archived {
    opacity: 0.72;
  }
}

.version-action {
  position: absolute;
  right: 8px;
  bottom: 7px;
  padding: 4px 7px;
}

:deep(.vue-flow__edge.edge-outline path) {
  stroke: color-mix(in srgb, var(--brand-moss) 54%, transparent);
  stroke-width: 1.8;
}

:deep(.vue-flow__edge.edge-chapter_flow path) {
  stroke: color-mix(in srgb, var(--brand-copper) 62%, transparent);
  stroke-dasharray: 5 5;
}

:deep(.vue-flow__edge.edge-task_target path) {
  stroke: color-mix(in srgb, var(--brand-amber) 80%, transparent);
  stroke-dasharray: 6 6;
  stroke-width: 2;
}

:deep(.vue-flow__edge.edge-version_of path) {
  stroke: color-mix(in srgb, var(--brand-moss) 62%, transparent);
  stroke-dasharray: 2 4;
}

:deep(.vue-flow__minimap) {
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface-raised) 82%, transparent);
}

:deep(.vue-flow__controls) {
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  box-shadow: var(--sh-edge);
}
</style>

<style lang="scss">
.story-flow .vue-flow__pane {
  z-index: 0 !important;
}

.story-flow .vue-flow__nodes,
.story-flow .vue-flow__node {
  z-index: 2 !important;
}

.story-flow .vue-flow__node {
  visibility: visible !important;
}
</style>
