<template>
  <div class="layout-wrap">
    <nav-bar />
    <div class="layout-main">
      <side-bar />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
    <global-status-bar />
  </div>
</template>

<script setup lang="ts">
import globalStatusBar from './global-status-bar/index.vue'
import navBar from './nav-bar/index.vue'
import sideBar from './side-bar/index.vue'
</script>

<style lang="scss" scoped>
.layout-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg, var(--app-bg, #f4f1ea));
  color: var(--t1);
}

.layout-main {
  display: flex;
  flex: 1;
  min-height: 0;
}

.layout-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overflow-x: hidden;
}
</style>
