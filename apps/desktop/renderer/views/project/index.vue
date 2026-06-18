<template>
  <section class="project-workbench">
    <aside class="project-console">
      <div class="console-head">
        <span class="eyebrow">Novel Project</span>
        <h1>{{ projectTitle }}</h1>
        <p>{{ projectSubtitle }}</p>
      </div>

      <div class="project-picker">
        <span>切换小说项目</span>
        <el-select v-model="selectedProjectId" size="small" filterable @change="switchProject">
          <el-option v-for="item in projects" :key="item.id" :label="item.title" :value="item.id" />
        </el-select>
      </div>

      <div class="console-stats">
        <div>
          <strong>{{ canvasStats.chapters }}</strong>
          <span>章节</span>
        </div>
        <div>
          <strong>{{ canvasStats.tasks }}</strong>
          <span>任务</span>
        </div>
        <div>
          <strong>{{ canvasStats.pendingReviews }}</strong>
          <span>待沉淀</span>
        </div>
      </div>

      <nav class="console-menu" aria-label="项目画布功能">
        <button
          class="console-menu-item"
          :class="{ active: !activePanel }"
          type="button"
          @click="openCanvas"
        >
          <el-icon><DataBoard /></el-icon>
          <span>小说画布</span>
        </button>
        <button
          v-for="item in panelItems"
          :key="item.panel"
          class="console-menu-item"
          :class="{ active: activePanel === item.panel }"
          type="button"
          @click="openPanel(item.panel)"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="console-actions">
        <el-button type="primary" :icon="Plus" @click="openPanel('task-new')">记录 AI 任务包</el-button>
        <el-button :icon="Refresh" @click="refreshCanvas">刷新画布</el-button>
      </div>

      <div class="console-note">
        <strong>被动工作台</strong>
        <span>App 不直接调用 AI。外部 AI 读取 MCP 状态，回填版本、风格、事实和任务结果。</span>
      </div>

      <el-button class="back-button" text :icon="Back" @click="backToProjects">返回项目列表</el-button>
    </aside>

    <main class="project-canvas-host">
      <router-view />
    </main>
  </section>
</template>

<script setup lang="ts">
import {
  Back,
  Box,
  Collection,
  Connection,
  DataBoard,
  DocumentChecked,
  Download,
  Files,
  Notebook,
  Plus,
  Refresh,
  Share,
  TrendCharts,
} from '@element-plus/icons-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { novelApi, type NovelProject, type ProjectCanvas } from '@/api'

type PanelKey =
  | 'mcp-status'
  | 'task-package'
  | 'context-pack'
  | 'outline'
  | 'long-state'
  | 'style-dialogue'
  | 'audit'
  | 'snapshots'
  | 'export'
  | 'task-new'

const route = useRoute()
const router = useRouter()
const projects = ref<NovelProject[]>([])
const project = ref<NovelProject | null>(null)
const canvas = ref<ProjectCanvas | null>(null)
const selectedProjectId = ref('')

const projectId = computed(() => String(route.params.projectId ?? ''))
const activePanel = computed(() => String(route.query.panel ?? ''))
const projectTitle = computed(() => project.value?.title || projectId.value)
const projectSubtitle = computed(() =>
  project.value
    ? `${project.value.genre} / 当前第 ${project.value.currentChapter} 章 / 目标 ${project.value.targetChapters} 章`
    : '项目状态按小说隔离，画布用于给外部 AI 控制端读取和回填。',
)
const canvasStats = computed(() => canvas.value?.stats ?? { volumes: 0, chapters: 0, tasks: 0, pendingReviews: 0, versions: 0 })

const panelItems: Array<{ panel: PanelKey; label: string; icon: object }> = [
  { panel: 'mcp-status', label: 'MCP 状态', icon: Connection },
  { panel: 'task-package', label: '任务包', icon: Share },
  { panel: 'context-pack', label: '当前写作参考', icon: Collection },
  { panel: 'outline', label: '完整大纲', icon: Files },
  { panel: 'long-state', label: '长篇状态', icon: TrendCharts },
  { panel: 'style-dialogue', label: '风格资产', icon: Notebook },
  { panel: 'audit', label: '审稿检查', icon: DocumentChecked },
  { panel: 'snapshots', label: '快照导入导出', icon: Box },
  { panel: 'export', label: '正文导出', icon: Download },
]

const navigateCanvas = (query?: Record<string, string>) => {
  router.push({
    name: 'project-canvas',
    params: { projectId: projectId.value },
    query,
  })
}

const openCanvas = () => navigateCanvas()
const openPanel = (panel: PanelKey) => navigateCanvas({ panel })
const backToProjects = () => router.push('/projects')

const switchProject = (id: string | number | boolean | Record<string, unknown>) => {
  if (typeof id !== 'string' || !id) return
  router.push({ name: 'project-canvas', params: { projectId: id } })
}

const refreshCanvas = () => {
  window.dispatchEvent(new CustomEvent('novel-forge:canvas-action', { detail: { action: 'refresh', projectId: projectId.value } }))
}

const loadShell = async () => {
  projects.value = await novelApi.listProjects()
  selectedProjectId.value = projectId.value
  project.value = projects.value.find((item) => item.id === projectId.value) ?? null
  canvas.value = projectId.value ? await novelApi.getProjectCanvas(projectId.value) : null
}

watch(projectId, loadShell)
onMounted(loadShell)
</script>

<style lang="scss" scoped>
.project-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 32px 32px, color-mix(in srgb, var(--brand-copper) 8%, transparent), transparent 28%),
    linear-gradient(135deg, var(--app-bg), var(--surface-sunken));
}

.project-console {
  display: none;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding: 14px 9px;
  border-right: 1px solid var(--bd-line);
  background: color-mix(in srgb, var(--surface-raised) 72%, transparent);
  box-shadow: 8px 0 30px color-mix(in srgb, var(--shadow-color) 12%, transparent);
  overflow: hidden;
}

.console-head {
  display: grid;
  place-items: center;
  padding: 0 0 7px;
  border-bottom: 1px solid var(--bd-line);

  .eyebrow {
    display: none;
    color: var(--brand-copper);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    margin: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--brand-moss) 32%, var(--bd-line));
    border-radius: 13px;
    color: transparent;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--brand-moss) 96%, black), color-mix(in srgb, var(--brand-copper) 92%, black)),
      var(--surface-raised);
    font-weight: 900;

    &::before {
      content: 'P';
      color: var(--on-brand);
      font-size: 19px;
    }
  }

  p {
    display: none;
  }
}

.project-picker {
  display: none;
}

.console-stats {
  display: none;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  background: var(--surface-raised);
  box-shadow: var(--sh-edge);

  div {
    display: grid;
    gap: 2px;
    min-width: 0;
    padding: 9px 7px;
    border-right: 1px solid var(--bd-line);

    &:last-child {
      border-right: 0;
    }
  }

  strong {
    color: var(--t1);
    font-size: 19px;
    line-height: 1;
  }

  span {
    overflow: hidden;
    color: var(--t5);
    font-size: 10px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.console-menu {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.console-menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  min-height: 40px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--t4);
  background: transparent;
  font-size: 14px;
  font-weight: 850;
  text-align: left;
  cursor: pointer;

  span {
    display: none;
  }

  &:hover {
    border-color: var(--bd-line);
    color: var(--t2);
    background: var(--surface-soft);
  }

  &.active {
    color: var(--on-brand);
    background: linear-gradient(135deg, var(--brand-moss), var(--brand-copper));
    box-shadow: var(--sh-on);
  }
}

.console-actions {
  display: grid;
  gap: 7px;

  :deep(.el-button) {
    justify-content: center;
    width: 44px;
    height: 36px;
    margin-left: 0;
    padding: 0;

    span {
      display: none;
    }
  }
}

.console-note {
  display: none;
  gap: 4px;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-copper) 25%, var(--bd-line));
  border-radius: 10px;
  color: var(--t5);
  background: color-mix(in srgb, var(--brand-copper) 8%, var(--surface-raised));
  font-size: 11px;
  font-weight: 700;
  line-height: 1.55;

  strong {
    color: var(--t2);
    font-size: 12px;
  }
}

.back-button {
  justify-content: center;
  width: 44px;
  margin-top: auto;
  margin-left: 0;

  span {
    display: none;
  }
}

.project-canvas-host {
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 980px) {
  .project-workbench {
    grid-template-columns: minmax(0, 1fr);
  }

  .console-head,
  .project-picker,
  .console-stats,
  .console-note,
  .back-button {
    display: none;
  }

  .console-menu-item {
    justify-content: center;
    padding: 0;

    span {
      display: none;
    }
  }

  .console-actions :deep(.el-button span) {
    display: none;
  }
}
</style>
