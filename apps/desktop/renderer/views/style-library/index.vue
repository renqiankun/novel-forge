<template>
  <section v-loading="loading" class="style-library-page">
    <header class="page-head">
      <div>
        <span class="eyebrow">Global Style Library</span>
        <h1>风格资产库</h1>
        <p>这里只维护可复用模板；具体小说项目会在自己的风格弹窗中选择并生成项目内副本。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="startCreate">新增模板</el-button>
    </header>

    <div class="library-layout">
      <aside class="template-list">
        <div class="list-head">
          <strong>模板</strong>
          <span>{{ templates.length }} 个</span>
        </div>
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          class="template-row"
          :class="{ active: template.id === selectedTemplateId }"
          @click="selectTemplate(template.id)"
        >
          <span>{{ styleAssetKindLabel(template.kind) }}</span>
          <strong>{{ template.title }}</strong>
          <em>{{ template.scope }} / {{ template.tags.join('、') || '未标记' }}</em>
        </button>
        <el-empty v-if="!templates.length" description="暂无风格模板" />
      </aside>

      <main class="template-main">
        <section class="editor-card">
          <div class="card-head">
            <div>
              <span class="eyebrow">Template Editor</span>
              <h2>{{ form.id ? '编辑模板' : '新增模板' }}</h2>
            </div>
            <el-button v-if="form.id" text type="danger" @click="deleteTemplate">删除模板</el-button>
          </div>

          <el-form label-position="top" class="form-grid">
            <el-form-item label="类型">
              <el-select v-model="form.kind">
                <el-option v-for="item in kindOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源">
              <el-select v-model="form.source">
                <el-option label="预设" value="preset" />
                <el-option label="自定义" value="user" />
              </el-select>
            </el-form-item>
            <el-form-item label="标题" class="wide">
              <el-input v-model="form.title" placeholder="例如：高压破声点节奏" />
            </el-form-item>
            <el-form-item label="适用范围">
              <el-input v-model="form.scope" placeholder="全书 / 卷 / 角色 / 场景" />
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="tagsInput" placeholder="用顿号、逗号或空格分隔" />
            </el-form-item>
            <el-form-item label="模板内容" class="wide">
              <el-input v-model="form.body" type="textarea" :rows="8" />
            </el-form-item>
          </el-form>

          <div class="editor-actions">
            <el-button type="primary" @click="saveTemplate">保存模板</el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </section>

        <section class="preview-card">
          <div class="preview-head">
            <span>{{ activeTemplate ? styleAssetKindLabel(activeTemplate.kind) : '预览' }}</span>
            <strong>{{ activeTemplate?.title || '请选择模板' }}</strong>
          </div>
          <p>{{ activeTemplate?.body || '模板内容会在这里预览。' }}</p>
          <div v-if="activeTemplate" class="tag-list">
            <span v-for="tag in activeTemplate.tags" :key="tag">{{ tag }}</span>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { novelApi, type StyleAssetKind, type StyleAssetTemplate } from '@/api'
import { styleAssetKindLabel } from '@/views/project-canvas/labels'

const loading = ref(false)
const templates = ref<StyleAssetTemplate[]>([])
const selectedTemplateId = ref('')
const tagsInput = ref('')

const kindOptions: Array<{ value: StyleAssetKind; label: string }> = [
  { value: 'project_style', label: '项目风格' },
  { value: 'volume_style', label: '卷风格' },
  { value: 'scene_mode', label: '场景模式' },
  { value: 'character_voice', label: '角色语气' },
  { value: 'dialogue_sample', label: '对白样本' },
  { value: 'good_sample', label: '好段落' },
  { value: 'bad_pattern', label: '坏模式' },
  { value: 'forbidden', label: '禁止项' },
]

const form = reactive({
  id: '',
  kind: 'project_style' as StyleAssetKind,
  title: '',
  body: '',
  scope: '全书',
  source: 'user' as 'preset' | 'user',
})

const activeTemplate = computed(() => templates.value.find((item) => item.id === selectedTemplateId.value))

const parseTags = () =>
  tagsInput.value
    .split(/[、,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const fillForm = (template: StyleAssetTemplate) => {
  form.id = template.id
  form.kind = template.kind
  form.title = template.title
  form.body = template.body
  form.scope = template.scope
  form.source = template.source
  tagsInput.value = template.tags.join('、')
}

const resetForm = () => {
  form.id = ''
  form.kind = 'project_style'
  form.title = ''
  form.body = ''
  form.scope = '全书'
  form.source = 'user'
  tagsInput.value = ''
}

const selectTemplate = (templateId: string) => {
  selectedTemplateId.value = templateId
  const template = templates.value.find((item) => item.id === templateId)
  if (template) fillForm(template)
}

const startCreate = () => {
  selectedTemplateId.value = ''
  resetForm()
}

const loadData = async () => {
  loading.value = true
  try {
    const templateRows = await novelApi.listStyleAssetTemplates()
    templates.value = templateRows
    if (!selectedTemplateId.value && templateRows[0]) selectTemplate(templateRows[0].id)
  } finally {
    loading.value = false
  }
}

const saveTemplate = async () => {
  if (!form.title.trim() || !form.body.trim()) {
    ElMessage.warning('请填写模板标题和内容')
    return
  }
  const template = await novelApi.saveStyleAssetTemplate({
    id: form.id || undefined,
    kind: form.kind,
    title: form.title,
    body: form.body,
    scope: form.scope,
    source: form.source,
    tags: parseTags(),
  })
  ElMessage.success('风格模板已保存')
  await loadData()
  selectTemplate(template.id)
}

const deleteTemplate = async () => {
  if (!form.id) return
  await ElMessageBox.confirm('删除后不会影响已经引入项目内的风格资产副本。确认删除？', '删除风格模板', { type: 'warning' })
  await novelApi.deleteStyleAssetTemplate(form.id)
  ElMessage.success('风格模板已删除')
  selectedTemplateId.value = ''
  resetForm()
  await loadData()
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.style-library-page {
  min-height: 100%;
  padding: 22px;
  background:
    radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--brand-moss) 9%, transparent), transparent 28%),
    var(--app-bg);
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;

  h1,
  p {
    margin: 0;
  }

  h1 {
    margin-top: 4px;
    color: var(--t1);
    font-size: 26px;
    font-weight: 950;
  }

  p {
    margin-top: 6px;
    color: var(--t5);
    font-size: 13px;
    font-weight: 750;
  }
}

.eyebrow {
  color: var(--brand-copper);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.library-layout {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 14px;
  min-height: calc(100vh - 168px);
}

.template-list,
.editor-card,
.preview-card {
  min-width: 0;
  border: 1px solid var(--bd-line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-raised) 92%, transparent);
  box-shadow: var(--sh-panel);
}

.template-list {
  overflow: auto;
  padding: 10px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  padding: 4px 4px 10px;
  color: var(--t5);
  font-size: 12px;
  font-weight: 850;

  strong {
    color: var(--t2);
  }
}

.template-row {
  display: block;
  width: 100%;
  min-width: 0;
  padding: 10px 11px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover,
  &.active {
    border-color: color-mix(in srgb, var(--brand-moss) 30%, var(--bd-line));
    background: color-mix(in srgb, var(--brand-moss) 7%, var(--surface-field));
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
    margin-top: 4px;
    color: var(--t2);
    font-size: 13px;
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

.template-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  grid-auto-rows: max-content;
  gap: 14px;
}

.editor-card {
  grid-row: span 2;
  padding-bottom: 14px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.card-head {
  padding: 14px 15px 10px;
  border-bottom: 1px solid var(--bd-line);
}

.card-head h2 {
  margin: 3px 0 0;
  color: var(--t2);
  font-size: 16px;
  font-weight: 950;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 12px;
  padding: 14px 15px 0;

  .wide {
    grid-column: 1 / -1;
  }
}

.editor-actions {
  display: flex;
  gap: 8px;
  padding: 0 15px;
}

.preview-card {
  overflow: hidden;
}

.preview-head {
  padding: 13px 14px;
  border-bottom: 1px solid var(--bd-line);
  background: var(--surface-field);

  span,
  strong {
    display: block;
  }

  span {
    color: var(--brand-copper);
    font-size: 10px;
    font-weight: 900;
  }

  strong {
    margin-top: 4px;
    color: var(--t2);
    font-size: 15px;
    font-weight: 950;
  }
}

.preview-card p {
  margin: 0;
  padding: 13px 14px;
  color: var(--t4);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.7;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 14px 14px;

  span {
    padding: 3px 7px;
    border: 1px solid color-mix(in srgb, var(--brand-copper) 30%, var(--bd-line));
    border-radius: 999px;
    color: var(--brand-copper);
    background: color-mix(in srgb, var(--brand-copper) 7%, transparent);
    font-size: 11px;
    font-weight: 850;
  }
}

@media (max-width: 1180px) {
  .library-layout,
  .template-main {
    grid-template-columns: 1fr;
  }

}
</style>
