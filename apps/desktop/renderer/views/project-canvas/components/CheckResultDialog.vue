<template>
  <el-dialog v-model="visible" title="本地检查结果" width="min(720px, 92vw)" align-center class="nf-dialog canvas-dialog">
    <template v-if="latestCheckResult">
      <div class="check-summary">
        <strong>{{ latestCheckResult.level }} / {{ latestCheckResult.issues.length }} 项提示</strong>
        <span>本地规则，不消耗 AI Token</span>
      </div>
      <article v-for="issue in latestCheckResult.issues" :key="issue.id" class="check-row">
        <strong>{{ issue.title }}</strong>
        <p>{{ issue.body }}</p>
        <small>{{ issue.category }} / {{ issue.level }} / {{ issue.evidence || '无证据片段' }}</small>
      </article>
    </template>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LocalCheckResult } from '@/api'

const props = defineProps<{
  modelValue: boolean
  latestCheckResult: LocalCheckResult | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style lang="scss" scoped>
.check-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--bd-line);
}

.check-row {
  padding: 11px 0;
  border-bottom: 1px solid var(--bd-line);

  strong,
  p,
  small {
    display: block;
    margin: 0;
  }

  p,
  small {
    margin-top: 6px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}
</style>
