<template>
  <footer class="global-status-bar">
    <div class="status-left">
      <span class="status-dot"></span>
      <span>本地 SQLite 已准备</span>
    </div>
    <span class="status-separator"></span>
    <div class="status-main">
      <span>MCP 占位服务待实现</span>
      <span class="muted">Electron 不直接调用 AI API</span>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.global-status-bar {
  display: flex;
  align-items: center;
  flex: 0 0 28px;
  height: 28px;
  gap: 10px;
  padding: 0 12px;
  border-top: 1px solid var(--bd-panel);
  color: var(--t4);
  background: color-mix(in srgb, var(--glass-panel) 82%, transparent);
  font-size: 11px;
  font-weight: 700;
}

.status-left,
.status-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.status-main {
  flex: 1;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #3f8d64;
  box-shadow: 0 0 0 3px rgba(63, 141, 100, 0.13);
}

.status-separator {
  width: 1px;
  height: 14px;
  background: var(--bd-line);
}

.muted {
  color: var(--t5);
}
</style>
