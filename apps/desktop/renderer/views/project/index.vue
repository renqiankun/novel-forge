<template>
  <section class="project-shell">
    <header class="project-header">
      <div>
        <p class="eyebrow">Novel Project</p>
        <h1>{{ projectTitle }}</h1>
        <span>项目内数据默认隔离，世界事实库、角色关系、章节和审稿都绑定当前小说。</span>
      </div>
      <el-button :icon="Back" @click="backToProjects">返回项目列表</el-button>
    </header>

    <div class="project-body">
      <aside class="project-nav">
        <button
          v-for="item in projectNav"
          :key="item.path"
          class="project-nav-item"
          :class="{ active: route.name === item.name }"
          type="button"
          @click="go(item.path)"
        >
          <el-icon :size="16">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </button>
      </aside>

      <main class="project-content">
        <router-view />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Back,
  Files,
  Grid,
  Notebook,
  User,
  WarnTriangleFilled,
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => String(route.params.projectId ?? ''))
const projectTitle = computed(() => (projectId.value === 'demo-long-novel' ? '示例长篇项目' : projectId.value))

const projectNav = computed(() => {
  const prefix = `/projects/${projectId.value}`
  return [
    { path: `${prefix}/overview`, name: 'project-overview', label: '项目总览', icon: Grid },
    { path: `${prefix}/world`, name: 'project-world', label: '世界事实库', icon: Notebook },
    { path: `${prefix}/characters`, name: 'project-characters', label: '角色关系', icon: User },
    { path: `${prefix}/chapters`, name: 'project-chapters', label: '章节工作台', icon: Files },
    { path: `${prefix}/audit`, name: 'project-audit', label: '审稿校验', icon: WarnTriangleFilled },
  ]
})

const go = (path: string) => {
  router.push(path)
}

const backToProjects = () => {
  router.push('/projects')
}
</script>

<style lang="scss" scoped>
.project-shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 22px 24px 28px;
}

.project-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 0 4px 18px;
  border-bottom: 1px solid var(--bd-line);

  h1,
  p,
  span {
    margin: 0;
  }

  h1 {
    color: var(--t1);
    font-size: 26px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 8px;
    color: var(--t5);
    font-size: 13px;
    font-weight: 700;
  }
}

.eyebrow {
  margin-bottom: 6px;
  color: #a95d2d;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.project-body {
  display: grid;
  grid-template-columns: 184px minmax(0, 1fr);
  gap: 18px;
  flex: 1;
  min-height: 0;
  padding-top: 18px;
}

.project-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}

.project-nav-item {
  display: flex;
  align-items: center;
  height: 36px;
  gap: 9px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--t4);
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: var(--t2);
    background: var(--glass-subtle);
  }

  &.active {
    color: #f8f4ec;
    background: #365f4c;
    box-shadow: 0 8px 18px rgba(54, 95, 76, 0.2);
  }
}

.project-content {
  min-width: 0;
  min-height: 0;
}

@media (max-width: 980px) {
  .project-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .project-body {
    grid-template-columns: 1fr;
  }

  .project-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .project-nav-item {
    flex: 0 0 auto;
  }
}
</style>
