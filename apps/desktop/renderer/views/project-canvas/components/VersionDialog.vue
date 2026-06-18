<template>
  <el-dialog v-model="visible" title="版本对比与定版" width="min(1120px, 94vw)" align-center class="nf-dialog canvas-dialog">
    <div class="version-shell">
      <section class="version-compare">
        <article>
          <h3>当前正文</h3>
          <pre>{{ detail?.chapter?.draft || detail?.chapter?.summary || '暂无正文' }}</pre>
        </article>
        <article>
          <h3>候选版本 #{{ selectedVersionIndex }}</h3>
          <pre>{{ selectedVersion?.body || '请在右侧选择版本' }}</pre>
        </article>
      </section>
      <aside class="version-list">
        <button
          v-for="(version, index) in detail?.versions ?? []"
          :key="version.id"
          type="button"
          class="version-row"
          :class="{ active: selectedId === version.id }"
          @click="selectedId = version.id"
        >
          <b>#{{ index + 1 }}</b>
          <span>
            <strong>{{ version.title }}</strong>
            <em>{{ versionStatusLabel(version.status) }} / {{ version.source }} / {{ version.wordCount }} 字</em>
          </span>
        </button>
      </aside>
    </div>
    <template #footer>
      <span class="footer-hint">替换新版本会先创建快照，再把选中候选版本设为定版正文。</span>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" :disabled="!selectedVersion" @click="$emit('apply')">替换新版本</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasNodeDetail, ChapterVersion } from '@/api'
import { versionStatusLabel } from '../labels'

const props = defineProps<{
  modelValue: boolean
  detail: CanvasNodeDetail | null
  selectedVersionId: string
  selectedVersion: ChapterVersion | undefined
  selectedVersionIndex: number | string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:selectedVersionId': [value: string]
  apply: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectedId = computed({
  get: () => props.selectedVersionId,
  set: (value) => emit('update:selectedVersionId', value),
})
</script>

<style lang="scss" scoped>
.version-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 10px;
  height: min(70vh, 660px);
  overflow: hidden;
}

.version-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  min-height: 0;
  overflow: hidden;

  article {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 12px;
    border: 1px solid var(--bd-line);
    border-radius: 10px;
    background: var(--surface-raised);
  }

  h3 {
    flex: 0 0 auto;
    margin: 0 0 8px;
    color: var(--t2);
    font-size: 13px;
    font-weight: 950;
  }

  pre {
    flex: 1 1 auto;
    min-height: 0;
    margin: 0;
    padding: 12px;
    overflow: auto;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    color: var(--t2);
    background: var(--paper-surface);
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  background: var(--surface-field);
}

.version-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  color: inherit;
  background: var(--paper-surface);
  text-align: left;
  cursor: pointer;

  &.active {
    border-color: var(--brand-moss);
    box-shadow: inset 2px 0 0 var(--brand-moss);
  }

  b {
    display: grid;
    place-items: center;
    height: 25px;
    border: 1px solid var(--bd-line);
    border-radius: 999px;
    color: var(--t5);
    font-size: 11px;
  }

  strong,
  em {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }

  em {
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-style: normal;
    font-weight: 750;
  }
}

.footer-hint {
  margin-right: auto;
  color: var(--t5);
  font-size: 12px;
  font-weight: 750;
}

@media (max-width: 1100px) {
  .version-shell,
  .version-compare {
    grid-template-columns: 1fr;
  }
}
</style>
