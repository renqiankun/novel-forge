<template>
  <section class="module-page">
    <header class="module-head">
      <div>
        <p class="eyebrow">SYSTEM MODULE</p>
        <h1>{{ title }}</h1>
        <span>{{ description }}</span>
      </div>
      <el-button v-if="route.name === 'settings'" :icon="Refresh" @click="clearWorkspace">清空本地数据</el-button>
    </header>

    <template v-if="route.name === 'mcp'">
      <main class="mcp-grid">
        <section class="light-panel connection-panel">
          <div class="panel-head">
            <h2>MCP 状态</h2>
            <span class="plain-mark ok">Ready</span>
          </div>

          <div class="status-note">
            <span class="status-dot"></span>
            <div>
              <strong>当前已具备本地 MCP stdio server，可注册给 Codex 读取和回写。</strong>
              <p>Codex 通过这些工具读取项目、章节、长篇状态、风格和版本，并把候选正文、风格资产或长篇状态回写到本地 SQLite 与正文目录。</p>
            </div>
          </div>

          <el-form label-position="top" class="context-form">
            <el-form-item label="当前项目写作参考">
              <el-select v-model="selectedProjectId" placeholder="选择本地项目">
                <el-option
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.title"
                  :value="project.id"
                />
              </el-select>
            </el-form-item>
          </el-form>

          <div v-if="selectedProject" class="project-context">
            <strong>{{ selectedProject.title }}</strong>
            <p>{{ selectedProject.description }}</p>
            <span>{{ selectedProject.genre }} / 当前第 {{ selectedProject.currentChapter }} 章</span>
          </div>
        </section>

        <section class="light-panel tool-panel">
          <div class="panel-head">
            <h2>可用 MCP 工具</h2>
            <span class="count-text">{{ tools.length }} 个</span>
          </div>
          <div class="tool-list">
            <article v-for="tool in tools" :key="tool.name">
              <strong>{{ tool.name }}</strong>
              <p>{{ tool.description }}</p>
            </article>
          </div>
        </section>
      </main>
    </template>

    <template v-else>
      <main class="settings-grid">
        <section class="light-panel">
          <div class="panel-head">
            <h2>本地数据</h2>
            <span class="plain-mark">磁盘状态</span>
          </div>
          <div class="setting-body">
            <strong>Electron SQLite + 正文文件；浏览器预览使用示例数据</strong>
            <p>桌面应用会读写 SQLite 和用户配置的正文目录；浏览器预览仍使用 localStorage 示例数据。</p>
            <el-button :icon="Refresh" type="primary" @click="clearWorkspace">清空本地数据</el-button>
          </div>
        </section>

        <section class="light-panel storage-panel">
          <div class="panel-head">
            <h2>正文文件目录</h2>
            <span class="plain-mark" :class="{ ok: canUseContentStorage }">{{ contentStorageLabel }}</span>
          </div>
          <div class="setting-body">
            <strong>{{ contentStorageTitle }}</strong>
            <p>SQLite 只记录正文路径、hash、字数和版本索引；章节正文、候选版本正文会写入下面的目录。</p>
            <div class="path-box">{{ contentSettings?.rootDir ?? '读取中...' }}</div>
            <div class="storage-meta">
              <span>索引 {{ contentSettings?.contentBlobs ?? 0 }} 条</span>
              <span>{{ contentSettings?.isCustom ? '自定义目录' : '默认目录' }}</span>
              <span>{{ contentSettings?.exists ? '目录存在' : '目录未创建' }}</span>
            </div>
            <div class="mode-row">
              <el-button :icon="FolderOpened" type="primary" :disabled="!canUseContentStorage" @click="chooseContentDirectory">选择目录</el-button>
              <el-button :disabled="!canUseContentStorage || contentSyncing" @click="resetContentDirectory">恢复默认</el-button>
              <el-button :icon="Refresh" :loading="contentSyncing" :disabled="!canUseContentStorage" @click="syncContentDirectory()">立即同步</el-button>
            </div>
            <p v-if="contentSettings?.dbPath">SQLite：{{ contentSettings.dbPath }}</p>
            <p v-if="contentSettings?.source === 'browser_preview'">浏览器预览无法选择本机目录；进入 Electron 应用后会按这里的规则读取用户保存的目录。</p>
          </div>
        </section>

        <section class="light-panel">
          <div class="panel-head">
            <h2>保留能力</h2>
            <span class="plain-mark ok">Desktop Shell</span>
          </div>
          <div class="compact-list">
            <article>
              <strong>preload 任意文件代理</strong>
              <p>保留后续本地文件读写代理入口，本阶段不移除。</p>
            </article>
            <article>
              <strong>更新下载器</strong>
              <p>保留下载、检查与安装入口，不接入 UI 主流程。</p>
            </article>
            <article>
              <strong>IPC 模板</strong>
              <p>渲染层只调用统一小说接口，桌面应用由主进程连接 SQLite、正文文件和 MCP 工具。</p>
            </article>
          </div>
        </section>

        <section class="light-panel settings-wide">
          <div class="panel-head">
            <h2>检查策略</h2>
            <span class="plain-mark">{{ checkModeLabel }}</span>
          </div>
          <div class="setting-body">
            <strong>默认节省上下文：本地检查优先</strong>
            <p>{{ checkModeDescription }}</p>
            <div class="mode-row">
              <el-radio-group v-model="checkMode" class="check-mode-group">
                <el-radio-button label="token_saver">节省上下文</el-radio-button>
                <el-radio-button label="balanced">平衡</el-radio-button>
                <el-radio-button label="strict">严格</el-radio-button>
              </el-radio-group>
              <el-button type="primary" @click="saveCheckMode">保存策略</el-button>
            </div>
          </div>
        </section>
      </main>
    </template>
  </section>
</template>

<script setup lang="ts">
import { FolderOpened, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { novelApi, type McpToolDefinition, type NovelContentStorageSettings, type NovelProject } from '@/api'

const route = useRoute()
const projects = ref<NovelProject[]>([])
const tools = ref<McpToolDefinition[]>([])
const contentSettings = ref<NovelContentStorageSettings | null>(null)
const contentSyncing = ref(false)
const selectedProjectId = ref('')
const checkMode = ref<'token_saver' | 'balanced' | 'strict'>('token_saver')

const title = computed(() => String(route.meta.title ?? '系统模块'))
const description = computed(() => String(route.meta.description ?? ''))
const selectedProject = computed(() => projects.value.find((item) => item.id === selectedProjectId.value))
const canUseContentStorage = computed(() => contentSettings.value?.source === 'electron')
const contentStorageLabel = computed(() => (contentSettings.value?.source === 'electron' ? 'SQLite + 文件' : '浏览器预览'))
const contentStorageTitle = computed(() =>
  contentSettings.value?.source === 'electron' ? '正文文件将按用户保存的目录读取' : '浏览器预览暂用 localStorage',
)
const checkModeLabel = computed(
  () =>
    ({
      token_saver: '节省上下文',
      balanced: '平衡',
      strict: '严格',
    })[checkMode.value],
)
const checkModeDescription = computed(
  () =>
    ({
      token_saver: '正文保存、版本应用和回写前先运行本地规则检查；只有高风险变化才提示用户确认，不调用 AI。',
      balanced: '保持本地检查优先，但在重大改写、卷末节点和大纲迁移时提示是否进入 AI 复核流程。',
      strict: '适合发布前或大范围重写，更多变化会被标记为需要复查，方便外部 AI 读取后重新规划。',
    })[checkMode.value],
)

const loadData = async () => {
  const [nextProjects, nextTools, nextContentSettings] = await Promise.all([
    novelApi.listProjects(),
    novelApi.listMcpTools(),
    novelApi.getContentStorageSettings(),
  ])
  projects.value = nextProjects
  tools.value = nextTools
  contentSettings.value = nextContentSettings
  if (!selectedProjectId.value || !nextProjects.some((item) => item.id === selectedProjectId.value)) {
    selectedProjectId.value = nextProjects[0]?.id ?? ''
  }
}

const clearWorkspace = async () => {
  try {
    await ElMessageBox.confirm('会清空当前本地小说项目数据；浏览器预览会恢复示例数据。', '清空本地数据', {
      type: 'warning',
      confirmButtonText: '清空',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await novelApi.clearWorkspace()
  ElMessage.success('本地数据已清空')
  await loadData()
}

const saveCheckMode = () => {
  localStorage.setItem('novel-forge-check-mode', checkMode.value)
  ElMessage.success('检查策略已保存到本地偏好')
}

const syncContentDirectory = async (showMessage = true) => {
  if (!canUseContentStorage.value) return
  contentSyncing.value = true
  try {
    const result = await novelApi.syncContentStorage()
    contentSettings.value = await novelApi.getContentStorageSettings()
    if (showMessage) ElMessage.success(`已同步 ${result.written} 份正文文件`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '正文目录同步失败')
  } finally {
    contentSyncing.value = false
  }
}

const chooseContentDirectory = async () => {
  try {
    const previousRoot = contentSettings.value?.rootDir
    const nextSettings = await novelApi.chooseContentStorageDirectory()
    contentSettings.value = nextSettings
    if (previousRoot && previousRoot !== nextSettings.rootDir) {
      await syncContentDirectory(false)
      ElMessage.success('正文目录已更新，并已同步当前正文')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '选择正文目录失败')
  }
}

const resetContentDirectory = async () => {
  if (!canUseContentStorage.value) return
  try {
    contentSettings.value = await novelApi.resetContentStorageDirectory()
    await syncContentDirectory(false)
    ElMessage.success('正文目录已恢复默认，并已同步当前正文')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '恢复默认正文目录失败')
  }
}

watch(() => route.name, loadData)
onMounted(() => {
  const saved = localStorage.getItem('novel-forge-check-mode')
  if (saved === 'token_saver' || saved === 'balanced' || saved === 'strict') {
    checkMode.value = saved
  }
  loadData()
})
</script>

<style lang="scss" scoped>
.module-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 100%;
  padding: 18px 22px 28px;
}

.module-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 72px;
  padding: 12px 14px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--surface-raised);
  box-shadow: var(--sh-card);

  p,
  h1,
  span {
    margin: 0;
  }

  h1 {
    margin-top: 3px;
    color: var(--t1);
    font-size: 24px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 5px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
  }
}

.eyebrow {
  color: var(--brand-copper);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mcp-grid,
.settings-grid {
  min-height: 0;
  margin-top: 10px;
}

.mcp-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.82fr) minmax(0, 1.18fr);
  gap: 10px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.settings-wide {
  grid-column: 1 / -1;
}

.light-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--surface-raised);
  box-shadow: var(--sh-card);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--bd-line);
  background: var(--surface-field);

  h2 {
    margin: 0;
    color: var(--t1);
    font-size: 15px;
    font-weight: 900;
  }
}

.plain-mark,
.count-text {
  color: var(--brand-copper);
  font-size: 12px;
  font-weight: 900;
}

.plain-mark.ok {
  color: var(--brand-moss);
}

.connection-panel {
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
}

.status-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--bd-line);

  strong {
    color: var(--t2);
    font-size: 14px;
    font-weight: 900;
  }

  p {
    margin: 6px 0 0;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.status-dot {
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  margin-top: 5px;
  border-radius: 999px;
  background: var(--brand-moss);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-moss) 18%, transparent);
}

.context-form {
  padding: 12px 14px 0;
}

.project-context,
.setting-body {
  padding: 12px 14px;

  strong {
    color: var(--t1);
    font-size: 14px;
    font-weight: 900;
  }

  p,
  span {
    display: block;
    margin: 6px 0 0;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.storage-panel {
  min-height: 236px;
}

.path-box {
  margin-top: 10px;
  padding: 9px 10px;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 6px;
  background: var(--surface-field);
  color: var(--t2);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.storage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;

  span {
    padding: 4px 8px;
    border: 1px solid var(--bd-line);
    border-radius: 999px;
    color: var(--t4);
    font-size: 11px;
    font-weight: 900;
  }
}

.tool-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.tool-list,
.compact-list {
  min-height: 0;
  overflow: auto;
}

.tool-list article,
.compact-list article {
  padding: 10px 14px;
  border-bottom: 1px solid var(--bd-line);

  &:last-child {
    border-bottom: 0;
  }

  strong {
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  p {
    margin: 6px 0 0;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.mode-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.check-mode-group {
  display: flex;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .module-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .mcp-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
