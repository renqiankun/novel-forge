<template>
  <section class="project-module">
    <header class="module-header">
      <p>Project Module</p>
      <h2>{{ title }}</h2>
      <span>{{ description }}</span>
    </header>

    <div class="module-panel">
      <div>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyDescription }}</p>
      </div>
      <el-tag effect="plain">项目级数据</el-tag>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => String(route.meta.title ?? '项目模块'))
const description = computed(() => String(route.meta.description ?? ''))
const emptyTitle = computed(() => `${title.value}待实现`)
const emptyDescription = computed(() => '后续会通过当前 projectId 读取和写入本项目独立的数据，不与其他小说混用。')
</script>

<style lang="scss" scoped>
.project-module {
  min-height: 100%;
}

.module-header {
  padding: 18px 20px;
  border: 1px solid var(--bd-line);
  border-radius: 8px 8px 0 0;
  background: var(--glass-panel);

  p,
  h2,
  span {
    margin: 0;
  }

  p {
    color: #a95d2d;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h2 {
    margin-top: 6px;
    color: var(--t1);
    font-size: 21px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 7px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.55;
  }
}

.module-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 220px;
  padding: 24px 20px;
  border: 1px solid var(--bd-line);
  border-top: 0;
  border-radius: 0 0 8px 8px;
  background: color-mix(in srgb, var(--glass-panel) 82%, transparent);

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: var(--t2);
    font-size: 16px;
    font-weight: 900;
  }

  p {
    margin-top: 8px;
    color: var(--t5);
    font-size: 13px;
    font-weight: 700;
  }
}
</style>
