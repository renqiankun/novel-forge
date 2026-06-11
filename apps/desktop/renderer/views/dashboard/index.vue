<template>
  <section class="dashboard">
    <header class="page-header">
      <div>
        <p class="eyebrow">Local Story Engine</p>
        <h1>长篇小说推演工作台</h1>
        <span>全局工作台只管理项目和系统连接；世界、角色、章节、审稿都进入具体小说项目后处理。</span>
      </div>
      <div class="header-actions">
        <el-button :icon="Plus" type="primary" @click="go('/projects')">新建小说项目</el-button>
        <el-button :icon="Connection" @click="go('/mcp')">MCP 连接</el-button>
      </div>
    </header>

    <div class="summary-strip">
      <div v-for="item in summaries" :key="item.label" class="summary-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <div class="workspace-grid">
      <section class="panel project-panel">
        <div class="panel-head">
          <h2>推荐入口</h2>
          <span>Project First</span>
        </div>
        <div class="module-list">
          <button
            v-for="item in entries"
            :key="item.title"
            class="module-row"
            type="button"
            @click="go(item.path)"
          >
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <el-tag :type="item.type" effect="plain">{{ item.badge }}</el-tag>
          </button>
        </div>
      </section>

      <section class="panel flow-panel">
        <div class="panel-head">
          <h2>结构原则</h2>
          <span>v0.22</span>
        </div>
        <ol class="flow-list">
          <li v-for="item in flow" :key="item">{{ item }}</li>
        </ol>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Connection, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const summaries = [
  { label: '桌面壳', value: 'Electron' },
  { label: '本地库', value: 'SQLite' },
  { label: 'AI 模式', value: 'MCP' },
  { label: '数据边界', value: '按项目隔离' },
]

const entries = [
  {
    title: '小说项目',
    description: '创建或选择一部小说，再进入该小说的世界事实库、角色关系、章节工作台。',
    badge: '全局',
    type: 'success' as const,
    path: '/projects',
  },
  {
    title: '示例长篇项目',
    description: '查看项目内二级导航结构：总览、世界事实库、角色关系、章节、审稿。',
    badge: '项目内',
    type: 'info' as const,
    path: '/projects/demo-long-novel/overview',
  },
  {
    title: 'MCP 连接',
    description: '配置外部 Codex / Claude Code 访问本地故事上下文的工具入口。',
    badge: '系统',
    type: 'warning' as const,
    path: '/mcp',
  },
]

const flow = [
  '全局层只负责多小说项目列表、MCP 连接、本地设置和应用状态。',
  '世界事实库、角色关系、章节和审稿必须绑定 projectId。',
  '外部 AI Host 调用 MCP 工具时必须显式指定当前小说项目。',
  '跨项目共享规则后续作为高级功能处理，默认不混用数据。',
]

const go = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100%;
  padding: 26px 28px 34px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--bd-line);
}

.eyebrow {
  margin: 0 0 6px;
  color: #a95d2d;
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
  font-size: 28px;
  font-weight: 900;
}

.page-header span {
  display: block;
  margin-top: 8px;
  color: var(--t5);
  font-size: 13px;
  font-weight: 700;
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
  margin: 18px 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--bd-line);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 82px;
  padding: 16px;
  background: var(--glass-panel);

  span {
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }

  strong {
    color: var(--t1);
    font-size: 21px;
    font-weight: 900;
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 18px;
}

.panel {
  min-width: 0;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--glass-panel);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--bd-line);

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
  gap: 18px;
  min-height: 84px;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid var(--bd-line);
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--glass-subtle);
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
    margin-top: 6px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.55;
  }
}

.flow-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 18px 18px 18px 38px;
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
