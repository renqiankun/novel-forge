<template>
  <div class="nav-bar-wrap" :class="{ 'is-windows': isWindows }">
    <div class="nav-bar-left" @dblclick="toggleMaximize">
      <span class="app-mark"></span>
      <span class="app-name">NovelForge</span>
      <span class="app-subtitle">本地长篇小说推演系统</span>
    </div>
    <div class="nav-actions">
      <el-button :icon="isDark ? Sunny : Moon" circle @click="toggleTheme" />
    </div>
    <div v-if="isWindows" class="window-controls">
      <button class="window-control-btn" type="button" title="最小化" @click="minimize">
        <span class="minimize-icon"></span>
      </button>
      <button
        class="window-control-btn"
        type="button"
        :title="isMaximized ? '还原' : '最大化'"
        @click="toggleMaximize"
      >
        <span :class="isMaximized ? 'restore-icon' : 'maximize-icon'"></span>
      </button>
      <button class="window-control-btn close" type="button" title="关闭" @click="closeWindow">
        <span class="close-icon"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useTheme } from '@/hooks/useTheme'

const { isDark, toggle: toggleTheme } = useTheme()
const isWindows = ref(false)
const isMaximized = ref(false)
const windowControl = window.electronAPI?.windowControl

const minimize = () => {
  windowControl?.minimize()
}

const toggleMaximize = async () => {
  if (!isWindows.value) return
  isMaximized.value = Boolean(await windowControl?.toggleMaximize())
}

const closeWindow = () => {
  windowControl?.close()
}

onMounted(async () => {
  const state = await windowControl?.getState()
  isWindows.value = state?.platform === 'win32'
  isMaximized.value = Boolean(state?.isMaximized)
})
</script>

<style lang="scss" scoped>
.nav-bar-wrap {
  display: flex;
  align-items: center;
  flex: 0 0 36px;
  height: 36px;
  border-bottom: 1px solid var(--bd-panel);
  background: color-mix(in srgb, var(--glass-panel) 92%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &.is-windows {
    .nav-bar-left {
      -webkit-app-region: drag;
    }
  }
}

.nav-bar-left {
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  min-width: 0;
  gap: 9px;
  padding: 0 12px;
}

.app-mark {
  width: 13px;
  height: 13px;
  border: 2px solid #a95d2d;
  border-left-color: #47745d;
  transform: rotate(45deg);
}

.app-name {
  color: var(--t1);
  font-size: 12px;
  font-weight: 800;
}

.app-subtitle {
  color: var(--t5);
  font-size: 11px;
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 8px;
  -webkit-app-region: no-drag;
}

.window-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.window-control-btn {
  position: relative;
  width: 40px;
  height: 100%;
  border: 0;
  color: var(--el-text-color-primary);
  background: transparent;
  cursor: pointer;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.close:hover {
    color: #fff;
    background: #c73b32;
  }
}

.minimize-icon,
.maximize-icon,
.restore-icon,
.close-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);
}

.minimize-icon::before {
  position: absolute;
  left: 1px;
  right: 1px;
  bottom: 2px;
  height: 1px;
  content: '';
  background: currentColor;
}

.maximize-icon {
  border: 1px solid currentColor;
}

.restore-icon::before,
.restore-icon::after {
  position: absolute;
  width: 7px;
  height: 7px;
  content: '';
  border: 1px solid currentColor;
}

.restore-icon::before {
  right: 1px;
  top: 1px;
}

.restore-icon::after {
  left: 1px;
  bottom: 1px;
  background: var(--glass-panel);
}

.close-icon::before,
.close-icon::after {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 1px;
  content: '';
  background: currentColor;
}

.close-icon::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-icon::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
</style>
