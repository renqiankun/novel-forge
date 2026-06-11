<template>
  <aside class="layout-side-bar">
    <div class="brand-block">
      <div class="brand-title">NovelForge</div>
      <div class="brand-subtitle">Story OS</div>
    </div>

    <nav class="nav-list">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: item.path === activePath }"
        type="button"
        @click="go(item.path)"
      >
        <el-icon :size="16">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { Collection, Connection, House, Setting } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/', label: '工作台', icon: House },
  { path: '/projects', label: '小说项目', icon: Collection },
  { path: '/mcp', label: 'MCP 连接', icon: Connection },
  { path: '/settings', label: '本地设置', icon: Setting },
]

const activePath = computed(() => {
  if (route.path === '/') return '/'
  if (route.path.startsWith('/projects')) return '/projects'
  return `/${route.path.split('/')[1]}`
})

const go = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.layout-side-bar {
  display: flex;
  flex: 0 0 176px;
  flex-direction: column;
  height: 100%;
  padding: 14px 10px;
  border-right: 1px solid var(--bd-panel);
  background: color-mix(in srgb, var(--glass-panel) 88%, transparent);
}

.brand-block {
  padding: 4px 8px 15px;
  border-bottom: 1px solid var(--bd-line);
}

.brand-title {
  color: var(--t1);
  font-size: 15px;
  font-weight: 900;
  line-height: 1.1;
}

.brand-subtitle {
  margin-top: 3px;
  color: var(--t5);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 34px;
  gap: 9px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--t4);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: var(--t2);
    background: var(--glass-subtle);
  }

  &.active {
    color: #f8f4ec;
    background: #365f4c;
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 18px rgba(54, 95, 76, 0.2);
  }
}
</style>
