<template>
  <section v-loading="loading" class="canvas-workspace">
    <div class="canvas-title-chip">
      <div>
        <span class="eyebrow">AI 控制画布</span>
        <strong>卷 / 章节 / 版本 / 任务</strong>
      </div>
      <div class="toolbar-metrics">
        <span>{{ canvas?.stats.volumes ?? 0 }} 卷</span>
        <span>{{ canvas?.stats.chapters ?? 0 }} 章</span>
        <span>{{ canvas?.stats.versions ?? 0 }} 版本</span>
        <span>{{ canvas?.stats.pendingReviews ?? 0 }} 待沉淀</span>
      </div>
    </div>

    <div class="canvas-quick-actions">
      <el-tooltip content="刷新状态" placement="bottom">
        <el-button :icon="Refresh" circle @click="loadCanvas" />
      </el-tooltip>
      <el-button type="primary" :icon="Plus" @click="openPanel('task-new')">AI 任务包</el-button>
    </div>

    <nav class="canvas-panel-dock" aria-label="画布悬浮面板">
      <el-tooltip v-for="item in workbenchPanels" :key="item.key" :content="item.label" placement="right" effect="light">
        <button
          type="button"
          :aria-label="item.label"
          :title="item.label"
          :class="{ active: activeWorkbenchPanel === item.key }"
          @click="toggleWorkbenchPanel(item.key)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </el-tooltip>
    </nav>

    <WorkbenchPanel
      v-model="activeWorkbenchPanel"
      :canvas="canvas"
      :dashboard="dashboard"
      :ai-workbench="aiWorkbench"
      :project-progress="projectProgress"
      :pressure-alert-text="pressureAlertText"
      :ordered-tasks="orderedTasks"
      :module-tabs="moduleTabs"
      :queue-item-for-task="queueItemForTask"
      @open-panel="openPanel"
      @move-task="moveTask"
      @remove-task="removeTask"
      @resolve-review="resolveReview"
    />

    <CanvasFlow
      ref="canvasFlowRef"
      :canvas="canvas"
      :detail="detail"
      :selected-node-id="selectedNodeId"
      :selected-version-id="selectedVersionId"
      @open-node="openNode"
      @open-reader-from-node="openReaderFromNode"
      @open-version="openVersionFromNode"
      @open-version-body="openVersionBodyFromNode"
    />

    <NodeDetailDrawer
      v-model="drawerVisible"
      :detail="detail"
      :active-style-title="activeStyleTitle"
      :pressure-summary="pressureSummary"
      :latest-local-check-level="latestLocalCheck?.level ?? '-'"
      :detail-has-body="detailHasBody"
      @copy-codex-prompt="copyCodexPrompt"
      @open-task-package="openTaskPackageFromDetail"
      @open-panel="openPanel"
      @open-reader="openReaderDialog"
      @open-rewrite="openRewriteDialog"
      @open-version="openVersionDialog"
      @run-local-check="runLocalCheck"
    />

    <el-dialog v-model="panelDialogVisible" :title="panelTitle" width="min(1060px, 94vw)" align-center class="nf-dialog canvas-dialog" @closed="closePanel">
      <div class="panel-dialog-body">
        <template v-if="activePanel === 'mcp-status'">
          <div class="dialog-grid mcp-dialog-grid">
            <section class="light-card">
              <h3>外部 AI 任务</h3>
              <article v-for="task in aiWorkbench?.tasks ?? []" :key="task.id" class="list-row">
                <div>
                  <strong>{{ task.title }}</strong>
                  <p>{{ aiTaskTargetLabel(task.target) }} / {{ aiTaskStatusLabel(task.status) }}</p>
                </div>
                <div class="row-actions">
                  <el-button size="small" @click="openTaskPackage(task.id)">任务包</el-button>
                  <el-button v-if="task.status !== 'completed'" size="small" text type="danger" @click="removeTask(task.id)">移除</el-button>
                  <el-button v-if="task.status !== 'completed'" size="small" type="primary" @click="completeAiTask(task.id)">记录外部回写完成</el-button>
                </div>
              </article>
            </section>
            <section class="light-card">
              <h3>MCP 可读资源</h3>
              <article v-for="resource in aiWorkbench?.resourcePreviews ?? []" :key="resource.id" class="list-row compact">
                <div>
                  <strong>{{ resource.title }}</strong>
                  <code>{{ resource.uri }}</code>
                </div>
                <span class="text-mark">{{ resource.items }} 项</span>
              </article>
            </section>
            <section class="light-card wide">
              <h3>最近回填</h3>
              <article v-for="log in aiWorkbench?.writeLogs ?? []" :key="log.id" class="list-row compact">
                <div>
                  <strong>{{ log.title }}</strong>
                  <p>{{ writeKindLabel(log.kind) }} / {{ log.actor }} / {{ log.summary }}</p>
                </div>
              </article>
            </section>
          </div>
        </template>

        <template v-else-if="activePanel === 'task-new'">
          <el-form label-position="top" class="form-grid">
            <el-form-item label="任务类型">
              <el-select v-model="taskForm.target">
                <el-option v-for="item in taskTargets" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="目标章节">
              <el-select v-model="taskForm.chapterId" clearable>
                <el-option v-for="chapter in chapters" :key="chapter.id" :label="`第 ${chapter.index} 章：${chapter.title}`" :value="chapter.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="写作参考范围">
              <el-select v-model="taskForm.contextMode">
                <el-option label="精简" value="lite" />
                <el-option label="完整" value="full" />
                <el-option label="深度" value="deep" />
              </el-select>
            </el-form-item>
            <el-form-item label="检查策略">
              <el-select v-model="taskForm.reviewMode">
                <el-option label="节省上下文" value="token_saver" />
                <el-option label="平衡" value="balanced" />
                <el-option label="严格" value="strict" />
              </el-select>
            </el-form-item>
            <el-form-item class="wide" label="任务标题">
              <el-input v-model="taskForm.title" />
            </el-form-item>
            <el-form-item class="wide" label="给外部 AI 的说明">
              <el-input v-model="taskForm.instruction" type="textarea" :rows="5" />
            </el-form-item>
          </el-form>
          <p class="dialog-note">这里仅记录任务包和回填入口，真实的“下一章 / 下 10 章 / 下 100 章”发起仍在外部 AI 控制端完成。</p>
        </template>

        <template v-else-if="activePanel === 'task-package'">
          <div v-if="taskPackage" class="task-package">
            <section class="light-card">
              <h3>{{ taskPackage.task.title }}</h3>
              <p>{{ taskPackage.task.instruction }}</p>
              <code>{{ taskPackage.taskUri }}</code>
            </section>
            <section class="light-card">
              <h3>预计读取资源</h3>
              <article v-for="resource in taskPackage.expectedReadResources" :key="resource.id" class="list-row compact">
                <div>
                  <strong>{{ resource.title }}</strong>
                  <code>{{ resource.uri }}</code>
                </div>
              </article>
            </section>
            <section class="light-card">
              <h3>预计回填</h3>
              <article v-for="target in taskPackage.expectedWriteBack" :key="target.kind" class="list-row compact">
                <div>
                  <strong>{{ target.title }}</strong>
                  <p>{{ target.description }}</p>
                </div>
                <span class="text-mark">{{ target.required ? '必需' : '可选' }}</span>
              </article>
            </section>
            <pre class="json-preview">{{ taskPackageText }}</pre>
          </div>
          <el-empty v-else description="请从 MCP 状态里选择一个任务包，或先记录 AI 任务包。" />
        </template>

        <template v-else-if="activePanel === 'context-pack'">
          <div v-if="contextPack" class="context-layout">
            <section class="light-card">
              <h3>当前章写作参考</h3>
              <p>{{ contextPack.chapter.intention }}</p>
              <p>预算约 {{ contextPack.budget.estimatedTokens }} / {{ contextPack.budget.hardLimit }} tokens，本地预览不消耗 AI Token。</p>
            </section>
            <section class="light-card">
              <h3>关键约束</h3>
              <p>事实：{{ contextPack.worldFacts.map((item) => item.title).join(' / ') || '暂无' }}</p>
              <p>角色：{{ contextPack.characters.map((item) => item.name).join(' / ') || '暂无' }}</p>
              <p>风格：{{ contextPack.activeStyle?.title || '未绑定' }}</p>
            </section>
            <pre class="json-preview">{{ contextPackText }}</pre>
          </div>
          <el-empty v-else description="请选择一个章节节点后查看当前写作参考。" />
        </template>

        <template v-else-if="activePanel === 'outline'">
          <div class="dialog-grid outline-dialog-grid">
            <section class="light-card wide outline-guide">
              <h3>大纲预览如何使用</h3>
              <p>这里不是普通目录，而是给人和外部 AI 同时看的章节功能契约：每个节点说明目标、冲突、回报窗口和状态。下一章、下 10 章、下 100 章任务会优先读取这些内容，避免批量规划偏离全书承诺。</p>
              <div class="outline-summary-strip">
                <span>全书 {{ outline?.nodes.filter((node) => node.kind === 'book').length ?? 0 }}</span>
                <span>卷 {{ outline?.nodes.filter((node) => node.kind === 'volume').length ?? 0 }}</span>
                <span>故事弧 {{ outline?.nodes.filter((node) => node.kind === 'arc').length ?? 0 }}</span>
                <span>章节 {{ outline?.nodes.filter((node) => node.kind === 'chapter').length ?? 0 }}</span>
              </div>
            </section>
            <section class="light-card wide">
              <h3>完整大纲节点</h3>
              <article v-for="node in outline?.nodes ?? []" :key="node.id" class="list-row outline-row">
                <div>
                  <strong>{{ outlineKindLabel(node.kind) }} / {{ node.title }}</strong>
                  <p>目标：{{ node.goal }}</p>
                  <small>冲突：{{ node.conflict }} / 回报：{{ node.payoff }}</small>
                </div>
                <span class="text-mark">{{ outlineStatusLabel(node.status) }}</span>
              </article>
              <el-empty v-if="!(outline?.nodes ?? []).length" description="暂无大纲节点。这里会展示全书、卷、故事弧和章节功能契约。" />
            </section>
          </div>
        </template>

        <template v-else-if="activePanel === 'long-state'">
          <div class="dialog-grid state-grid">
            <section class="light-card">
              <h3>压力值与破声点</h3>
              <article v-for="pressure in longState?.pressures ?? []" :key="pressure.id" class="pressure-row">
                <div>
                  <strong>{{ characterName(pressure.characterId) }} / {{ pressure.emotion }}</strong>
                  <p>{{ pressure.source }}</p>
                  <small>{{ pressure.breakpoint || '未触发破声点' }} / {{ pressure.aftermath }}</small>
                </div>
                <b>{{ pressure.value }}/{{ pressure.threshold }}</b>
              </article>
            </section>
            <section class="light-card">
              <h3>剧情债务</h3>
              <article v-for="debt in longState?.debts ?? []" :key="debt.id" class="list-row compact">
                <div>
                  <strong>{{ debt.title }}</strong>
                  <p>{{ debt.body }}</p>
                </div>
                <span class="text-mark">{{ debt.severity }}</span>
              </article>
            </section>
            <section class="light-card wide">
              <h3>时间 / 消息 / 伏笔</h3>
              <article v-for="event in longState?.timeline ?? []" :key="event.id" class="list-row compact">
                <div><strong>{{ event.title }}</strong><p>{{ event.time }} / {{ event.place }} / {{ event.body }}</p></div>
              </article>
              <article v-for="item in longState?.foreshadows ?? []" :key="item.id" class="list-row compact">
                <div><strong>{{ item.title }}</strong><p>{{ item.status }} / {{ item.nextWindow }} / {{ item.body }}</p></div>
              </article>
            </section>
          </div>
        </template>

        <template v-else-if="activePanel === 'style-dialogue'">
          <div class="dialog-grid">
            <section class="light-card style-overview-card">
              <h3>当前风格方案</h3>
              <p class="card-note">作为 AI 写作参考的总语气锚点，决定外部 AI 写作时优先遵循的全书风格方向。</p>
              <div v-if="activeStyleProfile" class="active-profile-strip">
                <div>
                  <strong>{{ activeStyleProfile.title }}</strong>
                  <span>{{ activeStyleProfile.description }}</span>
                </div>
                <b>已启用</b>
              </div>
              <p v-if="activeStyleProfile" class="style-tone-preview">{{ activeStyleProfile.tone }}</p>
              <div class="profile-action-row compact-actions">
                <el-button type="primary" @click="openStyleProfileEditor('edit', activeStyleProfile)">编辑当前方案</el-button>
                <el-button @click="openStyleProfileEditor('create')">新建方案</el-button>
                <el-button @click="openStyleProfileEditor('copy', activeStyleProfile)">复制当前方案</el-button>
              </div>
            </section>
            <section class="light-card">
              <h3>风格方案列表</h3>
              <p class="card-note">方案是整书级写作语气，只有启用中的方案会作为默认 AI 写作参考风格锚点。</p>
              <div class="style-profile-list">
                <article v-for="profile in styleLibrary?.profiles ?? []" :key="profile.id" :class="{ active: profile.id === styleLibrary?.activeProfileId }">
                  <div>
                    <strong>{{ profile.title }}</strong>
                    <p>{{ profile.tone }}</p>
                    <small>{{ profile.source === 'preset' ? '预设方案' : '自定义方案' }} / {{ profile.id === styleLibrary?.activeProfileId ? '当前启用' : '未启用' }}</small>
                  </div>
                  <div class="row-actions">
                    <el-button size="small" @click="openStyleProfileEditor('edit', profile)">编辑</el-button>
                    <el-button v-if="profile.id !== styleLibrary?.activeProfileId" size="small" type="primary" plain @click="bindStyle(profile.id)">启用</el-button>
                    <el-button size="small" @click="openStyleProfileEditor('copy', profile)">复制</el-button>
                    <el-button v-if="profile.id !== styleLibrary?.activeProfileId" size="small" text type="danger" @click="removeStyleProfile(profile.id)">删除</el-button>
                  </div>
                </article>
                <el-empty v-if="!styleLibrary?.profiles.length" description="暂无风格方案，可新建后启用。" />
              </div>
            </section>
            <section class="light-card wide">
              <h3>已用于 AI 写作参考</h3>
              <article v-for="asset in appliedStyleAssets" :key="asset.id" class="list-row compact">
                <div>
                  <strong>{{ styleAssetKindLabel(asset.kind) }} / {{ asset.title }}</strong>
                  <p>{{ asset.body }}</p>
                  <small>{{ styleAssetOriginLabel(asset) }} / 会用于 AI 写作参考</small>
                </div>
                <div class="row-actions">
                  <span class="text-mark">已用于参考</span>
                  <el-button size="small" @click="openStyleAssetEditor('edit', asset)">编辑</el-button>
                  <el-button size="small" @click="setStyleAssetApplied(asset.id, false)">改为备用</el-button>
                  <el-button size="small" text type="danger" @click="removeStyleAsset(asset.id)">去除</el-button>
                </div>
              </article>
              <el-empty v-if="!appliedStyleAssets.length" description="暂无用于 AI 写作参考的风格资产。" />
            </section>
            <section class="light-card wide">
              <div class="card-heading-row">
                <h3>项目资产池</h3>
                <el-button size="small" type="primary" plain @click="openStyleAssetEditor('create')">新增资产</el-button>
              </div>
              <article v-for="asset in pooledStyleAssets" :key="asset.id" class="list-row compact">
                <div>
                  <strong>{{ styleAssetKindLabel(asset.kind) }} / {{ asset.title }}</strong>
                  <p>{{ asset.body }}</p>
                  <small>{{ styleAssetOriginLabel(asset) }} / 项目内备用，暂不用于 AI 写作参考</small>
                </div>
                <div class="row-actions">
                  <span class="text-mark">仅备用</span>
                  <el-button size="small" @click="openStyleAssetEditor('edit', asset)">编辑</el-button>
                  <el-button size="small" type="primary" plain @click="setStyleAssetApplied(asset.id, true)">用于参考</el-button>
                  <el-button size="small" text type="danger" @click="removeStyleAsset(asset.id)">去除</el-button>
                </div>
              </article>
              <el-empty v-if="!pooledStyleAssets.length" description="暂无备用资产，可新增或从全局模板加入。" />
            </section>
            <section class="light-card wide">
              <h3>全局可引入模板</h3>
              <article v-for="template in styleTemplates" :key="template.id" class="list-row compact">
                <div>
                  <strong>{{ styleAssetKindLabel(template.kind) }} / {{ template.title }}</strong>
                  <p>{{ template.body }}</p>
                  <small>{{ template.scope }} / {{ template.tags.join('、') || '未标记' }}</small>
                </div>
                <div class="row-actions">
                  <span class="text-mark">{{ importedAssetForTemplate(template)?.enabled ? '已用于参考' : importedAssetForTemplate(template) ? '在项目池' : '全局模板' }}</span>
                  <el-button
                    v-if="!importedAssetForTemplate(template)"
                    size="small"
                    type="primary"
                    plain
                    @click="importStyleTemplate(template.id, true)"
                  >
                    加入并用于参考
                  </el-button>
                  <el-button
                    v-else-if="!importedAssetForTemplate(template)?.enabled"
                    size="small"
                    type="primary"
                    plain
                    @click="setStyleAssetApplied(importedAssetForTemplate(template)!.id, true)"
                  >
                    用于参考
                  </el-button>
                  <el-button v-else size="small" @click="setStyleAssetApplied(importedAssetForTemplate(template)!.id, false)">改为备用</el-button>
                  <el-button v-if="importedAssetForTemplate(template)" size="small" text type="danger" @click="removeStyleAsset(importedAssetForTemplate(template)!.id)">去除项目副本</el-button>
                </div>
              </article>
              <el-empty v-if="!styleTemplates.length" description="全局风格资产库暂无模板。" />
            </section>
          </div>
        </template>

        <template v-else-if="activePanel === 'characters'">
          <CharacterRelationPanel
            :graph="characterGraph"
            @save-relation="saveCharacterRelation"
            @delete-relation="deleteCharacterRelation"
          />
        </template>

        <template v-else-if="activePanel === 'audit'">
          <div class="dialog-grid audit-grid">
            <section class="light-card">
              <h3>待沉淀候选事实</h3>
              <article v-for="item in dashboard?.pendingFacts ?? []" :key="item.id" class="list-row compact">
                <div><strong>{{ item.title }}</strong><p>{{ riskLabel(item.risk) }} / {{ item.body }}</p></div>
                <el-button size="small" @click="resolveReview(item.id, 'accept')">沉淀</el-button>
              </article>
              <el-button type="primary" plain @click="settleLowRiskFacts">自动沉淀低中风险</el-button>
            </section>
            <section class="light-card">
              <h3>本地检查记录</h3>
              <article v-for="check in localChecks" :key="check.id" class="list-row compact">
                <div><strong>{{ check.level }} / {{ check.issues.length }} 项提示</strong><p>{{ check.createdAt.slice(0, 16).replace('T', ' ') }}</p></div>
                <span class="text-mark">本地</span>
              </article>
            </section>
            <section class="light-card wide">
              <h3>审稿报告</h3>
              <article v-for="report in dashboard?.auditReports ?? []" :key="report.id" class="list-row">
                <div><strong>{{ report.title }}</strong><p>{{ report.items.join(' / ') }}</p></div>
                <el-button size="small" @click="resolveAudit(report.id)">标记解决</el-button>
              </article>
            </section>
          </div>
        </template>

        <template v-else-if="activePanel === 'snapshots'">
          <div class="snapshot-layout">
            <section class="light-card">
              <h3>快照</h3>
              <el-button type="primary" :icon="Plus" @click="createSnapshot">创建快照</el-button>
              <article v-for="snapshot in snapshots" :key="snapshot.id" class="list-row compact">
                <div><strong>{{ snapshot.title }}</strong><p>{{ snapshot.reason }}</p></div>
                <el-button size="small" @click="restoreSnapshot(snapshot.id)">恢复</el-button>
              </article>
            </section>
            <section class="light-card">
              <h3>导入 / 导出项目状态</h3>
              <el-button @click="exportState">生成导出 JSON</el-button>
              <el-input v-model="importStateText" type="textarea" :rows="8" placeholder="粘贴项目状态 JSON" />
              <el-button type="primary" @click="importState">导入状态</el-button>
            </section>
            <pre class="json-preview">{{ projectStateText }}</pre>
          </div>
        </template>

        <template v-else-if="activePanel === 'export'">
          <pre class="json-preview text-export">{{ projectText }}</pre>
        </template>
      </div>

      <template #footer>
        <el-button v-if="activePanel === 'task-new'" type="primary" @click="createTask">创建任务包</el-button>
        <el-button v-if="activePanel === 'task-package' && taskPackageText" @click="copyText(taskPackageText, '任务包详情')">复制任务包详情</el-button>
        <el-button
          v-if="activePanel === 'task-package' && taskPackage && taskPackage.task.status !== 'completed'"
          type="primary"
          @click="completeAiTask(taskPackage.task.id)"
        >
          记录外部回写完成
        </el-button>
        <el-button v-if="activePanel === 'context-pack' && contextPackText" @click="copyText(contextPackText, '当前写作参考详情')">复制写作参考详情</el-button>
        <el-button @click="panelDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="styleProfileDialogVisible"
      :title="styleProfileDialogTitle"
      width="min(680px, 92vw)"
      append-to-body
      align-center
      class="nf-dialog style-editor-dialog"
    >
      <el-form label-position="top" class="style-editor-form">
        <el-form-item label="方案标题">
          <el-input v-model="styleProfileForm.title" placeholder="例如：冷峭玄幻全书风格" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="styleProfileForm.description" placeholder="这个方案适合什么阶段、章节或叙事目标" />
        </el-form-item>
        <el-form-item class="wide" label="语气锚点">
          <el-input v-model="styleProfileForm.tone" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="styleProfileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStyleProfileForm()">保存</el-button>
        <el-button v-if="!styleProfileForm.active" type="primary" plain @click="saveStyleProfileForm(true)">保存并启用</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="styleAssetDialogVisible"
      :title="styleAssetDialogTitle"
      width="min(720px, 92vw)"
      append-to-body
      align-center
      class="nf-dialog style-editor-dialog"
    >
      <el-form label-position="top" class="style-editor-form">
        <el-form-item label="类型">
          <el-select v-model="styleAssetForm.kind">
            <el-option label="项目风格" value="project_style" />
            <el-option label="卷风格" value="volume_style" />
            <el-option label="角色语气" value="character_voice" />
            <el-option label="好段落样本" value="good_sample" />
            <el-option label="坏模式" value="bad_pattern" />
            <el-option label="禁止项" value="forbidden" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用范围">
          <el-select
            v-model="styleAssetForm.scope"
            filterable
            allow-create
            default-first-option
            placeholder="选择范围，或输入如：第一卷"
          >
            <el-option v-for="option in styleAssetScopeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="styleAssetForm.title" placeholder="给外部 AI 可读的资产标题" />
        </el-form-item>
        <el-form-item label="使用状态">
          <el-switch v-model="styleAssetForm.enabled" active-text="用于 AI 写作参考" inactive-text="仅保存备用" />
        </el-form-item>
        <el-form-item class="wide" label="内容">
          <el-input v-model="styleAssetForm.body" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="styleAssetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStyleAsset">保存资产</el-button>
      </template>
    </el-dialog>

    <VersionDialog
      v-model="versionDialogVisible"
      v-model:selected-version-id="selectedVersionId"
      :detail="detail"
      :selected-version="selectedVersion"
      :selected-version-index="selectedVersionIndex"
      @apply="applyVersion"
    />

    <ReaderDialog
      v-model="readerDialogVisible"
      v-model:minor-edit-text="minorEditText"
      :detail="detail"
      :minor-edit-word-count="minorEditWordCount"
      @run-local-check="runLocalCheckFromMinorEdit"
      @save-minor-edit="saveMinorEditVersion"
    />

    <RewriteDialog v-model="rewriteDialogVisible" :rewrite-form="rewriteForm" @submit="submitRewrite" />

    <CheckResultDialog v-model="checkDialogVisible" :latest-check-result="latestCheckResult" />
  </section>
</template>

<script setup lang="ts">
import {
  Collection,
  CopyDocument,
  DocumentChecked,
  Finished,
  Plus,
  Refresh,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  novelApi,
  type AiReviewDecision,
  type AiTask,
  type AiTaskPackage,
  type AiTaskTarget,
  type AiWorkbench,
  type Chapter,
  type ChapterContextPack,
  type CharacterRelation,
  type CharacterRelationGraph,
  type LocalCheckResult,
  type LongState,
  type McpContextMode,
  type ProjectCanvas,
  type ProjectDashboard,
  type ProjectOutline,
  type RewriteLevel,
  type RewriteMode,
  type RewriteScope,
  type SnapshotRecord,
  type StyleAsset,
  type StyleAssetKind,
  type StyleAssetTemplate,
  type StyleLibrary,
  type StyleProfile,
} from '@/api'
import CanvasFlow from './components/CanvasFlow.vue'
import CharacterRelationPanel from './components/CharacterRelationPanel.vue'
import CheckResultDialog from './components/CheckResultDialog.vue'
import NodeDetailDrawer from './components/NodeDetailDrawer.vue'
import ReaderDialog from './components/ReaderDialog.vue'
import RewriteDialog from './components/RewriteDialog.vue'
import VersionDialog from './components/VersionDialog.vue'
import WorkbenchPanel from './components/WorkbenchPanel.vue'
import {
  aiTaskStatusLabel,
  aiTaskTargetLabel,
  outlineKindLabel,
  outlineStatusLabel,
  riskLabel,
  styleAssetKindLabel,
  taskTargets,
  versionStatusLabel,
  writeKindLabel,
} from './labels'
import type { PanelKey, WorkbenchPanelKey } from './types'

const route = useRoute()
const router = useRouter()
const canvasFlowRef = ref<{ fitCanvas: () => void } | null>(null)

const loading = ref(false)
const canvas = ref<ProjectCanvas | null>(null)
const detail = ref<import('@/api').CanvasNodeDetail | null>(null)
const drawerVisible = ref(false)
const selectedNodeId = ref('')
const selectedVersionId = ref('')

const panelDialogVisible = ref(false)
const activePanel = ref<PanelKey | ''>('')
const activeWorkbenchPanel = ref<WorkbenchPanelKey | ''>('')
const versionDialogVisible = ref(false)
const rewriteDialogVisible = ref(false)
const checkDialogVisible = ref(false)
const readerDialogVisible = ref(false)
const styleProfileDialogVisible = ref(false)
const styleAssetDialogVisible = ref(false)
const styleProfileDialogMode = ref<'create' | 'edit' | 'copy'>('edit')
const styleAssetDialogMode = ref<'create' | 'edit'>('create')

const aiWorkbench = ref<AiWorkbench | null>(null)
const dashboard = ref<ProjectDashboard | null>(null)
const outline = ref<ProjectOutline | null>(null)
const longState = ref<LongState | null>(null)
const styleLibrary = ref<StyleLibrary | null>(null)
const styleTemplates = ref<StyleAssetTemplate[]>([])
const characterGraph = ref<CharacterRelationGraph | null>(null)
const chapters = ref<Chapter[]>([])
const snapshots = ref<SnapshotRecord[]>([])
const contextPack = ref<ChapterContextPack | null>(null)
const taskPackage = ref<AiTaskPackage | null>(null)
const localChecks = ref<LocalCheckResult[]>([])
const latestCheckResult = ref<LocalCheckResult | null>(null)
const projectStateText = ref('')
const importStateText = ref('')
const projectText = ref('')
const minorEditText = ref('')
const taskQueueOrder = ref<string[]>([])

const projectId = computed(() => String(route.params.projectId ?? ''))
const projectProgress = computed(() => {
  const project = canvas.value?.project
  if (!project) return 0
  return Math.min(100, Math.round((project.currentChapter / Math.max(project.targetChapters, 1)) * 100))
})
const latestLocalCheck = computed(() => detail.value?.localChecks[0])
const selectedVersion = computed(() => detail.value?.versions.find((item) => item.id === selectedVersionId.value))
const selectedVersionIndex = computed(() => {
  const index = detail.value?.versions.findIndex((item) => item.id === selectedVersionId.value) ?? -1
  return index >= 0 ? index + 1 : '-'
})
const detailHasBody = computed(() => {
  const chapter = detail.value?.chapter
  if (!chapter) return false
  return Boolean(chapter.draft.trim() || chapter.wordCount > 0 || detail.value?.versions.some((version) => version.body.trim()))
})
const activeStyleTitle = computed(() => {
  const library = detail.value?.styleLibrary
  return library?.profiles.find((item) => item.id === library.activeProfileId)?.title || '未绑定项目风格'
})
const pressureSummary = computed(() => {
  const pressures = detail.value?.longState.pressures ?? []
  const alerts = pressures.filter((item) => item.value >= item.threshold || item.status === 'breakpoint')
  return alerts.length ? alerts.map((item) => `${characterName(item.characterId)} ${item.value}`).join(' / ') : '暂无高压破声点'
})
const pressureAlertText = computed(() => {
  const count = dashboard.value?.stats.pressureAlerts ?? 0
  return count ? `${count} 个待处理` : '稳定'
})
const activeStyleProfile = computed(() => styleLibrary.value?.profiles.find((profile) => profile.id === styleLibrary.value?.activeProfileId))
const selectedStyleProfile = computed(() =>
  styleLibrary.value?.profiles.find((profile) => profile.id === styleProfileForm.id) ?? activeStyleProfile.value,
)
const contextPackText = computed(() => (contextPack.value ? JSON.stringify(contextPack.value, null, 2) : ''))
const taskPackageText = computed(() => (taskPackage.value ? JSON.stringify(taskPackage.value, null, 2) : ''))
const styleProfileDialogTitle = computed(() => {
  if (styleProfileDialogMode.value === 'create') return '新建风格方案'
  if (styleProfileDialogMode.value === 'copy') return '复制风格方案'
  return '编辑风格方案'
})
const styleAssetDialogTitle = computed(() => (styleAssetDialogMode.value === 'create' ? '新增风格资产' : '编辑风格资产'))
const minorEditWordCount = computed(() => minorEditText.value.replace(/\s+/g, '').length)
const taskQueueItems = computed(() => aiWorkbench.value?.taskQueue.items ?? [])
const appliedStyleAssets = computed(() => styleLibrary.value?.assets.filter((asset) => asset.enabled) ?? [])
const pooledStyleAssets = computed(() => styleLibrary.value?.assets.filter((asset) => !asset.enabled) ?? [])
const styleAssetScopeOptions = [
  { label: '全书通用', value: '全书' },
  { label: '当前卷', value: '当前卷' },
  { label: '当前章节', value: '当前章节' },
  { label: '角色语气', value: '角色语气' },
  { label: '场景片段', value: '场景片段' },
  { label: '避雷限制', value: '避雷限制' },
]
const taskTargetPresets: Record<AiTaskTarget, { title: string; instruction: string; contextMode: McpContextMode }> = {
  next_chapter: {
    title: 'AI 下一章生成任务',
    instruction: '请通过 MCP 读取项目画布、当前章写作参考、长篇状态、风格资产和最近版本，生成候选版本后回填到 App，不要直接覆盖定版正文。',
    contextMode: 'full',
  },
  next_10_chapters: {
    title: 'AI 下 10 章规划任务',
    instruction: '请读取完整大纲、当前剧情摘要、压力值、破声点、剧情债务和角色关系，规划下 10 章路线图；按检查点回填章节目标、风险和需要人工确认的高影响变化。',
    contextMode: 'full',
  },
  next_50_chapters: {
    title: 'AI 下 50 章中期规划任务',
    instruction: '请以当前卷目标、长篇状态和角色未来走向为主，规划下 50 章的阶段节奏、回报窗口、伏笔推进和压力曲线；不要生成正文，只回填路线图和检查点。',
    contextMode: 'deep',
  },
  next_100_chapters: {
    title: 'AI 下 100 章长线结构任务',
    instruction: '请以全书承诺、卷结构、角色长期变化和剧情债务为主，规划下 100 章结构；需要标出阶段目标、风险峰值、破声点窗口、回报窗口和人工确认节点。',
    contextMode: 'deep',
  },
  rewrite_chapter: {
    title: 'AI 章节重写任务',
    instruction: '请读取目标章节正文、当前写作参考、重写条件、风格资产和本地检查结果，只回填候选重写版本；不要直接覆盖当前定版正文。',
    contextMode: 'full',
  },
  style_extract: {
    title: 'AI 风格提取任务',
    instruction: '请读取目标章节或全书样本，提取可复用的语气规则、好段落样本、对白节奏和避雷模式，回填为项目风格资产。',
    contextMode: 'full',
  },
  style_process: {
    title: 'AI 风格处理任务',
    instruction: '请整理现有风格资产，合并重复项，补充坏模式和禁止项，保留可直接用于写作参考的简洁规则。',
    contextMode: 'full',
  },
  style_adjustment: {
    title: 'AI 风格调整任务',
    instruction: '请根据当前项目风格方案和最近候选版本，提出风格调整并回填项目风格资产；不要改写正文。',
    contextMode: 'full',
  },
}
const queueItemById = computed(() => new Map(taskQueueItems.value.map((item) => [item.task.id, item])))
const queueItemForTask = (taskId: string) => queueItemById.value.get(taskId)
const importedAssetForTemplate = (template: StyleAssetTemplate) =>
  styleLibrary.value?.assets.find(
    (asset) =>
      asset.templateId === template.id ||
      (asset.kind === template.kind && asset.title === template.title && asset.body === template.body),
  )
const styleAssetOriginLabel = (asset: StyleAsset) => {
  if (asset.templateId || styleTemplates.value.some((template) => importedAssetForTemplate(template)?.id === asset.id)) return '全局模板引入'
  if (asset.source === 'user') return '项目内新增'
  if (asset.source === 'codex') return '外部 AI 回填'
  return '项目预设'
}
const orderedTasks = computed<AiTask[]>(() => {
  const tasks = taskQueueItems.value.length ? taskQueueItems.value.map((item) => item.task) : aiWorkbench.value?.tasks ?? []
  if (!taskQueueOrder.value.length) return tasks
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const ordered = taskQueueOrder.value.map((id) => byId.get(id)).filter((task): task is AiTask => Boolean(task))
  const rest = tasks.filter((task) => !taskQueueOrder.value.includes(task.id))
  return [...ordered, ...rest]
})

const taskForm = reactive({
  target: 'next_chapter' as AiTaskTarget,
  title: taskTargetPresets.next_chapter.title,
  chapterId: '',
  contextMode: taskTargetPresets.next_chapter.contextMode,
  reviewMode: 'balanced' as 'token_saver' | 'balanced' | 'strict',
  factStrategy: 'balanced' as 'optimistic' | 'balanced' | 'conservative',
  checkpointEvery: 1,
  autoPause: 'high_risk' as 'none' | 'high_risk' | 'checkpoint' | 'any_issue',
  instruction: taskTargetPresets.next_chapter.instruction,
})

const rewriteForm = reactive({
  scope: 'chapter' as RewriteScope,
  mode: 'scene_expression' as RewriteMode,
  level: 'L2' as RewriteLevel,
  reason: '保留当前剧情事实，只调整场景表达和节奏。',
})

const styleAssetForm = reactive({
  id: '',
  profileId: undefined as string | undefined,
  templateId: undefined as string | undefined,
  kind: 'good_sample' as StyleAssetKind,
  title: '',
  body: '',
  scope: '全书',
  source: 'user' as StyleAsset['source'],
  enabled: false,
})

const styleProfileForm = reactive({
  id: '',
  title: '',
  description: '',
  tone: '',
  source: 'custom' as 'preset' | 'custom',
  active: false,
})

const moduleTabs: Array<{ label: string; panel: PanelKey; meta: string }> = [
  { label: '大纲预览', panel: 'outline', meta: '卷 / 弧线 / 章节' },
  { label: '当前摘要', panel: 'context-pack', meta: '写作参考' },
  { label: '长篇状态', panel: 'long-state', meta: '压力 / 破声点' },
  { label: '风格资产', panel: 'style-dialogue', meta: '提取 / 应用' },
  { label: '角色关系', panel: 'characters', meta: '属性 / 未来' },
  { label: '版本审稿', panel: 'audit', meta: '确认项' },
  { label: '快照导出', panel: 'snapshots', meta: '状态回滚' },
]

const workbenchPanels: Array<{ key: WorkbenchPanelKey; label: string; icon: object }> = [
  { key: 'project', label: '项目', icon: Collection },
  { key: 'tasks', label: '任务', icon: CopyDocument },
  { key: 'confirm', label: '确认', icon: DocumentChecked },
  { key: 'modules', label: '模块', icon: Finished },
]

const panelTitle = computed(() => {
  const labels: Record<PanelKey, string> = {
    'mcp-status': 'MCP 状态与回填入口',
    'task-package': 'AI 任务包',
    'context-pack': '当前写作参考',
    outline: '完整大纲',
    'long-state': '长篇状态',
    'style-dialogue': '风格资产',
    characters: '角色关系',
    audit: '审稿检查',
    snapshots: '快照导入导出',
    export: '正文导出',
    'task-new': '记录 AI 任务包',
  }
  return activePanel.value ? labels[activePanel.value] : '项目功能'
})

const loadCanvas = async () => {
  if (!projectId.value) return
  loading.value = true
  try {
    const [projectCanvas, projectChapters, projectDashboard, workbench] = await Promise.all([
      novelApi.getProjectCanvas(projectId.value),
      novelApi.listChapters(projectId.value),
      novelApi.getProjectDashboard(projectId.value),
      novelApi.getAiWorkbench(projectId.value),
    ])
    canvas.value = projectCanvas
    chapters.value = projectChapters
    dashboard.value = projectDashboard
    aiWorkbench.value = workbench
    syncTaskQueueOrder()
    if (selectedNodeId.value && !canvas.value.nodes.some((item) => item.id === selectedNodeId.value)) {
      selectedNodeId.value = ''
      detail.value = null
      drawerVisible.value = false
    }
    await nextTick()
    fitCanvas()
  } finally {
    loading.value = false
  }
}

const fitCanvas = () => {
  canvasFlowRef.value?.fitCanvas()
}

const syncTaskQueueOrder = () => {
  const ids = orderedTasks.value.map((task) => task.id)
  taskQueueOrder.value = [...taskQueueOrder.value.filter((id) => ids.includes(id)), ...ids.filter((id) => !taskQueueOrder.value.includes(id))]
}

const openNode = async (nodeId: string, options: { showDrawer?: boolean } = {}) => {
  selectedNodeId.value = nodeId
  detail.value = await novelApi.getCanvasNodeDetail(projectId.value, nodeId)
  selectedVersionId.value = detail.value.versions.find((item) => item.status === 'applied')?.id || detail.value.versions[0]?.id || ''
  taskForm.chapterId = detail.value.chapter?.id || taskForm.chapterId
  drawerVisible.value = options.showDrawer ?? true
}

const openReaderFromNode = async (nodeId: string) => {
  await openNode(nodeId, { showDrawer: false })
  openReaderDialog()
}

const openVersionFromNode = (versionId?: string) => {
  if (!versionId) return
  selectedVersionId.value = versionId
  versionDialogVisible.value = true
}

const openVersionBodyFromNode = (versionId?: string) => {
  if (!versionId || !detail.value?.chapter) return
  const version = detail.value.versions.find((item) => item.id === versionId)
  selectedVersionId.value = versionId
  minorEditText.value = version?.body || detail.value.chapter.draft || detail.value.chapter.summary || ''
  readerDialogVisible.value = true
}

const openTaskPackageFromDetail = async () => {
  const taskId = detail.value?.node.kind === 'task' ? detail.value?.node.refId : orderedTasks.value[0]?.id
  if (taskId) {
    await openTaskPackage(taskId)
    return
  }
  await openPanel('task-package')
}

const openVersionDialog = () => {
  if (!detail.value?.chapter) return
  selectedVersionId.value = selectedVersionId.value || detail.value.versions[0]?.id || ''
  versionDialogVisible.value = true
}

const openRewriteDialog = () => {
  if (!detail.value?.chapter) return
  rewriteDialogVisible.value = true
}

const toggleWorkbenchPanel = (panel: WorkbenchPanelKey) => {
  activeWorkbenchPanel.value = activeWorkbenchPanel.value === panel ? '' : panel
}

const openReaderDialog = () => {
  if (!detail.value?.chapter) return
  minorEditText.value = detail.value.chapter.draft || selectedVersion.value?.body || detail.value.chapter.summary || ''
  readerDialogVisible.value = true
}

const openPanel = async (panel: PanelKey) => {
  await router.replace({ query: { ...route.query, panel } })
  activePanel.value = panel
  panelDialogVisible.value = true
  await loadPanelData(panel)
}

const clearPanelRoute = async () => {
  panelDialogVisible.value = false
  activePanel.value = ''
  if (!route.query.panel) return
  const query = { ...route.query }
  delete query.panel
  await router.replace({ query })
}

const closePanel = () => {
  void clearPanelRoute()
}

const loadPanelData = async (panel: PanelKey) => {
  if (!projectId.value) return
  if (['mcp-status', 'task-package'].includes(panel)) {
    aiWorkbench.value = await novelApi.getAiWorkbench(projectId.value)
    syncTaskQueueOrder()
  }
  if (panel === 'task-new') chapters.value = await novelApi.listChapters(projectId.value)
  if (panel === 'context-pack') await loadContextPack()
  if (panel === 'outline') outline.value = await novelApi.listProjectOutline(projectId.value)
  if (panel === 'long-state') {
    longState.value = await novelApi.getLongState(projectId.value)
    if (!dashboard.value) dashboard.value = await novelApi.getProjectDashboard(projectId.value)
  }
  if (panel === 'style-dialogue') {
    const [projectStyles, globalTemplates] = await Promise.all([
      novelApi.listStyleProfiles(projectId.value),
      novelApi.listStyleAssetTemplates(),
    ])
    styleLibrary.value = projectStyles
    styleTemplates.value = globalTemplates
    fillStyleProfileForm(projectStyles.profiles.find((profile) => profile.id === projectStyles.activeProfileId) ?? projectStyles.profiles[0])
  }
  if (panel === 'characters') characterGraph.value = await novelApi.getCharacterRelationGraph(projectId.value)
  if (panel === 'audit') {
    dashboard.value = await novelApi.getProjectDashboard(projectId.value)
    aiWorkbench.value = await novelApi.getAiWorkbench(projectId.value)
    syncTaskQueueOrder()
    localChecks.value = await novelApi.listLocalCheckResults(projectId.value)
  }
  if (panel === 'snapshots') snapshots.value = await novelApi.listSnapshots(projectId.value)
  if (panel === 'export') projectText.value = await novelApi.exportProjectText(projectId.value)
  if (panel === 'task-package' && !taskPackage.value) {
    const firstTask = orderedTasks.value[0]
    if (firstTask) taskPackage.value = await novelApi.getAiTaskPackage(projectId.value, firstTask.id)
  }
}

const fillStyleProfileForm = (profile?: StyleProfile) => {
  styleProfileForm.id = profile?.id ?? ''
  styleProfileForm.title = profile?.title ?? ''
  styleProfileForm.description = profile?.description ?? ''
  styleProfileForm.tone = profile?.tone ?? ''
  styleProfileForm.source = profile?.source ?? 'custom'
  styleProfileForm.active = Boolean(profile && profile.id === styleLibrary.value?.activeProfileId)
}

const startNewStyleProfile = () => {
  styleProfileForm.id = ''
  styleProfileForm.title = ''
  styleProfileForm.description = ''
  styleProfileForm.tone = ''
  styleProfileForm.source = 'custom'
  styleProfileForm.active = false
}

const copyStyleProfile = (profile?: StyleProfile) => {
  const source = profile ?? selectedStyleProfile.value
  if (!source) {
    startNewStyleProfile()
    return
  }
  styleProfileForm.id = ''
  styleProfileForm.title = `${source.title} 副本`
  styleProfileForm.description = source.description
  styleProfileForm.tone = source.tone
  styleProfileForm.source = 'custom'
  styleProfileForm.active = false
}

const openStyleProfileEditor = (mode: 'create' | 'edit' | 'copy', profile?: StyleProfile) => {
  styleProfileDialogMode.value = mode
  if (mode === 'create') startNewStyleProfile()
  if (mode === 'edit') fillStyleProfileForm(profile ?? activeStyleProfile.value)
  if (mode === 'copy') copyStyleProfile(profile ?? activeStyleProfile.value)
  styleProfileDialogVisible.value = true
}

const resetStyleAssetForm = () => {
  styleAssetForm.id = ''
  styleAssetForm.profileId = styleLibrary.value?.activeProfileId
  styleAssetForm.templateId = undefined
  styleAssetForm.kind = 'good_sample'
  styleAssetForm.title = ''
  styleAssetForm.body = ''
  styleAssetForm.scope = '全书'
  styleAssetForm.source = 'user'
  styleAssetForm.enabled = false
}

const fillStyleAssetForm = (asset: StyleAsset) => {
  styleAssetForm.id = asset.id
  styleAssetForm.profileId = asset.profileId
  styleAssetForm.templateId = asset.templateId
  styleAssetForm.kind = asset.kind
  styleAssetForm.title = asset.title
  styleAssetForm.body = asset.body
  styleAssetForm.scope = asset.scope
  styleAssetForm.source = asset.source
  styleAssetForm.enabled = asset.enabled
}

const openStyleAssetEditor = (mode: 'create' | 'edit', asset?: StyleAsset) => {
  styleAssetDialogMode.value = mode
  if (mode === 'edit' && asset) fillStyleAssetForm(asset)
  else resetStyleAssetForm()
  styleAssetDialogVisible.value = true
}

const syncPanelFromRoute = () => {
  const panel = route.query.panel
  if (typeof panel === 'string' && panel) {
    openPanel(panel as PanelKey)
  } else {
    activePanel.value = ''
    panelDialogVisible.value = false
  }
}

const loadContextPack = async () => {
  const chapter = detail.value?.chapter ?? chapters.value[0]
  if (!chapter) {
    contextPack.value = null
    return
  }
  contextPack.value = await novelApi.getChapterContextPack(projectId.value, chapter.id, 'full')
}

const createTask = async () => {
  if (!taskForm.title.trim()) {
    ElMessage.warning('先填写任务标题')
    return
  }
  const payload = {
    title: taskForm.title.trim(),
    target: taskForm.target,
    contextMode: taskForm.contextMode,
    reviewMode: taskForm.reviewMode,
    factStrategy: taskForm.factStrategy,
    checkpointEvery: taskForm.checkpointEvery,
    autoPause: taskForm.autoPause,
    chapterId: taskForm.chapterId || undefined,
    instruction: taskForm.instruction.trim(),
  }
  const task = await novelApi.createAiTask(projectId.value, payload)
  ElMessage.success('AI 任务包已记录')
  taskPackage.value = await novelApi.getAiTaskPackage(projectId.value, task.id)
  activePanel.value = 'task-package'
  await router.replace({ query: { ...route.query, panel: 'task-package' } })
  await loadCanvas()
}

const openTaskPackage = async (taskId: string) => {
  taskPackage.value = await novelApi.getAiTaskPackage(projectId.value, taskId)
  activePanel.value = 'task-package'
  panelDialogVisible.value = true
  await router.replace({ query: { ...route.query, panel: 'task-package' } })
}

const completeAiTask = async (taskId: string) => {
  const result = await novelApi.completeAiTask(projectId.value, taskId)
  ElMessage.success('已记录外部回写完成')
  aiWorkbench.value = await novelApi.getAiWorkbench(projectId.value)
  syncTaskQueueOrder()
  await loadCanvas()
  taskPackage.value = null
  if (result.version) {
    await clearPanelRoute()
    await openNode(`chapter:${result.version.chapterId}`, { showDrawer: false })
    selectedVersionId.value = result.version.id
    versionDialogVisible.value = true
    return
  }
  if (result.styleAsset) {
    await openPanel('style-dialogue')
    return
  }
  if (result.task.target === 'next_10_chapters' || result.task.target === 'next_50_chapters' || result.task.target === 'next_100_chapters') {
    await openPanel('outline')
    return
  }
  await reloadSelectedNode()
}

const moveTask = async (taskId: string, direction: -1 | 1) => {
  syncTaskQueueOrder()
  const next = [...taskQueueOrder.value]
  const index = next.indexOf(taskId)
  const targetIndex = index + direction
  if (index < 0 || targetIndex < 0 || targetIndex >= next.length) return
  const [task] = next.splice(index, 1)
  if (!task) return
  next.splice(targetIndex, 0, task)
  taskQueueOrder.value = next
  await novelApi.reorderAiTaskQueue(projectId.value, next)
  aiWorkbench.value = await novelApi.getAiWorkbench(projectId.value)
  syncTaskQueueOrder()
  ElMessage.success('任务包顺序已调整')
}

const removeTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('只会移除未执行任务包；已完成任务会保留为记录。确认移除？', '移除任务包', { type: 'warning' })
  } catch {
    return
  }
  await novelApi.deleteAiTask(projectId.value, taskId)
  taskQueueOrder.value = taskQueueOrder.value.filter((id) => id !== taskId)
  if (taskPackage.value?.task.id === taskId) taskPackage.value = null
  if (selectedNodeId.value === `task:${taskId}`) {
    selectedNodeId.value = ''
    detail.value = null
    drawerVisible.value = false
  } else {
    await reloadSelectedNode()
  }
  aiWorkbench.value = await novelApi.getAiWorkbench(projectId.value)
  syncTaskQueueOrder()
  await loadCanvas()
  ElMessage.success('任务包已移除')
}

type CharacterRelationDraft = Omit<CharacterRelation, 'id' | 'projectId' | 'updatedAt'> & { id?: string }

const saveCharacterRelation = async (payload: CharacterRelationDraft) => {
  await novelApi.saveCharacterRelation(projectId.value, payload)
  characterGraph.value = await novelApi.getCharacterRelationGraph(projectId.value)
  await reloadSelectedNode()
  await loadCanvas()
  ElMessage.success('角色关系已保存')
}

const deleteCharacterRelation = async (relationId: string) => {
  await novelApi.deleteCharacterRelation(projectId.value, relationId)
  characterGraph.value = await novelApi.getCharacterRelationGraph(projectId.value)
  await reloadSelectedNode()
  await loadCanvas()
  ElMessage.success('角色关系已移除')
}

const submitRewrite = async () => {
  if (!detail.value?.chapter) return
  await novelApi.createRewriteTask(projectId.value, detail.value.chapter.id, { ...rewriteForm })
  rewriteDialogVisible.value = false
  ElMessage.success('重写条件已提交为 AI 任务包')
  await reloadSelectedNode()
  await loadCanvas()
}

const applyVersion = async () => {
  if (!detail.value?.chapter || !selectedVersion.value) return
  await novelApi.applyChapterVersion(projectId.value, detail.value.chapter.id, selectedVersion.value.id)
  versionDialogVisible.value = false
  ElMessage.success('版本已替换为定版正文，并创建快照')
  await reloadSelectedNode()
  await loadCanvas()
}

const runLocalCheck = async () => {
  if (!detail.value?.chapter) return
  latestCheckResult.value = await novelApi.runLocalChapterCheck(projectId.value, detail.value.chapter.id, {
    draft: detail.value.chapter.draft || detail.value.chapter.summary,
  })
  checkDialogVisible.value = true
  await reloadSelectedNode()
  await loadCanvas()
}

const runLocalCheckFromMinorEdit = async () => {
  if (!detail.value?.chapter) return
  latestCheckResult.value = await novelApi.runLocalChapterCheck(projectId.value, detail.value.chapter.id, {
    draft: minorEditText.value,
  })
  checkDialogVisible.value = true
  await reloadSelectedNode()
  await loadCanvas()
}

const saveMinorEditVersion = async () => {
  if (!detail.value?.chapter) return
  if (!minorEditText.value.trim()) {
    ElMessage.warning('正文内容不能为空')
    return
  }
  const chapter = detail.value.chapter
  const version = await novelApi.saveChapterVersion(projectId.value, chapter.id, {
    title: `正文小修 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
    body: minorEditText.value,
    summary: chapter.summary,
    source: '正文小修',
    kind: 'manual',
  })
  readerDialogVisible.value = false
  await reloadSelectedNode()
  selectedVersionId.value = version.id
  versionDialogVisible.value = true
  ElMessage.success('小修已保存为候选版本，请在版本对比里定版')
  await loadCanvas()
}

const bindStyle = async (profileId: string) => {
  await novelApi.bindProjectStyle(projectId.value, profileId)
  await refreshStylePanel({ profileId })
  ElMessage.success('项目风格已切换')
  await reloadSelectedNode()
}

const saveStyleProfileForm = async (activate = styleProfileForm.active) => {
  if (!styleProfileForm.title.trim() || !styleProfileForm.tone.trim()) {
    ElMessage.warning('请填写风格方案标题和语气锚点')
    return
  }
  const profile = await novelApi.saveStyleProfile(projectId.value, {
    id: styleProfileForm.id || undefined,
    title: styleProfileForm.title.trim(),
    description: styleProfileForm.description.trim() || '项目风格方案。',
    tone: styleProfileForm.tone.trim(),
    source: styleProfileForm.source,
    active: activate,
  })
  await refreshStylePanel({ profileId: profile.id })
  await reloadSelectedNode()
  styleProfileDialogVisible.value = false
  ElMessage.success(activate ? '风格方案已保存并启用' : '风格方案已保存')
}

const removeStyleProfile = async (profileId: string) => {
  try {
    await ElMessageBox.confirm('删除非当前风格方案不会删除项目内风格资产。确认删除？', '删除风格方案', { type: 'warning' })
  } catch {
    return
  }
  await novelApi.deleteStyleProfile(projectId.value, profileId)
  await refreshStylePanel({ profileId: styleLibrary.value?.activeProfileId })
  await reloadSelectedNode()
  ElMessage.success('风格方案已删除')
}

const saveStyleAsset = async () => {
  if (!styleAssetForm.title.trim() || !styleAssetForm.body.trim()) {
    ElMessage.warning('请填写风格资产标题和内容')
    return
  }
  await novelApi.saveStyleAsset(projectId.value, {
    id: styleAssetForm.id || undefined,
    profileId: styleAssetForm.profileId,
    templateId: styleAssetForm.templateId,
    kind: styleAssetForm.kind,
    title: styleAssetForm.title.trim(),
    body: styleAssetForm.body.trim(),
    scope: styleAssetForm.scope.trim() || '全书',
    source: styleAssetForm.source,
    enabled: styleAssetForm.enabled,
  })
  resetStyleAssetForm()
  styleAssetDialogVisible.value = false
  await refreshStylePanel()
  ElMessage.success('风格资产已保存到项目资产池')
}

const refreshStylePanel = async (options: { profileId?: string; syncProfileForm?: boolean } = {}) => {
  const [projectStyles, globalTemplates] = await Promise.all([
    novelApi.listStyleProfiles(projectId.value),
    novelApi.listStyleAssetTemplates(),
  ])
  styleLibrary.value = projectStyles
  styleTemplates.value = globalTemplates
  if (options.syncProfileForm ?? Boolean(options.profileId)) {
    fillStyleProfileForm(
      projectStyles.profiles.find((profile) => profile.id === options.profileId) ??
        projectStyles.profiles.find((profile) => profile.id === projectStyles.activeProfileId) ??
        projectStyles.profiles[0],
    )
  }
}

const importStyleTemplate = async (templateId: string, enabled = true) => {
  await novelApi.importStyleAssetTemplate(projectId.value, templateId, { enabled })
  await refreshStylePanel()
  await reloadSelectedNode()
  ElMessage.success(enabled ? '已加入并用于 AI 写作参考' : '已加入项目资产池')
}

const setStyleAssetApplied = async (assetId: string, enabled: boolean) => {
  await novelApi.setStyleAssetEnabled(projectId.value, assetId, enabled)
  await refreshStylePanel()
  await reloadSelectedNode()
  ElMessage.success(enabled ? '已用于 AI 写作参考' : '已改为备用，保留在项目资产池')
}

const removeStyleAsset = async (assetId: string) => {
  if (!assetId) return
  try {
    await ElMessageBox.confirm('只会从当前项目去除这条资产，不影响全局模板。确认去除？', '去除项目风格资产', { type: 'warning' })
  } catch {
    return
  }
  await novelApi.deleteStyleAsset(projectId.value, assetId)
  await refreshStylePanel()
  await reloadSelectedNode()
  ElMessage.success('已从当前项目去除')
}

const resolveReview = async (reviewId: string, decision: AiReviewDecision) => {
  await novelApi.resolveAiPendingReview(projectId.value, reviewId, decision)
  ElMessage.success('确认项已处理')
  dashboard.value = await novelApi.getProjectDashboard(projectId.value)
  await loadCanvas()
}

const settleLowRiskFacts = async () => {
  const settled = await novelApi.settleCandidateFacts(projectId.value, { risks: ['low', 'medium'], decision: 'confirmed' })
  ElMessage.success(settled.length ? `已沉淀 ${settled.length} 条候选事实` : '没有可自动沉淀的候选事实')
  dashboard.value = await novelApi.getProjectDashboard(projectId.value)
  await loadCanvas()
}

const resolveAudit = async (reportId: string) => {
  await novelApi.resolveAuditReport(projectId.value, reportId)
  ElMessage.success('审稿报告已解决')
  dashboard.value = await novelApi.getProjectDashboard(projectId.value)
  await loadCanvas()
}

const createSnapshot = async () => {
  await novelApi.createSnapshot(projectId.value, { title: '画布手动快照', reason: '在画布工作台保存当前本地项目状态。' })
  snapshots.value = await novelApi.listSnapshots(projectId.value)
  ElMessage.success('快照已创建')
}

const restoreSnapshot = async (snapshotId: string) => {
  await ElMessageBox.confirm('恢复快照会覆盖当前本地项目状态，确认继续？', '恢复快照', { type: 'warning' })
  await novelApi.restoreSnapshot(projectId.value, snapshotId)
  snapshots.value = await novelApi.listSnapshots(projectId.value)
  await loadCanvas()
  ElMessage.success('快照已恢复')
}

const exportState = async () => {
  projectStateText.value = await novelApi.exportProjectState(projectId.value)
  ElMessage.success('项目状态 JSON 已生成')
}

const importState = async () => {
  if (!importStateText.value.trim()) {
    ElMessage.warning('请先粘贴项目状态 JSON')
    return
  }
  const project = await novelApi.importProjectState(importStateText.value)
  ElMessage.success('项目状态已导入')
  if (project.id !== projectId.value) {
    await router.push({ name: 'project-canvas', params: { projectId: project.id } })
  } else {
    await loadCanvas()
  }
}

const reloadSelectedNode = async () => {
  if (!selectedNodeId.value) return
  detail.value = await novelApi.getCanvasNodeDetail(projectId.value, selectedNodeId.value)
  selectedVersionId.value = selectedVersionId.value || detail.value.versions[0]?.id || ''
}

const copyCodexPrompt = async () => {
  if (!detail.value) return
  const prompt = [
    `你是外部 AI 控制端，请通过 MCP 读取 NovelForge 项目 ${projectId.value}。`,
    `当前选中节点：${detail.value.node.kind} / ${detail.value.node.title} / ${detail.value.node.subtitle}`,
    detail.value.chapter ? `目标章节：${detail.value.chapter.id}，请优先读取当前章写作参考、版本、重写条件、长篇状态和风格资产。` : '目标节点不是章节，请读取项目画布和相关大纲状态。',
    'App 不直接调用 AI；请生成或调整后通过 MCP 回填候选版本、风格资产、事实、角色或长篇状态，不要直接覆盖定版正文。',
  ].join('\n')
  await copyText(prompt, '外部 AI 提示')
}

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label} 已复制`)
  } catch {
    ElMessage.error(`${label} 复制失败`)
  }
}

const handleCanvasAction = (event: Event) => {
  const detailValue = (event as CustomEvent<{ action?: string; projectId?: string }>).detail
  if (detailValue?.projectId && detailValue.projectId !== projectId.value) return
  if (detailValue?.action === 'refresh') loadCanvas()
}

const applyTaskTargetPreset = (target: AiTaskTarget) => {
  const preset = taskTargetPresets[target]
  taskForm.title = preset.title
  taskForm.instruction = preset.instruction
  taskForm.contextMode = preset.contextMode
  if (target === 'next_10_chapters' || target === 'next_50_chapters' || target === 'next_100_chapters' || target === 'style_process' || target === 'style_adjustment') {
    taskForm.chapterId = ''
    return
  }
  if (!taskForm.chapterId && detail.value?.chapter) taskForm.chapterId = detail.value.chapter.id
}

const characterName = (characterId: string) => {
  const source = detail.value?.characters ?? []
  return source.find((item) => item.id === characterId)?.name || characterId
}

watch(projectId, async () => {
  selectedNodeId.value = ''
  detail.value = null
  drawerVisible.value = false
  await loadCanvas()
  syncPanelFromRoute()
})
watch(() => route.query.panel, syncPanelFromRoute)
watch(() => taskForm.target, applyTaskTargetPreset)

onMounted(async () => {
  window.addEventListener('novel-forge:canvas-action', handleCanvasAction)
  await loadCanvas()
  syncPanelFromRoute()
})

onUnmounted(() => {
  window.removeEventListener('novel-forge:canvas-action', handleCanvasAction)
})
</script>

<style lang="scss" scoped>
.canvas-workspace {
  position: relative;
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  background:
    radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--brand-moss) 10%, transparent), transparent 32%),
    radial-gradient(circle at 84% 12%, color-mix(in srgb, var(--brand-copper) 10%, transparent), transparent 26%),
    var(--app-bg);
}

.canvas-title-chip {
  position: absolute;
  top: 14px;
  left: 20px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 38px;
  max-width: min(560px, calc(100% - 340px));
  padding: 5px 8px 5px 12px;
  border: 1px solid color-mix(in srgb, var(--bd-line) 72%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-raised) 48%, transparent);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--shadow-color) 10%, transparent);
  backdrop-filter: blur(14px);

  > div {
    min-width: 0;
  }

  > div:first-child {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  strong {
    display: block;
    margin-top: 0;
    color: var(--t1);
    font-size: 13px;
    font-weight: 900;
    white-space: nowrap;
  }
}

.canvas-title-chip .eyebrow {
  font-size: 9px;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.canvas-quick-actions {
  position: absolute;
  top: 14px;
  right: 20px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  border: 1px solid color-mix(in srgb, var(--bd-line) 70%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-raised) 46%, transparent);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--shadow-color) 10%, transparent);
  backdrop-filter: blur(14px);

  :deep(.el-button) {
    min-height: 30px;
  }

  :deep(.el-button.is-circle) {
    width: 30px;
    height: 30px;
  }
}

.eyebrow {
  color: var(--brand-copper);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.toolbar-metrics,
.toolbar-actions,
.row-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.toolbar-metrics {
  overflow: hidden;

  span {
    flex: 0 0 auto;
    padding: 3px 7px;
    border-left: 1px solid color-mix(in srgb, var(--brand-moss) 46%, transparent);
    border-radius: 999px;
    color: var(--t5);
    background: color-mix(in srgb, var(--surface-field) 44%, transparent);
    font-size: 10px;
    font-weight: 850;
  }
}

.toolbar-actions {
  justify-content: flex-end;
}

.canvas-panel-dock {
  position: absolute;
  top: 84px;
  left: 20px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 7px;
  border: 1px solid var(--bd-line);
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface-raised) 66%, transparent);
  box-shadow: 0 18px 40px color-mix(in srgb, var(--shadow-color) 16%, transparent);
  backdrop-filter: blur(16px);

  button {
    display: grid;
    grid-template-columns: 1fr;
    place-items: center;
    align-items: center;
    gap: 0;
    width: 38px;
    min-height: 36px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 11px;
    color: var(--t4);
    background: transparent;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;

    span {
      display: none;
    }
  }

  button:hover,
  button.active {
    border-color: color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
    color: var(--t1);
    background: color-mix(in srgb, var(--paper-surface) 82%, transparent);
    box-shadow: var(--sh-edge);
  }

  button.active {
    color: var(--on-brand);
    background: linear-gradient(135deg, var(--brand-moss), var(--brand-copper));
  }
}

.compact-list {
  display: grid;
  gap: 7px;
  margin-top: 10px;

  article {
    min-width: 0;
    padding: 9px 10px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: var(--surface-field);
  }

  strong,
  span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 900;
  }

  span {
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 750;
  }
}

.panel-dialog-body {
  max-height: calc(95vh - 138px);
  min-height: min(520px, 68vh);
  overflow: auto;
}

.dialog-grid,
.mcp-dialog-grid,
.state-grid,
.audit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.wide {
  grid-column: 1 / -1;
}

.light-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface-raised) 94%, transparent);
  box-shadow: var(--sh-edge);

  h3 {
    margin: 0;
    padding: 11px 12px;
    border-bottom: 1px solid var(--bd-line);
    color: var(--t2);
    background: var(--surface-field);
    font-size: 13px;
    font-weight: 950;
  }

  > p,
  > code {
    display: block;
    margin: 0;
    padding: 10px 12px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.card-note {
  margin: 0;
  padding: 9px 12px 0;
  color: var(--t5);
  font-size: 11px;
  font-weight: 750;
  line-height: 1.6;
}

.card-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid var(--bd-line);
  background: var(--surface-field);

  h3 {
    flex: 1 1 auto;
    border-bottom: 0;
    background: transparent;
  }

  :deep(.el-button) {
    flex: 0 0 auto;
    margin-right: 12px;
  }
}

.active-profile-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 12px 0;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-moss) 8%, var(--surface-field));

  div {
    min-width: 0;
  }

  strong,
  span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }

  span {
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 750;
  }

  b {
    flex: 0 0 auto;
    padding: 4px 8px;
    border-radius: 999px;
    color: var(--brand-moss);
    background: color-mix(in srgb, var(--brand-moss) 12%, transparent);
    font-size: 11px;
    font-weight: 950;
  }
}

.style-tone-preview {
  display: -webkit-box;
  margin: 0;
  padding: 12px;
  overflow: hidden;
  color: var(--t4);
  font-size: 12px;
  font-weight: 760;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.style-profile-form,
.style-editor-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 12px 0;

  :deep(.el-form-item) {
    min-width: 0;
    margin-bottom: 0;
  }

  .wide {
    grid-column: 1 / -1;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.profile-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--bd-line);

  :deep(.el-button) {
    margin-left: 0;
  }

  &.compact-actions {
    border-bottom: 0;
    padding-top: 0;
  }
}

.style-profile-list {
  display: grid;
  gap: 9px;
  max-height: 268px;
  padding: 12px;
  overflow: auto;

  article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: var(--surface-field);

    &.active {
      border-color: color-mix(in srgb, var(--brand-moss) 42%, var(--bd-line));
      box-shadow: inset 3px 0 0 var(--brand-moss);
    }
  }

  strong,
  p,
  small {
    display: block;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }

  p {
    margin-top: 4px;
    color: var(--t4);
    font-size: 11px;
    font-weight: 780;
  }

  small {
    margin-top: 4px;
    color: var(--t5);
    font-size: 10px;
    font-weight: 800;
  }

  .row-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.list-row,
.pressure-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 62px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--bd-line);

  &:last-child {
    border-bottom: 0;
  }

  &.compact {
    min-height: 50px;
  }

  strong,
  p,
  small,
  code {
    display: block;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--t2);
    font-size: 12px;
    font-weight: 950;
  }

  p,
  small,
  code {
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 750;
  }

  > div {
    min-width: 0;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  .wide {
    grid-column: 1 / -1;
  }
}

.dialog-note {
  margin: 10px 0 0;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--brand-copper) 28%, var(--bd-line));
  border-radius: 8px;
  color: var(--t5);
  background: color-mix(in srgb, var(--brand-copper) 7%, var(--surface-raised));
  font-size: 12px;
  font-weight: 750;
  line-height: 1.6;
}

.outline-guide {
  p {
    margin: 0;
    padding: 10px 12px 0;
    color: var(--t5);
    font-size: 12px;
    font-weight: 750;
    line-height: 1.7;
  }
}

.outline-summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 10px 12px 12px;

  span {
    padding: 4px 8px;
    border: 1px solid color-mix(in srgb, var(--brand-moss) 28%, var(--bd-line));
    border-radius: 999px;
    color: var(--brand-moss);
    background: color-mix(in srgb, var(--brand-moss) 7%, transparent);
    font-size: 11px;
    font-weight: 900;
  }
}

.outline-row {
  align-items: flex-start;
}

.task-package,
.context-layout,
.snapshot-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.74fr) minmax(300px, 0.46fr);
  gap: 10px;
}

.json-preview {
  grid-column: 1 / -1;
  min-height: 220px;
  max-height: 45vh;
  margin: 0;
  padding: 12px;
  overflow: auto;
  border: 1px solid var(--bd-line);
  border-radius: 10px;
  color: var(--t2);
  background: var(--paper-surface);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 11px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.text-export {
  min-height: 62vh;
}

.snapshot-layout .light-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 10px;

  h3 {
    margin-bottom: 0;
  }

  > .el-button,
  > .el-textarea {
    margin: 0 10px;
  }
}

@media (max-width: 1100px) {
  .project-snapshot,
  .dialog-grid,
  .mcp-dialog-grid,
  .state-grid,
  .audit-grid,
  .task-package,
  .context-layout,
  .snapshot-layout,
  .form-grid,
  .style-profile-form,
  .style-editor-form {
    grid-template-columns: 1fr;
  }

  .style-profile-list article {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1500px) and (min-width: 1101px) {
  .project-snapshot {
    grid-template-columns: 1fr;

    p {
      -webkit-line-clamp: 1;
    }
  }
}
</style>

<style lang="scss">
.canvas-drawer .el-drawer__body {
  padding: 0;
  background: var(--app-bg);
}

.nf-dialog {
  display: flex;
  flex-direction: column;
  max-height: 95vh;
}

.nf-dialog .el-dialog__header,
.nf-dialog .el-dialog__footer {
  flex: 0 0 auto;
}

.nf-dialog .el-dialog__body {
  min-height: 0;
}
</style>
