<template>
  <section class="dashboard">
    <header class="page-header">
      <div>
        <p class="eyebrow">Local Story Engine</p>
        <h1>长篇小说 MCP 工作台</h1>
        <span>全局层只管理项目、MCP 连接和本地设置；正文、世界、角色、风格、审稿都进入具体小说项目后处理。</span>
      </div>
      <div class="header-actions">
        <el-button :icon="Plus" type="primary" @click="go('/projects')">新建小说项目</el-button>
        <el-button :icon="Connection" @click="go('/mcp')">MCP 连接</el-button>
      </div>
    </header>

    <div v-loading="loading" class="summary-strip">
      <div v-for="item in summaries" :key="item.label" class="summary-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <div class="workspace-grid">
      <section class="panel">
        <div class="panel-head">
          <h2>项目入口</h2>
          <span>Project First</span>
        </div>
        <div class="module-list">
          <button
            v-for="item in projectEntries"
            :key="item.project.id"
            class="module-row"
            type="button"
            @click="go(`/projects/${item.project.id}/mcp-status`)"
          >
            <div>
              <h3>{{ item.project.title }}</h3>
              <p>{{ item.project.description }}</p>
            </div>
            <span class="plain-mark">{{ item.stats.chapters }} 章</span>
          </button>
          <button class="module-row" type="button" @click="go('/projects')">
            <div>
              <h3>管理全部小说项目</h3>
              <p>创建、切换和验证多项目隔离。</p>
            </div>
            <span class="plain-mark">全局</span>
          </button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>工作原则</h2>
          <span>AI-controller first</span>
        </div>
        <ol class="flow-list">
          <li>Codex / Claude Code 通过未来 MCP 读取项目上下文。</li>
          <li>正文生成、重写、下 10 章、下 100 章等发起动作在外部 AI 控制端完成。</li>
          <li>App 负责状态可视化、版本对比、本地检查、高风险确认和导出。</li>
          <li>低风险事实和提示尽量沉淀给 Context Pack，不变成人工确认负担。</li>
        </ol>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Connection, Plus } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { novelApi, type ProjectDashboard } from '@/api'

const router = useRouter()
const loading = ref(false)
const projectEntries = ref<ProjectDashboard[]>([])

const summaries = computed(() => {
  const projects = projectEntries.value.length
  const chapters = projectEntries.value.reduce((total, item) => total + item.stats.chapters, 0)
  const pendingFacts = projectEntries.value.reduce((total, item) => total + item.stats.pendingFacts, 0)
  const auditIssues = projectEntries.value.reduce((total, item) => total + item.stats.auditIssues, 0)
  return [
    { label: '本地项目', value: String(projects) },
    { label: '章节记录', value: String(chapters) },
    { label: '候选事实', value: String(pendingFacts) },
    { label: '审稿风险', value: String(auditIssues) },
  ]
})

const go = (path: string) => {
  router.push(path)
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const projects = await novelApi.listProjects()
    projectEntries.value = await Promise.all(
      projects.slice(0, 4).map((project) => novelApi.getProjectDashboard(project.id)),
    )
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100%;
  padding: 16px 22px 28px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 68px;
  padding: 10px 12px;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface-raised) 88%, transparent);
  box-shadow: var(--sh-edge);

  > div:first-child {
    min-width: 0;
  }
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--brand-copper);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  color: var(--t1);
  font-size: 23px;
  font-weight: 900;
}

.page-header span {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: var(--t5);
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 10px 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--bd-line) 82%, transparent);
  box-shadow: var(--sh-edge);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 58px;
  padding: 10px 13px;
  background: var(--surface-raised);

  span {
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }

  strong {
    color: var(--t1);
    font-size: 19px;
    font-weight: 900;
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 8px;
}

.panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface-raised) 90%, transparent);
  box-shadow: var(--sh-edge);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--bd-line);
  background: color-mix(in srgb, var(--surface-field) 72%, transparent);

  h2 {
    color: var(--t1);
    font-size: 15px;
    font-weight: 900;
  }

  span {
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }
}

.module-list {
  display: flex;
  flex-direction: column;
}

.module-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 58px;
  padding: 10px 14px;
  border: 0;
  border-bottom: 1px solid var(--bd-line);
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--glass-subtle);
    box-shadow: inset 3px 0 0 var(--brand-moss);
  }

  &:last-child {
    border-bottom: 0;
  }

  h3 {
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  p {
    margin-top: 4px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.55;
  }
}

.plain-mark {
  color: var(--t5);
  font-size: 11px;
  font-weight: 900;
}

.flow-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 12px 16px 14px 32px;
  color: var(--t3);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
}

@media (max-width: 980px) {
  .page-header,
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
