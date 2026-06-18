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
        :aria-label="item.label"
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
import { Collection, Connection, EditPen, House, Setting } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/', label: '工作台', icon: House },
  { path: '/projects', label: '小说项目', icon: Collection },
  { path: '/style-library', label: '风格资产库', icon: EditPen },
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
  flex: 0 0 166px;
  flex-direction: column;
  height: 100%;
  padding: 14px 10px;
  border-right: 1px solid var(--bd-panel);
  background: color-mix(in srgb, var(--surface-raised) 88%, transparent);
  box-shadow: var(--sh-panel);
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 2px 8px 14px;
  border-bottom: 1px solid var(--bd-line);
}

.brand-title {
  width: auto;
  height: auto;
  overflow: hidden;
  color: var(--t1);
  font-size: 15px;
  font-weight: 900;
  line-height: 1.1;
}

.brand-subtitle {
  display: block;
  color: var(--t5);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 38px;
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

  span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    color: var(--t2);
    background: var(--glass-subtle);
  }

  &.active {
    color: var(--on-brand);
    background: var(--brand-moss);
    border-color: var(--glass-active-bd);
    box-shadow: var(--sh-on);
  }
}
</style>
