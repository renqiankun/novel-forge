<template>
  <el-dialog v-model="visible" title="重写条件" width="min(620px, 92vw)" align-center class="nf-dialog canvas-dialog">
    <el-form label-position="top" class="form-grid">
      <el-form-item label="重写范围">
        <el-select v-model="rewriteForm.scope">
          <el-option label="段落微调" value="paragraph" />
          <el-option label="场景重写" value="scene" />
          <el-option label="整章重写" value="chapter" />
          <el-option label="对白调整" value="dialogue" />
        </el-select>
      </el-form-item>
      <el-form-item label="重写模式">
        <el-select v-model="rewriteForm.mode">
          <el-option label="风格语气" value="style_voice" />
          <el-option label="对白" value="dialogue" />
          <el-option label="场景表达" value="scene_expression" />
          <el-option label="章节桥接" value="chapter_bridge" />
          <el-option label="影响剧情" value="plot_impact" />
        </el-select>
      </el-form-item>
      <el-form-item label="影响等级">
        <el-select v-model="rewriteForm.level">
          <el-option label="L0 轻微标点" value="L0" />
          <el-option label="L1 语句微调" value="L1" />
          <el-option label="L2 场景表达" value="L2" />
          <el-option label="L3 关系/事实可能变化" value="L3" />
          <el-option label="L4 剧情硬变化" value="L4" />
        </el-select>
      </el-form-item>
      <el-form-item class="wide" label="给外部 AI 的建议">
        <el-input v-model="rewriteForm.reason" type="textarea" :rows="5" />
      </el-form-item>
    </el-form>
    <p class="dialog-note">本软件不直接生成正文。这里会把条件写成 AI 任务包，外部 AI 读取本地项目数据后回填候选版本。</p>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="$emit('submit')">提交为 AI 任务包</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RewriteLevel, RewriteMode, RewriteScope } from '@/api'

const props = defineProps<{
  modelValue: boolean
  rewriteForm: {
    scope: RewriteScope
    mode: RewriteMode
    level: RewriteLevel
    reason: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style lang="scss" scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  .wide {
    grid-column: 1 / -1;
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
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
