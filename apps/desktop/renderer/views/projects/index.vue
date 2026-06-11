<template>
  <section class="projects-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Projects</p>
        <h1>小说项目</h1>
        <span>每一部小说拥有独立的世界事实库、角色关系、章节和审稿状态。</span>
      </div>
      <el-button :icon="Plus" type="primary">新建小说项目</el-button>
    </header>

    <div class="project-grid">
      <button
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        type="button"
        @click="openProject(project.id)"
      >
        <div class="project-card-head">
          <h2>{{ project.title }}</h2>
          <el-tag effect="plain">{{ project.status }}</el-tag>
        </div>
        <p>{{ project.description }}</p>
        <dl>
          <div>
            <dt>章节</dt>
            <dd>{{ project.chapters }}</dd>
          </div>
          <div>
            <dt>世界事实</dt>
            <dd>{{ project.facts }}</dd>
          </div>
          <div>
            <dt>角色</dt>
            <dd>{{ project.characters }}</dd>
          </div>
        </dl>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const projects = [
  {
    id: 'demo-long-novel',
    title: '示例长篇项目',
    status: '规划中',
    description: '用于验证项目内工作区结构的占位项目。',
    chapters: 0,
    facts: 0,
    characters: 0,
  },
]

const openProject = (projectId: string) => {
  router.push(`/projects/${projectId}/overview`)
}
</script>

<style lang="scss" scoped>
.projects-page {
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

  h1,
  p,
  span {
    margin: 0;
  }

  h1 {
    color: var(--t1);
    font-size: 28px;
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

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.project-card {
  display: flex;
  flex-direction: column;
  min-height: 190px;
  padding: 18px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  color: inherit;
  background: var(--glass-panel);
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: color-mix(in srgb, #365f4c 45%, var(--bd-line));
    box-shadow: 0 14px 30px rgba(54, 95, 76, 0.14);
  }

  p {
    margin: 10px 0 18px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.project-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h2 {
    margin: 0;
    color: var(--t1);
    font-size: 16px;
    font-weight: 900;
  }
}

dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: auto 0 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--bd-line);

  div {
    padding: 10px;
    background: color-mix(in srgb, var(--glass-panel) 92%, #fff);
  }

  dt,
  dd {
    margin: 0;
  }

  dt {
    color: var(--t5);
    font-size: 10px;
    font-weight: 800;
  }

  dd {
    margin-top: 5px;
    color: var(--t2);
    font-size: 18px;
    font-weight: 900;
  }
}
</style>
