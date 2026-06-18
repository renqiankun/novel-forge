<template>
  <el-dialog v-model="visible" title="正文查看 / 小修" width="min(980px, 94vw)" align-center class="nf-dialog canvas-dialog">
    <div class="reader-shell">
      <aside class="reader-context">
        <span class="eyebrow">Chapter</span>
        <h3>{{ detail?.chapter ? `第 ${detail.chapter.index} 章：${detail.chapter.title}` : '未选择章节' }}</h3>
        <p>{{ detail?.chapter?.intention || detail?.chapter?.summary || '暂无章节说明。' }}</p>
        <div class="reader-metrics">
          <span>当前字数 {{ detail?.chapter?.wordCount ?? 0 }}</span>
          <span>小修字数 {{ minorEditWordCount }}</span>
          <span>版本 {{ detail?.versions.length ?? 0 }}</span>
        </div>
      </aside>
      <section class="reader-editor">
        <el-input v-model="text" type="textarea" resize="none" :autosize="{ minRows: 18, maxRows: 24 }" />
      </section>
    </div>
    <p class="dialog-note">小修会保存为新的手动候选版本，并进入版本对比；确认后再替换定版正文。</p>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button @click="$emit('run-local-check')" :disabled="!detail?.chapter">先本地检查</el-button>
      <el-button type="primary" @click="$emit('save-minor-edit')" :disabled="!detail?.chapter">保存为小修候选</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasNodeDetail } from '@/api'

const props = defineProps<{
  modelValue: boolean
  detail: CanvasNodeDetail | null
  minorEditText: string
  minorEditWordCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:minorEditText': [value: string]
  'run-local-check': []
  'save-minor-edit': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const text = computed({
  get: () => props.minorEditText,
  set: (value) => emit('update:minorEditText', value),
})
</script>

<style lang="scss" scoped>
.reader-shell {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 10px;
  min-height: 420px;
}

.reader-context {
  min-width: 0;
  padding: 13px;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  background: var(--surface-field);

  h3,
  p {
    margin: 0;
  }

  h3 {
    margin-top: 6px;
    color: var(--t2);
    font-size: 15px;
    font-weight: 950;
    line-height: 1.45;
  }

  p {
    margin-top: 10px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 750;
    line-height: 1.7;
  }
}

.reader-metrics {
  display: grid;
  gap: 7px;
  margin-top: 14px;

  span {
    min-width: 0;
    padding: 7px 8px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    color: var(--t5);
    background: var(--paper-surface);
    font-size: 11px;
    font-weight: 850;
  }
}

.reader-editor {
  min-width: 0;

  :deep(.el-textarea),
  :deep(.el-textarea__inner) {
    height: 100%;
  }

  :deep(.el-textarea__inner) {
    color: var(--t2);
    background: var(--paper-surface);
    font-size: 14px;
    line-height: 1.9;
  }
}

.dialog-note {
  margin: 10px 0 0;
  color: var(--t5);
  font-size: 12px;
  font-weight: 750;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .reader-shell {
    grid-template-columns: 1fr;
  }
}
</style>
