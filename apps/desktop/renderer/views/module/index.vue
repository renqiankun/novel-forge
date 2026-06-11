<template>
  <section class="module-page">
    <header class="module-header">
      <p>System Module</p>
      <h1>{{ title }}</h1>
      <span>{{ description }}</span>
    </header>

    <div class="empty-state">
      <el-icon :size="34">
        <DocumentAdd />
      </el-icon>
      <h2>系统级模块待实现</h2>
      <p>这里只放跨项目能力；项目内业务请进入某一部小说后处理。</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DocumentAdd } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => String(route.meta.title ?? '系统模块'))
const description = computed(() => String(route.meta.description ?? ''))
</script>

<style lang="scss" scoped>
.module-page {
  min-height: 100%;
  padding: 26px 28px;
}

.module-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--bd-line);

  p,
  h1,
  span {
    margin: 0;
  }

  p {
    color: #a95d2d;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin-top: 6px;
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

.empty-state {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: var(--t5);

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: var(--t2);
    font-size: 16px;
    font-weight: 900;
  }

  p {
    font-size: 13px;
    font-weight: 700;
  }
}
</style>
