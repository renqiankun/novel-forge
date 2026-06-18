<template>
  <footer class="global-status-bar">
    <div class="status-left">
      <span class="status-dot"></span>
      <span>本地项目状态已启用</span>
    </div>
    <span class="status-separator"></span>
    <div class="status-main">
      <span>MCP 工具契约与执行器已接入</span>
      <span class="muted">Electron 不直接调用 AI API</span>
      <span class="muted">正文文件目录可配置</span>
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
  background: color-mix(in srgb, var(--surface-raised) 86%, transparent);
  box-shadow: 0 -1px 0 rgba(78, 55, 31, 0.03);
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
  background: var(--brand-moss);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-moss) 18%, transparent);
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
