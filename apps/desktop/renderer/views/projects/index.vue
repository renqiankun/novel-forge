<template>
  <section class="projects-page">
    <header class="page-head">
      <div>
        <p class="eyebrow">PROJECT ARCHIVE</p>
        <h1>小说项目</h1>
        <span>这里管理本地项目档案。真正的写作、扩章和调整由外部 AI 通过 MCP 读取与回写。</span>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="clearWorkspace">清空本地数据</el-button>
        <el-button :icon="Plus" type="primary" @click="openCreateDialog">新建小说项目</el-button>
      </div>
    </header>

    <main v-loading="loading" class="project-ledger">
      <button
        v-for="project in projects"
        :key="project.id"
        class="project-row"
        type="button"
        @click="openProject(project.id)"
      >
        <div class="row-main">
          <div class="row-title">
            <h2>{{ project.title }}</h2>
            <span class="plain-mark">{{ statusLabel(project.status) }}</span>
          </div>
          <p>{{ project.description }}</p>
        </div>

        <div class="row-metrics" aria-label="项目状态">
          <span>
            <strong>{{ project.currentChapter }}</strong>
            当前章
          </span>
          <span>
            <strong>{{ project.targetChapters }}</strong>
            目标章
          </span>
          <span class="genre">
            <strong>{{ project.genre }}</strong>
            类型
          </span>
        </div>
      </button>
    </main>

    <el-dialog
      v-model="createDialogVisible"
      align-center
      class="nf-dialog"
      title="新建小说项目"
      width="540px"
    >
      <el-form label-position="top">
        <el-form-item label="项目名称">
          <el-input v-model="createForm.title" placeholder="例如：归声城手记" />
        </el-form-item>
        <el-form-item label="题材 / 类型">
          <el-input v-model="createForm.genre" placeholder="例如：东方玄幻、都市异闻、悬疑群像" />
        </el-form-item>
        <el-form-item label="目标章节">
          <el-input-number v-model="createForm.targetChapters" :min="1" :max="3000" />
        </el-form-item>
        <el-form-item label="项目说明">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="4"
            placeholder="给外部 AI 读取的项目定位、主线方向或当前开发目的。"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="createProject">创建并进入</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { novelApi, type NovelProject } from '@/api'

const router = useRouter()
const loading = ref(false)
const creating = ref(false)
const createDialogVisible = ref(false)
const projects = ref<NovelProject[]>([])

const createForm = reactive({
  title: '',
  genre: '',
  targetChapters: 300,
  description: '',
})

const loadProjects = async () => {
  loading.value = true
  try {
    projects.value = await novelApi.listProjects()
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  Object.assign(createForm, {
    title: '',
    genre: '',
    targetChapters: 300,
    description: '',
  })
  createDialogVisible.value = true
}

const createProject = async () => {
  if (!createForm.title.trim()) {
    ElMessage.warning('先给小说项目起个名字')
    return
  }
  creating.value = true
  try {
    const project = await novelApi.createProject({
      title: createForm.title.trim(),
      genre: createForm.genre.trim(),
      targetChapters: createForm.targetChapters,
      description: createForm.description.trim(),
    })
    ElMessage.success('项目已创建')
    createDialogVisible.value = false
    router.push(`/projects/${project.id}/mcp-status`)
  } finally {
    creating.value = false
  }
}

const clearWorkspace = async () => {
  try {
    await ElMessageBox.confirm('会清空当前本地小说项目数据；浏览器预览会恢复示例数据。', '清空本地数据', {
      type: 'warning',
      confirmButtonText: '清空',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await novelApi.clearWorkspace()
  ElMessage.success('本地数据已清空')
  await loadProjects()
}

const openProject = (projectId: string) => {
  router.push(`/projects/${projectId}/mcp-status`)
}

const statusLabel = (status: NovelProject['status']) => {
  const labels: Record<NovelProject['status'], string> = {
    planning: '规划中',
    drafting: '连载中',
    reviewing: '复核中',
    paused: '暂停',
  }
  return labels[status]
}

onMounted(loadProjects)
</script>

<style lang="scss" scoped>
.projects-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 100%;
  padding: 18px 22px 28px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 72px;
  padding: 12px 14px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface-raised) 94%, transparent), var(--surface-soft)),
    var(--surface-raised);
  box-shadow: var(--sh-card);

  h1,
  p,
  span {
    margin: 0;
  }

  h1 {
    color: var(--t1);
    font-size: 24px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 5px;
    overflow: hidden;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.eyebrow {
  color: var(--brand-copper);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.head-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.project-ledger {
  min-height: 0;
  margin-top: 10px;
  overflow: auto;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--surface-raised);
  box-shadow: var(--sh-card);
}

.project-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, auto);
  align-items: center;
  width: 100%;
  min-height: 84px;
  padding: 14px;
  border: 0;
  border-bottom: 1px solid var(--bd-line);
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.14s ease,
    box-shadow 0.14s ease;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: var(--glass-card-h);
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--brand-moss) 72%, transparent);
  }
}

.row-main {
  min-width: 0;

  p {
    margin: 6px 0 0;
    overflow: hidden;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.55;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.row-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  h2 {
    margin: 0;
    overflow: hidden;
    color: var(--t1);
    font-size: 16px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.plain-mark {
  flex: 0 0 auto;
  color: var(--brand-moss);
  font-size: 12px;
  font-weight: 900;
}

.row-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(72px, 1fr));
  border-left: 1px solid var(--bd-line);

  span {
    display: grid;
    align-content: center;
    min-width: 0;
    padding: 0 12px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }

  strong {
    overflow: hidden;
    color: var(--t2);
    font-size: 17px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.genre strong {
  font-size: 13px;
}

@media (max-width: 920px) {
  .page-head,
  .project-row {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
  }

  .row-metrics {
    width: 100%;
    margin-top: 10px;
    padding-top: 10px;
    border-left: 0;
    border-top: 1px solid var(--bd-line);
  }
}
</style>
