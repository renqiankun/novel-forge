<template>
  <section v-loading="loading" class="project-module">
    <template v-if="loadError">
      <section class="panel empty-state">
        <strong>项目不可用</strong>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="router.push('/projects')">返回项目列表</el-button>
      </section>
    </template>

    <template v-else-if="moduleName === 'mcp-status'">
      <div class="module-grid mcp-grid">
        <section class="panel status-hero">
          <div class="hero-copy">
            <span class="eyebrow">Passive MCP Workbench</span>
            <h2>外部 AI 主控，App 只提供状态与回写入口</h2>
            <p>下一章、下 10 章、下 100 章都在 Codex / Claude Code 发起；这里记录策略、展示资源、接收版本和高风险确认。</p>
          </div>
          <div class="hero-metrics">
            <div><span>待处理任务</span><strong>{{ aiWorkbench?.stats.queuedTasks ?? 0 }}</strong></div>
            <div><span>MCP 资源</span><strong>{{ aiWorkbench?.stats.contextResources ?? 0 }}</strong></div>
            <div><span>待确认</span><strong>{{ aiWorkbench?.stats.pendingReviews ?? 0 }}</strong></div>
            <div><span>最近回写</span><strong>{{ aiWorkbench?.stats.recentWrites ?? 0 }}</strong></div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>外部任务队列</h3>
            <button type="button" class="text-action" @click="openTaskDialog">新增 Codex 任务</button>
          </div>
          <div class="filter-strip">
            <el-select v-model="taskTargetFilter" size="small">
              <el-option label="全部任务" value="all" />
              <el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="taskStatusFilter" size="small">
              <el-option label="全部状态" value="all" />
              <el-option label="上下文就绪" value="context_ready" />
              <el-option label="等待 AI" value="waiting_for_ai" />
              <el-option label="已回写" value="completed" />
              <el-option label="需确认" value="needs_review" />
            </el-select>
          </div>
          <div class="row-list scroll-area">
            <article v-for="task in filteredAiTasks" :key="task.id" class="ledger-row">
              <div class="row-main">
                <strong>{{ task.title }}</strong>
                <p>{{ task.instruction }}</p>
                <small>{{ targetLabel(task.target) }} / {{ contextModeLabel(task.contextMode) }} / {{ reviewModeLabel(task.reviewMode) }} / 每 {{ task.checkpointEvery }} 章检查</small>
              </div>
              <div class="row-actions">
                <span class="text-status" :class="`is-${task.status}`">{{ aiTaskStatusLabel(task.status) }}</span>
                <el-button size="small" @click="openTaskPackage(task.id)">任务包</el-button>
                <el-button v-if="task.status !== 'completed'" size="small" @click="completeAiTask(task.id)">
                  记录外部回写完成
                </el-button>
              </div>
            </article>
            <el-empty v-if="filteredAiTasks.length === 0" description="暂无匹配任务" />
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>MCP 可读资源</h3>
            <span class="hint">Codex 会按任务读取这些项目资料</span>
          </div>
          <div class="row-list scroll-area">
            <article v-for="resource in aiResources" :key="resource.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ resource.title }}</strong>
                <p>{{ resource.description }}</p>
                <small>{{ resourceKindLabel(resource.kind) }} / {{ contextModeLabel(resource.contextMode) }} / {{ resource.items }} 项资料</small>
              </div>
              <span class="plain-mark">{{ resourceAccessLabel(resource.kind) }}</span>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>高影响确认</h3>
            <span class="hint">低风险交给 AI 吸收，高风险才打扰用户</span>
          </div>
          <div class="row-list scroll-area">
            <article v-for="review in aiPendingReviews" :key="review.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ review.title }}</strong>
                <p>{{ review.body }}</p>
                <small>{{ review.createdAt.slice(0, 16).replace('T', ' ') }}</small>
              </div>
              <div class="row-actions">
                <span class="risk-text" :class="`risk-${review.severity}`">{{ severityLabel(review.severity) }}</span>
                <button type="button" class="text-action" @click="resolveReview(review.id, review.kind === 'candidate_fact' ? 'accept' : 'resolve')">
                  处理
                </button>
              </div>
            </article>
            <el-empty v-if="aiPendingReviews.length === 0" description="暂无高影响确认" />
          </div>
        </section>

        <section class="panel wide-panel">
          <div class="panel-head">
            <h3>Codex 回填记录</h3>
            <el-select v-model="writeKindFilter" size="small" class="kind-filter">
              <el-option label="全部回填" value="all" />
              <el-option label="AI 任务" value="ai_task" />
              <el-option label="章节版本" value="chapter_version" />
              <el-option label="章节定版" value="chapter_final" />
              <el-option label="章节重写" value="rewrite" />
              <el-option label="大纲" value="outline" />
              <el-option label="世界事实" value="world_fact" />
              <el-option label="角色" value="character" />
              <el-option label="风格" value="style" />
              <el-option label="快照" value="snapshot" />
            </el-select>
          </div>
          <div class="row-list scroll-area">
            <article v-for="log in filteredAiWriteLogs" :key="log.id" class="ledger-row compact">
              <div class="row-main">
                <span class="plain-mark">{{ writeKindLabel(log.kind) }} / {{ log.actor }}</span>
                <strong>{{ log.title }}</strong>
                <p>{{ log.summary }}</p>
                <small>{{ log.createdAt.slice(0, 16).replace('T', ' ') }}</small>
              </div>
            </article>
            <el-empty v-if="filteredAiWriteLogs.length === 0" description="暂无匹配回填记录" />
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="moduleName === 'manuscript'">
      <div class="manuscript-layout">
        <aside class="panel chapter-rail">
          <div class="panel-head">
            <h3>章节主线</h3>
            <span class="plain-mark">{{ chapters.length }} 章</span>
          </div>
          <div class="chapter-scroll">
            <button
              v-for="chapter in chapters"
              :key="chapter.id"
              class="chapter-row"
              :class="{ active: chapter.id === selectedChapterId }"
              type="button"
              @click="selectChapter(chapter.id)"
            >
              <strong>第 {{ chapter.index }} 章</strong>
              <span>{{ chapter.title }}</span>
              <em>{{ chapterStatusLabel(chapter.status) }} / {{ chapter.wordCount }} 字</em>
            </button>
          </div>
        </aside>

        <main v-if="selectedChapter" class="writer-stage">
          <header class="writer-head">
            <div>
              <h2>第 {{ selectedChapter.index }} 章：{{ chapterForm.title || selectedChapter.title }}</h2>
              <span>{{ chapterStatusLabel(chapterForm.status) }} / {{ currentDraftWordCount }} 字</span>
            </div>
            <div class="writer-actions">
              <div class="segmented">
                <button type="button" :class="{ active: editorMode === 'read' }" @click="editorMode = 'read'">阅读</button>
                <button type="button" :class="{ active: editorMode === 'edit' }" @click="editorMode = 'edit'">编辑</button>
              </div>
              <el-button v-if="editorMode === 'edit'" @click="saveChapterDraft">保存</el-button>
              <el-button @click="openContextDialog">上下文</el-button>
              <el-button @click="openRewriteDialog">重写条件</el-button>
              <el-button type="primary" @click="openVersionDialog">版本定版</el-button>
            </div>
          </header>

          <section class="contract-strip">
            <div>
              <span>本章目标</span>
              <strong>{{ activeOutlineNode?.goal || selectedChapter.intention }}</strong>
            </div>
            <div>
              <span>冲突压力</span>
              <strong>{{ activeOutlineNode?.conflict || '待补充本章核心阻力' }}</strong>
            </div>
            <div>
              <span>结尾回报</span>
              <strong>{{ activeOutlineNode?.payoff || selectedChapter.summary }}</strong>
            </div>
            <div>
              <span>焦点 / 剧情线</span>
              <strong>{{ outlineContractSummary(activeOutlineNode) || '待补充章节焦点与剧情线' }}</strong>
            </div>
          </section>

          <section class="paper-editor">
            <el-input
              v-if="editorMode === 'edit'"
              v-model="chapterForm.draft"
              class="draft-input"
              type="textarea"
              resize="none"
              placeholder="真实正文由 Codex 回写；这里用于少量人工微调、版本确认前修补。"
            />
            <article v-else class="reader-surface">
              <p v-if="previewBody.trim()">{{ previewBody }}</p>
              <p v-else class="empty-copy">当前章还没有正文。请在 Codex 中读取 MCP 上下文后生成，再通过回填任务写入版本池。</p>
            </article>
          </section>
        </main>
      </div>
    </template>

    <template v-else-if="moduleName === 'outline'">
      <div class="module-grid two-col">
        <section class="panel">
          <div class="panel-head">
            <h3>大纲骨架</h3>
            <button type="button" class="text-action" @click="openOutlineDialog()">新增节点</button>
          </div>
          <div class="row-list scroll-area">
            <article v-for="node in outlineNodes" :key="node.id" class="ledger-row tall">
              <div class="row-main">
                <span class="plain-mark">{{ outlineKindLabel(node.kind) }} / {{ outlineStatusLabel(node.status) }}</span>
                <strong>{{ node.title }}</strong>
                <p>{{ node.summary }}</p>
                <small>目标：{{ node.goal }}；回报：{{ node.payoff }}</small>
                <small v-if="outlineContractSummary(node)">{{ outlineContractSummary(node) }}</small>
              </div>
              <div class="row-actions">
                <el-button size="small" @click="openOutlineDialog(node)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="deleteOutline(node.id)">删除</el-button>
              </div>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>章节功能契约</h3>
            <span class="hint">供 Context Pack 和重写桥接读取</span>
          </div>
          <div class="row-list scroll-area">
            <article v-for="node in outlineChapterNodes" :key="node.id" class="ledger-row compact">
              <div class="row-main">
                <strong>第 {{ node.chapterIndex }} 章：{{ node.title }}</strong>
                <p>{{ outlineContractSummary(node) || node.goal }}</p>
                <small>{{ node.actorGoal || node.goal }}；阻力：{{ node.obstacle || node.conflict }}</small>
                <small v-if="node.mainlineImpact">影响：{{ node.mainlineImpact }}</small>
              </div>
              <button type="button" class="text-action" @click="openOutlineDialog(node)">编辑</button>
            </article>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="moduleName === 'context-pack'">
      <div class="module-grid context-grid">
        <section class="panel context-main">
          <div class="panel-head">
            <h3>Context Pack 预览</h3>
            <div class="inline-controls">
              <div class="segmented">
                <button v-for="mode in contextModes" :key="mode.value" type="button" :class="{ active: contextMode === mode.value }" @click="setContextMode(mode.value)">
                  {{ mode.label }}
                </button>
              </div>
              <el-button size="small" @click="openContextDialog">弹窗查看</el-button>
            </div>
          </div>
          <div v-if="contextPack" class="context-sections scroll-area">
            <section>
              <h4>任务与章节</h4>
              <p>{{ contextPack.chapter.intention }}</p>
              <small>预算：约 {{ contextPack.budget.estimatedTokens }} / {{ contextPack.budget.hardLimit }} tokens；本地预览不消耗 AI Token。</small>
            </section>
            <section>
              <h4>大纲与故事线</h4>
              <p>{{ contextPack.chapterOutline?.goal || '当前章还未绑定章节大纲。' }}</p>
              <small v-if="contextPack.chapterOutline">{{ outlineContractSummary(contextPack.chapterOutline) || '章节焦点、剧情线和本章功能待补充。' }}</small>
            </section>
            <section>
              <h4>关键事实与角色</h4>
              <p>{{ contextPack.worldFacts.map((item) => item.title).join('、') || '暂无事实' }}</p>
              <p>{{ contextPack.characters.map((item) => `${item.name}：${item.knowledge}`).join('；') }}</p>
            </section>
            <section>
              <h4>长篇状态</h4>
              <p>剧情债务 {{ contextPack.longState.debts.length }} 条，伏笔 {{ contextPack.longState.foreshadows.length }} 条，压力记录 {{ contextPack.longState.pressures.length }} 条。</p>
            </section>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>裁剪优先级</h3>
            <span class="hint">超过预算时按此降级</span>
          </div>
          <ol class="priority-list">
            <li>保留硬规则、当前章目标、知识边界、时间消息约束。</li>
            <li>保留当前角色状态、关系账本、活跃伏笔和代价。</li>
            <li>原文回捞只保留强相关片段。</li>
            <li>风格样本只选当前问题相关样本。</li>
            <li>远期低风险背景降级为摘要。</li>
          </ol>
        </section>

        <section class="panel wide-panel">
          <div class="panel-head">
            <h3>Codex 任务包模板</h3>
            <span class="hint">所有创作动作都从控制端发起，App 只准备上下文和回填入口</span>
          </div>
          <div class="task-template-list">
            <article v-for="template in contextTaskTemplates" :key="template.target" class="task-template">
              <div>
                <span class="plain-mark">{{ contextModeLabel(template.contextMode) }} / {{ reviewModeLabel(template.reviewMode) }}</span>
                <strong>{{ template.title }}</strong>
                <p>{{ template.description }}</p>
                <small>读取：{{ template.reads.join('、') }}；回填：{{ template.writes.join('、') }}</small>
              </div>
              <el-button size="small" type="primary" @click="createTaskFromTemplate(template.target)">
                {{ template.target === 'rewrite_chapter' ? '填写重写条件' : '创建任务包' }}
              </el-button>
            </article>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="moduleName === 'long-state'">
      <div class="long-state">
        <section class="panel state-section">
          <div class="panel-head">
            <h3>时间、消息与知识边界</h3>
            <span class="hint">防瞬移、防消息秒到</span>
          </div>
          <div class="split-list">
            <article v-for="event in longState?.timeline ?? []" :key="event.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ event.title }}</strong>
                <p>{{ event.time }} / {{ event.place }}</p>
                <small>{{ event.body }}</small>
              </div>
            </article>
            <article v-for="message in longState?.messages ?? []" :key="message.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ message.title }}</strong>
                <p>{{ message.sentAt }} -> {{ message.arrivesAt }} / {{ message.holder }}</p>
                <small>{{ message.version }} / {{ message.status }} / {{ message.body }}</small>
              </div>
            </article>
          </div>
        </section>

        <section class="panel state-section">
          <div class="panel-head">
            <h3>压力值与破声点</h3>
            <button type="button" class="text-action" @click="recordPressureSignal">记录压力变化</button>
          </div>
          <div class="row-list">
            <article v-for="pressure in longState?.pressures ?? []" :key="pressure.id" class="pressure-row">
              <div>
                <strong>{{ characterName(pressure.characterId) }} / {{ pressure.emotion }}</strong>
                <p>{{ pressure.source }}</p>
                <small>破声点：{{ pressure.breakpoint || '未触发' }}；余震：{{ pressure.aftermath }}</small>
              </div>
              <div class="pressure-meter">
                <span :style="{ width: `${Math.min(100, pressure.value)}%` }"></span>
              </div>
              <b>{{ pressure.value }}/{{ pressure.threshold }}</b>
            </article>
          </div>
        </section>

        <section class="panel state-section wide">
          <div class="panel-head">
            <h3>关系、伏笔、代价、剧情债务</h3>
            <button type="button" class="text-action" @click="recordPlotDebt">记录剧情债务</button>
          </div>
          <div class="ledger-columns">
            <div>
              <h4>故事线矿脉</h4>
              <article v-for="thread in longState?.threads ?? []" :key="thread.id">
                <strong>{{ thread.title }}</strong>
                <p>{{ thread.body }}</p>
                <small>{{ thread.status }} / {{ thread.nextWindow }}</small>
              </article>
            </div>
            <div>
              <h4>伏笔账本</h4>
              <article v-for="item in longState?.foreshadows ?? []" :key="item.id">
                <strong>{{ item.title }}</strong>
                <p>{{ item.body }}</p>
                <small>{{ item.status }} / {{ item.nextWindow }}</small>
              </article>
            </div>
            <div>
              <h4>代价账本</h4>
              <article v-for="item in longState?.costs ?? []" :key="item.id">
                <strong>{{ item.title }}</strong>
                <p>{{ item.body }}</p>
                <small>{{ item.status }} / {{ item.trigger }}</small>
              </article>
            </div>
            <div>
              <h4>剧情债务</h4>
              <article v-for="item in longState?.debts ?? []" :key="item.id">
                <strong>{{ item.title }}</strong>
                <p>{{ item.body }}</p>
                <small>{{ debtSeverityLabel(item.severity) }} / {{ item.window }}</small>
              </article>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="moduleName === 'style-dialogue'">
      <div class="module-grid two-col">
        <section class="panel">
          <div class="panel-head">
            <h3>项目风格</h3>
            <div class="head-action-group">
              <button type="button" class="text-action" @click="openStyleCodexTask('style_extract')">Codex 提取</button>
              <button type="button" class="text-action" @click="openStyleCodexTask('style_process')">Codex 处理</button>
              <button type="button" class="text-action" @click="openStyleAssetDialog()">添加资产</button>
            </div>
          </div>
          <div class="row-list scroll-area">
            <article v-for="profile in styleLibrary?.profiles ?? []" :key="profile.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ profile.title }}</strong>
                <p>{{ profile.description }}</p>
                <small>{{ profile.tone }}</small>
              </div>
              <button type="button" class="text-action" @click="bindStyle(profile.id)">
                {{ profile.active ? '已启用' : '启用' }}
              </button>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>风格资产与对白样本</h3>
            <span class="hint">注入 Context Pack 时会按相关性选取</span>
          </div>
          <div class="row-list scroll-area">
            <article v-for="asset in styleLibrary?.assets ?? []" :key="asset.id" class="ledger-row compact">
              <div class="row-main">
                <span class="plain-mark">{{ styleAssetKindLabel(asset.kind) }} / {{ asset.scope }}</span>
                <strong>{{ asset.title }}</strong>
                <p>{{ asset.body }}</p>
              </div>
              <div class="row-actions">
                <button type="button" class="text-action" @click="toggleStyleAsset(asset)">
                  {{ asset.enabled ? '停用' : '启用' }}
                </button>
                <button type="button" class="text-action danger" @click="deleteStyleAsset(asset.id)">删除</button>
              </div>
            </article>
          </div>
        </section>

        <section class="panel wide-panel">
          <div class="panel-head">
            <h3>角色声音画像</h3>
            <span class="hint">对白不是普通正文，必须读取关系与压力</span>
          </div>
          <div class="dialogue-grid">
            <article v-for="profile in longState?.dialogueProfiles ?? []" :key="profile.id">
              <strong>{{ profile.title }}</strong>
              <p>{{ profile.relationshipTone }}</p>
              <ul>
                <li v-for="rule in profile.voiceRules" :key="rule">{{ rule }}</li>
              </ul>
              <small>禁止：{{ profile.forbidden.join('、') }}</small>
            </article>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="moduleName === 'audit'">
      <div class="module-grid audit-grid">
        <section class="panel">
          <div class="panel-head">
            <h3>本地规则检查</h3>
            <span class="hint">默认不消耗 AI Token</span>
          </div>
          <div class="row-list scroll-area">
            <article v-for="check in localChecks" :key="check.id" class="ledger-row compact">
              <div class="row-main">
                <strong>本地检查 {{ check.level }} / {{ check.issues.length }} 项提示</strong>
                <p>{{ check.requiresConfirmation ? '需要用户确认后保存' : '可直接保存' }}</p>
                <p v-if="check.issues.length" class="issue-line">
                  {{ check.issues.slice(0, 3).map((issue) => `${localIssueCategoryLabel(issue.category)}：${issue.title}`).join(' / ') }}
                </p>
                <small>{{ check.createdAt.slice(0, 16).replace('T', ' ') }}</small>
              </div>
              <span class="plain-mark">本地</span>
            </article>
            <el-empty v-if="localChecks.length === 0" description="暂无本地检查记录" />
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>候选事实</h3>
            <div class="head-action-group">
              <span class="hint">AI 抽取后先沉淀，不直接改权威事实</span>
              <button :disabled="autoSettleCandidateCount === 0" type="button" class="text-action" @click="settleLowRiskFacts">
                自动沉淀 {{ autoSettleCandidateCount }}
              </button>
            </div>
          </div>
          <div class="row-list scroll-area">
            <article v-for="fact in candidateFacts" :key="fact.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ fact.title }}</strong>
                <p>{{ fact.body }}</p>
                <small>{{ fact.kind }} / {{ candidateStatusLabel(fact.status) }}</small>
              </div>
              <div class="row-actions">
                <span class="risk-text" :class="`risk-${fact.risk}`">{{ riskLabel(fact.risk) }}</span>
                <button v-if="fact.status === 'pending'" type="button" class="text-action" @click="confirmFact(fact.id, 'confirmed')">沉淀</button>
                <button v-if="fact.status === 'pending'" type="button" class="text-action danger" @click="confirmFact(fact.id, 'rejected')">忽略</button>
              </div>
            </article>
          </div>
        </section>

        <section class="panel wide-panel">
          <div class="panel-head">
            <h3>审稿报告</h3>
            <div class="head-action-group">
              <span class="hint">本地规则优先，AI 审查按需触发</span>
              <button :disabled="openAuditCount === 0" type="button" class="text-action" @click="resolveOpenAudits">全部标记解决</button>
            </div>
          </div>
          <div class="row-list">
            <article v-for="report in auditReports" :key="report.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ report.title }}</strong>
                <p>{{ report.items.join('；') }}</p>
                <small>{{ report.stage }} / {{ report.status }}</small>
              </div>
              <div class="row-actions">
                <span class="risk-text" :class="`risk-${report.severity}`">{{ severityLabel(report.severity) }}</span>
                <button v-if="report.status === 'open'" type="button" class="text-action" @click="resolveAudit(report.id)">解决</button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="moduleName === 'snapshots'">
      <div class="module-grid two-col">
        <section class="panel">
          <div class="panel-head">
            <h3>快照与回滚依据</h3>
            <div class="head-action-group">
              <button type="button" class="text-action" @click="createManualSnapshot">创建快照</button>
              <button type="button" class="text-action" @click="openStateExport">导出状态</button>
              <button type="button" class="text-action" @click="openStateImport">导入状态</button>
            </div>
          </div>
          <div class="row-list scroll-area">
            <article v-for="snapshot in snapshots" :key="snapshot.id" class="ledger-row compact">
              <div class="row-main">
                <strong>{{ snapshot.title }}</strong>
                <p>{{ snapshot.reason }}</p>
                <small>{{ snapshot.createdAt.slice(0, 16).replace('T', ' ') }} / {{ snapshot.payload ? '可恢复' : '旧快照仅记录' }}</small>
              </div>
              <button :disabled="!snapshot.payload" type="button" class="text-action" @click="restoreSnapshot(snapshot.id)">恢复</button>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>正文导出预览</h3>
            <div class="head-action-group">
              <button type="button" class="text-action" @click="loadExportText">刷新预览</button>
              <button type="button" class="text-action" @click="copyText(exportText, '正文导出')">复制正文</button>
            </div>
          </div>
          <pre class="export-preview">{{ exportText }}</pre>
        </section>
      </div>
    </template>

    <template v-else>
      <div class="module-grid overview-grid">
        <section class="panel metric-panel">
          <div v-for="item in overviewMetrics" :key="item.label" class="metric-cell">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.note }}</p>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>最近章节</h3>
            <span class="hint">正文主线进度</span>
          </div>
          <div class="row-list">
            <article v-for="chapter in dashboard?.recentChapters ?? []" :key="chapter.id" class="ledger-row compact">
              <div class="row-main">
                <strong>第 {{ chapter.index }} 章：{{ chapter.title }}</strong>
                <p>{{ chapter.summary }}</p>
                <small>{{ chapterStatusLabel(chapter.status) }} / {{ chapter.wordCount }} 字</small>
              </div>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>流程状态</h3>
            <span class="hint">本地 UI</span>
          </div>
          <div class="status-stack">
            <div><span>候选事实</span><strong>{{ dashboard?.stats.pendingFacts ?? 0 }}</strong></div>
            <div><span>审稿风险</span><strong>{{ dashboard?.stats.auditIssues ?? 0 }}</strong></div>
            <div><span>剧情债务</span><strong>{{ dashboard?.stats.plotDebts ?? 0 }}</strong></div>
            <div><span>压力提醒</span><strong>{{ dashboard?.stats.pressureAlerts ?? 0 }}</strong></div>
          </div>
        </section>
      </div>
    </template>

    <el-dialog v-model="taskDialogVisible" title="Codex 任务包" width="680px" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <el-form label-position="top">
          <div class="form-grid">
            <el-form-item label="任务标题">
              <el-input v-model="taskForm.title" />
            </el-form-item>
            <el-form-item label="创作范围">
              <el-select v-model="taskForm.target">
                <el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="上下文预算">
              <el-select v-model="taskForm.contextMode">
                <el-option v-for="item in contextModes" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="检查模式">
              <el-select v-model="taskForm.reviewMode">
                <el-option label="省 Token" value="token_saver" />
                <el-option label="平衡" value="balanced" />
                <el-option label="严格" value="strict" />
              </el-select>
            </el-form-item>
            <el-form-item label="候选事实策略">
              <el-select v-model="taskForm.factStrategy">
                <el-option label="乐观" value="optimistic" />
                <el-option label="平衡" value="balanced" />
                <el-option label="保守" value="conservative" />
              </el-select>
            </el-form-item>
            <el-form-item label="检查点间隔">
              <el-input-number v-model="taskForm.checkpointEvery" :min="1" :max="20" />
            </el-form-item>
          </div>
          <el-form-item label="给 Codex / Claude Code 的说明">
            <el-input v-model="taskForm.instruction" type="textarea" :rows="4" resize="none" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createAiTask">保存任务包</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="taskPackageDialogVisible" title="MCP 可读任务包" width="88vw" align-center class="nf-dialog">
      <div v-if="selectedTaskPackage" class="nf-dialog-body task-package-body">
        <section class="task-package-summary">
          <div>
            <span>任务</span>
            <strong>{{ selectedTaskPackage.task.title }}</strong>
          </div>
          <div>
            <span>读取资源</span>
            <strong>{{ selectedTaskPackage.expectedReadResources.length }}</strong>
          </div>
          <div>
            <span>回填目标</span>
            <strong>{{ selectedTaskPackage.expectedWriteBack.length }}</strong>
          </div>
          <div>
            <span>预算</span>
            <strong>{{ selectedTaskPackage.task.contextMode }}</strong>
          </div>
        </section>
        <section class="writeback-targets">
          <article v-for="target in selectedTaskPackage.expectedWriteBack" :key="target.kind + target.title">
            <strong>{{ writeKindLabel(target.kind) }} / {{ target.title }}</strong>
            <p>{{ target.description }}</p>
            <span :class="{ optional: !target.required }">{{ target.required ? '必须回填' : '可选回填' }}</span>
          </article>
        </section>
        <pre class="context-json">{{ taskPackageText }}</pre>
      </div>
      <template #footer>
        <span class="compare-hint">复制提示后交给 Codex 控制端执行；App 不直接调用 AI。</span>
        <el-button @click="copyText(taskPackageText, '任务包 JSON')">复制 JSON</el-button>
        <el-button type="primary" @click="copyText(taskHandoffPrompt, 'Codex 提示')">复制 Codex 提示</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rewriteDialogVisible" title="重写条件" width="720px" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <p class="dialog-note">这里不调用 AI，只把重写条件保存为 Codex 可读取任务。候选正文必须由外部 AI 通过 MCP 回填到版本池。</p>
        <el-form label-position="top">
          <div class="form-grid">
            <el-form-item label="范围">
              <el-select v-model="rewriteForm.scope">
                <el-option label="段落" value="paragraph" />
                <el-option label="场景" value="scene" />
                <el-option label="整章" value="chapter" />
                <el-option label="对白" value="dialogue" />
              </el-select>
            </el-form-item>
            <el-form-item label="模式">
              <el-select v-model="rewriteForm.mode">
                <el-option label="风格语气" value="style_voice" />
                <el-option label="对白" value="dialogue" />
                <el-option label="场景表达" value="scene_expression" />
                <el-option label="章节桥接" value="chapter_bridge" />
                <el-option label="影响后文" value="plot_impact" />
              </el-select>
            </el-form-item>
            <el-form-item label="等级">
              <el-select v-model="rewriteForm.level">
                <el-option label="L0 微修" value="L0" />
                <el-option label="L1 轻量表达" value="L1" />
                <el-option label="L2 场景表达" value="L2" />
                <el-option label="L3 章节桥接" value="L3" />
                <el-option label="L4 剧情影响" value="L4" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="重写原因 / 给 Codex 的建议">
            <el-input v-model="rewriteForm.reason" type="textarea" :rows="4" resize="none" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="rewriteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createRewrite">提交给 Codex</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="versionDialogVisible" title="版本对比与定版" width="92vw" align-center class="nf-dialog">
      <div class="nf-dialog-body version-dialog-body">
        <div class="version-shell">
          <div class="version-compare">
            <section>
              <h4>当前正文</h4>
              <pre>{{ selectedChapter?.draft || '当前无正文' }}</pre>
            </section>
            <section>
              <h4>{{ selectedVersion?.title || '请选择候选版本' }}</h4>
              <pre>{{ selectedVersion?.body || '右侧选择一个版本后查看内容' }}</pre>
            </section>
          </div>
          <aside class="version-list">
            <button
              v-for="(version, index) in versions"
              :key="version.id"
              type="button"
              class="version-row"
              :class="{ active: version.id === selectedVersionId }"
              @click="selectedVersionId = version.id"
            >
              <b>#{{ versions.length - index }}</b>
              <span>
                <strong>{{ version.title }}</strong>
                <em>{{ version.source }} / {{ version.wordCount }} 字 / {{ versionStatusLabel(version.status) }}</em>
              </span>
            </button>
          </aside>
        </div>
      </div>
      <template #footer>
        <span class="compare-hint">应用版本前会创建快照；版本只在用户确认后替换当前正文。</span>
        <el-button @click="versionDialogVisible = false">关闭</el-button>
        <el-button :disabled="!selectedVersion" type="primary" @click="applySelectedVersion">替换为新版本</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="contextDialogVisible" title="当前章上下文" width="86vw" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <pre class="context-json">{{ contextPackText }}</pre>
      </div>
      <template #footer>
        <span class="compare-hint">给 Codex 读取当前章时使用，后续会由 MCP 自动提供。</span>
        <el-button @click="copyText(contextPackText, 'Context Pack JSON')">复制 JSON</el-button>
        <el-button type="primary" @click="copyText(contextHandoffPrompt, '上下文提示')">复制上下文提示</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="stateExportDialogVisible" title="项目状态 JSON" width="76vw" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <p class="dialog-note">这是当前项目状态包，可对应 MCP/SQLite 的调试输入。</p>
        <pre class="context-json">{{ projectStateText }}</pre>
      </div>
      <template #footer>
        <el-button @click="copyText(projectStateText, '项目状态 JSON')">复制 JSON</el-button>
        <el-button @click="stateExportDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="stateImportDialogVisible" title="导入项目状态" width="720px" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <p class="dialog-note">导入旧项目状态包已不作为主流程；真实数据以 SQLite 和正文文件为准。</p>
        <el-input v-model="importStateText" type="textarea" :rows="14" resize="none" placeholder="粘贴 exportProjectState 得到的 JSON" />
      </div>
      <template #footer>
        <el-button @click="stateImportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="importProjectState">导入</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="localCheckDialogVisible" title="本地检查结果" width="680px" align-center class="nf-dialog">
      <div v-if="pendingLocalCheck" class="nf-dialog-body">
        <div class="check-summary">
          <strong>等级 {{ pendingLocalCheck.level }} / {{ pendingLocalCheck.issues.length }} 项提示</strong>
          <span>本地检查，不消耗 AI Token</span>
        </div>
        <article v-for="issue in pendingLocalCheck.issues" :key="issue.id" class="check-row">
          <strong>{{ issue.title }}</strong>
          <p>{{ issue.body }}</p>
          <small v-if="issue.evidence">{{ issue.evidence }}</small>
        </article>
      </div>
      <template #footer>
        <el-button @click="localCheckDialogVisible = false">返回编辑</el-button>
        <el-button type="primary" @click="forceSaveDraft">继续保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="outlineDialogVisible" title="大纲节点" width="680px" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <el-form label-position="top">
          <div class="form-grid">
            <el-form-item label="类型">
              <el-select v-model="outlineForm.kind">
                <el-option label="全书" value="book" />
                <el-option label="卷" value="volume" />
                <el-option label="故事线" value="arc" />
                <el-option label="章节" value="chapter" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="outlineForm.status">
                <el-option label="计划中" value="planned" />
                <el-option label="活跃" value="active" />
                <el-option label="已完成" value="done" />
                <el-option label="待复查" value="needs_review" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="标题"><el-input v-model="outlineForm.title" /></el-form-item>
          <el-form-item label="摘要"><el-input v-model="outlineForm.summary" type="textarea" :rows="2" resize="none" /></el-form-item>
          <el-form-item label="目标"><el-input v-model="outlineForm.goal" /></el-form-item>
          <el-form-item label="冲突"><el-input v-model="outlineForm.conflict" /></el-form-item>
          <el-form-item label="回报"><el-input v-model="outlineForm.payoff" /></el-form-item>
          <template v-if="outlineForm.kind === 'chapter'">
            <div class="form-grid">
              <el-form-item label="章节焦点"><el-input v-model="outlineForm.focus" placeholder="主角 / 配角 / 反派压力 / 群像 / 世界线" /></el-form-item>
              <el-form-item label="剧情线"><el-input v-model="outlineForm.plotLine" placeholder="主线 / 支线 / 反派线 / 关系线 / 世界线" /></el-form-item>
              <el-form-item label="本章功能"><el-input v-model="outlineForm.chapterFunction" placeholder="推进 / 转折 / 伏笔 / 回收 / 代价 / 爆点" /></el-form-item>
            </div>
            <el-form-item label="角色主动目标"><el-input v-model="outlineForm.actorGoal" /></el-form-item>
            <el-form-item label="阻力"><el-input v-model="outlineForm.obstacle" /></el-form-item>
            <el-form-item label="结果"><el-input v-model="outlineForm.outcome" /></el-form-item>
            <el-form-item label="对主线影响"><el-input v-model="outlineForm.mainlineImpact" type="textarea" :rows="2" resize="none" /></el-form-item>
          </template>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="outlineDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOutline">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="styleAssetDialogVisible" title="风格资产" width="680px" align-center class="nf-dialog">
      <div class="nf-dialog-body">
        <el-form label-position="top">
          <div class="form-grid">
            <el-form-item label="类型">
              <el-select v-model="styleAssetForm.kind">
                <el-option label="项目风格" value="project_style" />
                <el-option label="卷风格" value="volume_style" />
                <el-option label="场景模式" value="scene_mode" />
                <el-option label="角色语气" value="character_voice" />
                <el-option label="对白样本" value="dialogue_sample" />
                <el-option label="好段落" value="good_sample" />
                <el-option label="坏模式" value="bad_pattern" />
                <el-option label="禁止项" value="forbidden" />
              </el-select>
            </el-form-item>
            <el-form-item label="范围"><el-input v-model="styleAssetForm.scope" /></el-form-item>
          </div>
          <el-form-item label="标题"><el-input v-model="styleAssetForm.title" /></el-form-item>
          <el-form-item label="内容"><el-input v-model="styleAssetForm.body" type="textarea" :rows="4" resize="none" /></el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="styleAssetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStyleAsset">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  novelApi,
  type AiReviewDecision,
  type AiTask,
  type AiTaskPackage,
  type AiTaskStatus,
  type AiTaskTarget,
  type AuditReport,
  type CandidateFact,
  type CandidateFactStatus,
  type Chapter,
  type ChapterContextPack,
  type ChapterStatus,
  type ChapterVersion,
  type LocalCheckResult,
  type LongState,
  type McpContextMode,
  type McpWriteKind,
  type NovelProject,
  type OutlineNode,
  type ProjectDashboard,
  type ProjectOutline,
  type RewriteLevel,
  type RewriteMode,
  type RewriteScope,
  type StyleAsset,
  type StyleAssetKind,
  type StyleLibrary,
  type WorldFact,
  type CharacterProfile,
  type AiWorkbench,
  type McpResourcePreview,
  type AiPendingReview,
  type SnapshotRecord,
} from '@/api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadError = ref('')
const project = ref<NovelProject | null>(null)
const dashboard = ref<ProjectDashboard | null>(null)
const aiWorkbench = ref<AiWorkbench | null>(null)
const longState = ref<LongState | null>(null)
const chapters = ref<Chapter[]>([])
const worldFacts = ref<WorldFact[]>([])
const characters = ref<CharacterProfile[]>([])
const outline = ref<ProjectOutline | null>(null)
const styleLibrary = ref<StyleLibrary | null>(null)
const auditReports = ref<AuditReport[]>([])
const candidateFacts = ref<CandidateFact[]>([])
const localChecks = ref<LocalCheckResult[]>([])
const versions = ref<ChapterVersion[]>([])
const snapshots = ref<SnapshotRecord[]>([])
const exportText = ref('点击刷新预览后显示导出正文。')
const projectStateText = ref('')
const importStateText = ref('')
const contextPack = ref<ChapterContextPack | null>(null)

const selectedChapterId = ref('')
const editorMode = ref<'read' | 'edit'>('read')
const selectedVersionId = ref('')
const contextMode = ref<McpContextMode>('full')
const taskTargetFilter = ref<'all' | AiTaskTarget>('all')
const taskStatusFilter = ref<'all' | AiTaskStatus>('all')
const writeKindFilter = ref<'all' | McpWriteKind>('all')

const taskDialogVisible = ref(false)
const taskPackageDialogVisible = ref(false)
const rewriteDialogVisible = ref(false)
const versionDialogVisible = ref(false)
const contextDialogVisible = ref(false)
const localCheckDialogVisible = ref(false)
const outlineDialogVisible = ref(false)
const styleAssetDialogVisible = ref(false)
const stateExportDialogVisible = ref(false)
const stateImportDialogVisible = ref(false)
const pendingLocalCheck = ref<LocalCheckResult | null>(null)
const selectedTaskPackage = ref<AiTaskPackage | null>(null)

const projectId = computed(() => String(route.params.projectId ?? ''))
const moduleName = computed(() => String(route.name ?? '').replace('project-', ''))
const selectedChapter = computed(() => chapters.value.find((chapter) => chapter.id === selectedChapterId.value))
const aiTasks = computed(() => aiWorkbench.value?.tasks ?? [])
const aiResources = computed<McpResourcePreview[]>(() => aiWorkbench.value?.resourcePreviews ?? [])
const aiPendingReviews = computed<AiPendingReview[]>(() => aiWorkbench.value?.pendingReviews ?? [])
const aiWriteLogs = computed(() => aiWorkbench.value?.writeLogs ?? [])
const filteredAiTasks = computed(() =>
  aiTasks.value.filter(
    (task) =>
      (taskTargetFilter.value === 'all' || task.target === taskTargetFilter.value) &&
      (taskStatusFilter.value === 'all' || task.status === taskStatusFilter.value),
  ),
)
const filteredAiWriteLogs = computed(() => aiWriteLogs.value.filter((log) => writeKindFilter.value === 'all' || log.kind === writeKindFilter.value))
const outlineNodes = computed(() => outline.value?.nodes ?? [])
const outlineChapterNodes = computed(() => outlineNodes.value.filter((node) => node.kind === 'chapter'))
const activeOutlineNode = computed(() => outline.value?.activeChapterNode)
const currentDraftWordCount = computed(() => chapterForm.draft.replace(/\s/g, '').length)
const previewBody = computed(() => chapterForm.draft || selectedChapter.value?.draft || '')
const selectedVersion = computed(() => versions.value.find((version) => version.id === selectedVersionId.value))
const contextPackText = computed(() => JSON.stringify(contextPack.value, null, 2))
const taskPackageText = computed(() => JSON.stringify(selectedTaskPackage.value, null, 2))
const autoSettleCandidateCount = computed(() => candidateFacts.value.filter((fact) => fact.status === 'pending' && fact.risk !== 'high').length)
const openAuditCount = computed(() => auditReports.value.filter((report) => report.status === 'open').length)
const taskHandoffPrompt = computed(() => {
  const taskPackage = selectedTaskPackage.value
  if (!taskPackage) return ''
  const task = taskPackage.task
  const chapter = taskPackage.contextPack?.chapter
  return [
    '你现在通过 NovelForge MCP 控制一个本地小说项目。',
    `项目 ID：${taskPackage.projectId}`,
    `任务：${task.title}`,
    `目标：${targetLabel(task.target)}`,
    chapter ? `当前章：第 ${chapter.index} 章《${chapter.title}》` : '当前章：按任务包资源判断',
    `任务包 URI：${taskPackage.taskUri}`,
    `上下文预算：${contextModeLabel(task.contextMode)}；检查模式：${reviewModeLabel(task.reviewMode)}；候选事实策略：${task.factStrategy}`,
    '',
    '请先读取这些 MCP 资源：',
    ...taskPackage.expectedReadResources.map((resource, index) => `${index + 1}. ${resource.uri} - ${resource.title}`),
    '',
    '完成后只能通过 MCP 回填这些结果，不要直接覆盖 App 当前正文：',
    ...taskPackage.expectedWriteBack.map((target, index) => `${index + 1}. ${writeKindLabel(target.kind)} / ${target.title} / ${target.required ? '必须' : '可选'} - ${target.description}`),
    '',
    '执行规则：',
    '- 小说正文、下 10 章、下 100 章、风格提取和重写都由当前 Codex 会话完成。',
    '- App 端只是被动状态台，不接 AI API；回填候选版本后由用户在版本对比中定版。',
    '- 涉及世界事实、角色状态、压力值、破声点、剧情债务或风格禁用项时，同步回填对应状态或候选确认。',
    '- 高风险改动必须创建快照或留下审稿/确认记录。',
    '',
    '任务说明：',
    task.instruction,
    '',
    '任务备注：',
    ...taskPackage.notes.map((note) => `- ${note}`),
    ...taskPackage.mcpHints.map((hint) => `- ${hint}`),
  ].join('\n')
})
const contextHandoffPrompt = computed(() => {
  if (!contextPack.value || !selectedChapter.value) return ''
  return [
    '你现在通过 NovelForge MCP 读取当前章上下文。',
    `项目：${project.value?.title ?? projectId.value}`,
    `项目 ID：${projectId.value}`,
    `当前章：第 ${selectedChapter.value.index} 章《${selectedChapter.value.title}》`,
    `上下文模式：${contextModeLabel(contextMode.value)}`,
    '',
    '请基于 Context Pack 进行创作、重写、风格提取或问题处理。',
    '不要直接覆盖当前正文；请通过 MCP 回填候选版本、候选事实、长篇状态、风格资产或审稿记录。',
    '如触发死亡、失忆、突破、暴露身份、破声点、压力值变化、剧情债务兑现等高影响事项，请同步回填状态或标记待确认。',
  ].join('\n')
})
const overviewMetrics = computed(() => [
  { label: '章节', value: dashboard.value?.stats.chapters ?? 0, note: '正文主线记录' },
  { label: '世界事实', value: dashboard.value?.stats.worldFacts ?? 0, note: '辅助上下文' },
  { label: '角色', value: dashboard.value?.stats.characters ?? 0, note: '语气与行动依据' },
  { label: '候选事实', value: dashboard.value?.stats.pendingFacts ?? 0, note: '待沉淀上下文' },
  { label: '剧情债务', value: dashboard.value?.stats.plotDebts ?? 0, note: '需后续回应' },
  { label: '压力提醒', value: dashboard.value?.stats.pressureAlerts ?? 0, note: '破声点风险' },
])

const contextModes = [
  { label: '省 Token', value: 'lite' as const },
  { label: '平衡', value: 'full' as const },
  { label: '深度', value: 'deep' as const },
]

const targetOptions = [
  { label: '下一章', value: 'next_chapter' as const },
  { label: '下 10 章', value: 'next_10_chapters' as const },
  { label: '下 50 章', value: 'next_50_chapters' as const },
  { label: '下 100 章', value: 'next_100_chapters' as const },
  { label: '章节重写', value: 'rewrite_chapter' as const },
  { label: '风格调整', value: 'style_adjustment' as const },
  { label: '风格提取', value: 'style_extract' as const },
  { label: '风格处理', value: 'style_process' as const },
]

const contextTaskTemplates = [
  {
    title: '下一章正文',
    target: 'next_chapter' as const,
    contextMode: 'full' as const,
    reviewMode: 'token_saver' as const,
    factStrategy: 'balanced' as const,
    checkpointEvery: 1,
    description: '读取当前章上下文、章节功能、大纲和长篇状态，回填一个候选正文版本。',
    reads: ['当前章', '章节功能', '角色状态', '世界事实', '风格资产'],
    writes: ['章节候选版本', '候选事实', '本地检查'],
    instruction: '读取当前项目 Context Pack，生成下一章候选正文；不要直接覆盖定稿，必须通过 MCP 回填候选版本。',
  },
  {
    title: '下 10 章路线',
    target: 'next_10_chapters' as const,
    contextMode: 'full' as const,
    reviewMode: 'balanced' as const,
    factStrategy: 'balanced' as const,
    checkpointEvery: 2,
    description: '为短批次推进准备章节路线、破声点、压力值变化和回填检查点。',
    reads: ['大纲', '故事线', '压力值', '伏笔', '剧情债务'],
    writes: ['批次路线图', '待确认节点', '快照'],
    instruction: '规划下 10 章路线，标记每章功能、压力变化、破声点和必须回填的高影响确认项。',
  },
  {
    title: '下 100 章长线',
    target: 'next_100_chapters' as const,
    contextMode: 'deep' as const,
    reviewMode: 'strict' as const,
    factStrategy: 'conservative' as const,
    checkpointEvery: 10,
    description: '面向长篇结构的远期规划，重点维护卷目标、主线回报、代价和大风险。',
    reads: ['全书大纲', '长篇状态', '世界事实', '角色关系', '风格库'],
    writes: ['长线规划', '剧情债务', '快照'],
    instruction: '规划下 100 章长线结构，只输出路线、检查点和风险，不直接写正文；高风险改动必须回填待确认项。',
  },
  {
    title: '章节重写',
    target: 'rewrite_chapter' as const,
    contextMode: 'full' as const,
    reviewMode: 'strict' as const,
    factStrategy: 'conservative' as const,
    checkpointEvery: 1,
    description: '先填写重写范围、模式和影响等级，再生成 Codex 可读重写任务包。',
    reads: ['当前正文', '版本池', '重写条件', '本地检查', '风格约束'],
    writes: ['重写候选版本', '候选事实', '审稿报告'],
    instruction: '根据重写条件处理当前章，只回填候选版本，不直接覆盖当前正文。',
  },
  {
    title: '风格提取',
    target: 'style_extract' as const,
    contextMode: 'full' as const,
    reviewMode: 'token_saver' as const,
    factStrategy: 'balanced' as const,
    checkpointEvery: 1,
    description: '从正文和上下文中提炼可复用的好段落、对白语气和场景表达样本。',
    reads: ['正文', '风格资产', '角色语气', '上下文'],
    writes: ['风格资产', '对白样本'],
    instruction: '提取当前章可复用风格样本，按好段落、对白语气、场景模式分类回填风格资产。',
  },
  {
    title: '风格处理',
    target: 'style_process' as const,
    contextMode: 'deep' as const,
    reviewMode: 'balanced' as const,
    factStrategy: 'balanced' as const,
    checkpointEvery: 1,
    description: '整理坏模式、禁止项和需要修正的风格约束，供后续写作避坑。',
    reads: ['正文', '审稿问题', '风格资产', '角色语气'],
    writes: ['坏模式', '禁止项', '风格约束'],
    instruction: '处理当前章风格问题，回填坏模式、禁止项和需要修正的风格约束。',
  },
]

const chapterForm = reactive({
  title: '',
  status: 'queued' as ChapterStatus,
  intention: '',
  summary: '',
  draft: '',
})

const taskForm = reactive({
  title: '等待 Codex 处理下一轮',
  target: 'next_chapter' as AiTaskTarget,
  contextMode: 'full' as McpContextMode,
  reviewMode: 'token_saver' as const,
  factStrategy: 'balanced' as const,
  checkpointEvery: 1,
  autoPause: 'high_risk' as const,
  instruction: '读取当前项目 Context Pack，保持时间、消息和知识边界，不直接修改权威事实。',
})

const rewriteForm = reactive({
  scope: 'paragraph' as RewriteScope,
  reason: '只调整语气和节奏，不改变剧情事实。',
  mode: 'style_voice' as RewriteMode,
  level: 'L1' as RewriteLevel,
})

const outlineForm = reactive({
  id: '',
  kind: 'chapter' as OutlineNode['kind'],
  title: '',
  summary: '',
  goal: '',
  conflict: '',
  payoff: '',
  focus: '',
  plotLine: '',
  chapterFunction: '',
  actorGoal: '',
  obstacle: '',
  outcome: '',
  mainlineImpact: '',
  status: 'planned' as OutlineNode['status'],
  chapterId: '',
  chapterIndex: 1,
  parentId: '',
  order: 100,
})

const styleAssetForm = reactive({
  id: '',
  profileId: '',
  kind: 'project_style' as StyleAssetKind,
  title: '',
  body: '',
  scope: '全书',
  source: 'user' as const,
  enabled: true,
})

const applyChapterToForm = (chapter?: Chapter) => {
  if (!chapter) return
  chapterForm.title = chapter.title
  chapterForm.status = chapter.status
  chapterForm.intention = chapter.intention
  chapterForm.summary = chapter.summary
  chapterForm.draft = chapter.draft
}

const loadVersions = async () => {
  if (!selectedChapterId.value) {
    versions.value = []
    return
  }
  versions.value = await novelApi.listChapterVersions(projectId.value, selectedChapterId.value)
  selectedVersionId.value = versions.value[0]?.id ?? ''
}

const loadContextPack = async () => {
  if (!selectedChapterId.value) return
  contextPack.value = await novelApi.getChapterContextPack(projectId.value, selectedChapterId.value, contextMode.value)
}

const loadAll = async () => {
  if (!projectId.value) return
  loading.value = true
  loadError.value = ''
  try {
    const [
      projects,
      nextDashboard,
      nextWorkbench,
      nextWorldFacts,
      nextCharacters,
      nextChapters,
      nextAudits,
      nextStyle,
      nextChecks,
      nextOutline,
      nextLongState,
      nextSnapshots,
    ] = await Promise.all([
      novelApi.listProjects(),
      novelApi.getProjectDashboard(projectId.value),
      novelApi.getAiWorkbench(projectId.value),
      novelApi.listWorldFacts(projectId.value),
      novelApi.listCharacters(projectId.value),
      novelApi.listChapters(projectId.value),
      novelApi.listAuditReports(projectId.value),
      novelApi.listStyleProfiles(projectId.value),
      novelApi.listLocalCheckResults(projectId.value),
      novelApi.listProjectOutline(projectId.value, selectedChapterId.value),
      novelApi.getLongState(projectId.value),
      novelApi.listSnapshots(projectId.value),
    ])
    project.value = projects.find((item) => item.id === projectId.value) ?? null
    dashboard.value = nextDashboard
    aiWorkbench.value = nextWorkbench
    worldFacts.value = nextWorldFacts
    characters.value = nextCharacters
    chapters.value = nextChapters
    auditReports.value = nextAudits
    styleLibrary.value = nextStyle
    localChecks.value = nextChecks
    outline.value = nextOutline
    longState.value = nextLongState
    snapshots.value = nextSnapshots
    candidateFacts.value = nextDashboard.pendingFacts
    if (!selectedChapterId.value || !nextChapters.some((chapter) => chapter.id === selectedChapterId.value)) {
      selectedChapterId.value = nextChapters[0]?.id ?? ''
    }
    applyChapterToForm(nextChapters.find((chapter) => chapter.id === selectedChapterId.value))
    await Promise.all([loadVersions(), loadContextPack()])
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '加载项目失败'
  } finally {
    loading.value = false
  }
}

const selectChapter = async (chapterId: string) => {
  selectedChapterId.value = chapterId
  applyChapterToForm(selectedChapter.value)
  outline.value = await novelApi.listProjectOutline(projectId.value, chapterId)
  await Promise.all([loadVersions(), loadContextPack()])
}

const setContextMode = async (mode: McpContextMode) => {
  contextMode.value = mode
  await loadContextPack()
}

const openTaskDialog = () => {
  taskDialogVisible.value = true
}

const openStyleCodexTask = (target: Extract<AiTaskTarget, 'style_extract' | 'style_process'>) => {
  const chapterText = selectedChapter.value ? `第 ${selectedChapter.value.index} 章` : '当前项目'
  Object.assign(taskForm, {
    title: target === 'style_extract' ? `Codex 提取${chapterText}风格` : `Codex 处理${chapterText}风格约束`,
    target,
    contextMode: target === 'style_extract' ? 'full' : 'deep',
    reviewMode: target === 'style_extract' ? 'token_saver' : 'balanced',
    factStrategy: 'balanced',
    checkpointEvery: 1,
    autoPause: 'high_risk',
    instruction:
      target === 'style_extract'
        ? `读取 ${chapterText} 正文、上下文和已有风格资产，提取可复用的好段落样本、句式节奏、对白语气，并通过 MCP 回填为风格资产。`
        : `读取 ${chapterText} 正文、上下文和已有风格资产，整理坏模式、禁止项和需要修正的风格约束，并通过 MCP 回填到 App。`,
  })
  taskDialogVisible.value = true
}

const createTaskFromTemplate = (target: AiTaskTarget) => {
  if (target === 'rewrite_chapter') {
    openRewriteDialog()
    return
  }
  const template = contextTaskTemplates.find((item) => item.target === target)
  if (!template) return
  Object.assign(taskForm, {
    title: template.title,
    target: template.target,
    contextMode: template.contextMode,
    reviewMode: template.reviewMode,
    factStrategy: template.factStrategy,
    checkpointEvery: template.checkpointEvery,
    autoPause: target === 'next_100_chapters' ? 'checkpoint' : 'high_risk',
    instruction: template.instruction,
  })
  taskDialogVisible.value = true
}

const createAiTask = async () => {
  await novelApi.createAiTask(projectId.value, {
    ...taskForm,
    chapterId: selectedChapterId.value || undefined,
  })
  taskDialogVisible.value = false
  ElMessage.success('Codex 可处理任务已记录')
  await loadAll()
}

const openTaskPackage = async (taskId: string) => {
  selectedTaskPackage.value = await novelApi.getAiTaskPackage(projectId.value, taskId)
  taskPackageDialogVisible.value = true
}

const copyText = async (text: string, label: string) => {
  if (!text.trim()) {
    ElMessage.warning(`${label} 为空`)
    return
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success(`${label} 已复制`)
  } catch {
    ElMessage.error(`${label} 复制失败`)
  }
}

const completeAiTask = async (taskId: string) => {
  await novelApi.completeAiTask(projectId.value, taskId)
  ElMessage.success('已记录外部回写完成')
  await loadAll()
}

const resolveReview = async (reviewId: string, decision: AiReviewDecision) => {
  await novelApi.resolveAiPendingReview(projectId.value, reviewId, decision)
  ElMessage.success('确认项已处理')
  await loadAll()
}

const saveChapterDraft = async () => {
  if (!selectedChapter.value) return
  const check = await novelApi.runLocalChapterCheck(projectId.value, selectedChapter.value.id, {
    draft: chapterForm.draft,
  })
  pendingLocalCheck.value = check
  if (check.requiresConfirmation) {
    localCheckDialogVisible.value = true
    await loadAll()
    return
  }
  await forceSaveDraft()
}

const forceSaveDraft = async () => {
  if (!selectedChapter.value) return
  await novelApi.saveDraft(projectId.value, selectedChapter.value.id, { ...chapterForm })
  localCheckDialogVisible.value = false
  ElMessage.success('正文已保存，本地索引已标记为待重建')
  await loadAll()
}

const openRewriteDialog = () => {
  rewriteDialogVisible.value = true
}

const createRewrite = async () => {
  if (!selectedChapter.value) return
  await novelApi.createRewriteTask(projectId.value, selectedChapter.value.id, { ...rewriteForm })
  rewriteDialogVisible.value = false
  ElMessage.success('重写条件已提交为 Codex 待处理任务')
  await loadAll()
}

const openVersionDialog = async () => {
  await loadVersions()
  versionDialogVisible.value = true
}

const applySelectedVersion = async () => {
  if (!selectedChapter.value || !selectedVersion.value) return
  await novelApi.applyChapterVersion(projectId.value, selectedChapter.value.id, selectedVersion.value.id)
  ElMessage.success('版本已应用并创建快照')
  versionDialogVisible.value = false
  await loadAll()
}

const openContextDialog = async () => {
  await loadContextPack()
  contextDialogVisible.value = true
}

const openOutlineDialog = (node?: OutlineNode) => {
  Object.assign(outlineForm, {
    id: node?.id ?? '',
    kind: node?.kind ?? 'chapter',
    title: node?.title ?? '',
    summary: node?.summary ?? '',
    goal: node?.goal ?? '',
    conflict: node?.conflict ?? '',
    payoff: node?.payoff ?? '',
    focus: node?.focus ?? '',
    plotLine: node?.plotLine ?? '',
    chapterFunction: node?.chapterFunction ?? '',
    actorGoal: node?.actorGoal ?? '',
    obstacle: node?.obstacle ?? '',
    outcome: node?.outcome ?? '',
    mainlineImpact: node?.mainlineImpact ?? '',
    status: node?.status ?? 'planned',
    chapterId: node?.chapterId ?? selectedChapterId.value,
    chapterIndex: node?.chapterIndex ?? selectedChapter.value?.index ?? 1,
    parentId: node?.parentId ?? '',
    order: node?.order ?? (outlineNodes.value.length + 1) * 10,
  })
  outlineDialogVisible.value = true
}

const saveOutline = async () => {
  const isChapter = outlineForm.kind === 'chapter'
  await novelApi.saveOutlineNode(projectId.value, {
    ...outlineForm,
    id: outlineForm.id || undefined,
    chapterId: isChapter ? outlineForm.chapterId : undefined,
    chapterIndex: isChapter ? outlineForm.chapterIndex : undefined,
    focus: isChapter ? outlineForm.focus : undefined,
    plotLine: isChapter ? outlineForm.plotLine : undefined,
    chapterFunction: isChapter ? outlineForm.chapterFunction : undefined,
    actorGoal: isChapter ? outlineForm.actorGoal : undefined,
    obstacle: isChapter ? outlineForm.obstacle : undefined,
    outcome: isChapter ? outlineForm.outcome : undefined,
    mainlineImpact: isChapter ? outlineForm.mainlineImpact : undefined,
    parentId: outlineForm.parentId || undefined,
  })
  outlineDialogVisible.value = false
  ElMessage.success('大纲已保存')
  await loadAll()
}

const deleteOutline = async (nodeId: string) => {
  await ElMessageBox.confirm('删除后大纲节点会移除。', '删除大纲节点', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await novelApi.deleteOutlineNode(projectId.value, nodeId)
  await loadAll()
}

const openStyleAssetDialog = (asset?: StyleAsset) => {
  Object.assign(styleAssetForm, {
    id: asset?.id ?? '',
    profileId: asset?.profileId ?? styleLibrary.value?.activeProfileId ?? '',
    kind: asset?.kind ?? 'project_style',
    title: asset?.title ?? '',
    body: asset?.body ?? '',
    scope: asset?.scope ?? '全书',
    source: asset?.source ?? 'user',
    enabled: asset?.enabled ?? true,
  })
  styleAssetDialogVisible.value = true
}

const saveStyleAsset = async () => {
  await novelApi.saveStyleAsset(projectId.value, {
    ...styleAssetForm,
    id: styleAssetForm.id || undefined,
    profileId: styleAssetForm.profileId || undefined,
  })
  styleAssetDialogVisible.value = false
  ElMessage.success('风格资产已保存')
  await loadAll()
}

const toggleStyleAsset = async (asset: StyleAsset) => {
  await novelApi.saveStyleAsset(projectId.value, { ...asset, enabled: !asset.enabled })
  await loadAll()
}

const deleteStyleAsset = async (assetId: string) => {
  await novelApi.deleteStyleAsset(projectId.value, assetId)
  await loadAll()
}

const bindStyle = async (profileId: string) => {
  await novelApi.bindProjectStyle(projectId.value, profileId)
  ElMessage.success('项目风格已启用')
  await loadAll()
}

const confirmFact = async (factId: string, status: Exclude<CandidateFactStatus, 'pending'>) => {
  await novelApi.confirmCandidateFact(projectId.value, factId, status)
  await loadAll()
}

const settleLowRiskFacts = async () => {
  const settled = await novelApi.settleCandidateFacts(projectId.value, { risks: ['low', 'medium'], decision: 'confirmed' })
  ElMessage.success(settled.length ? `已沉淀 ${settled.length} 条低中风险候选事实` : '没有可自动沉淀的候选事实')
  await loadAll()
}

const resolveAudit = async (reportId: string) => {
  await novelApi.resolveAuditReport(projectId.value, reportId)
  ElMessage.success('审稿报告已标记解决')
  await loadAll()
}

const resolveOpenAudits = async () => {
  const resolved = await novelApi.resolveOpenAuditReports(projectId.value)
  ElMessage.success(resolved.length ? `已解决 ${resolved.length} 条审稿报告` : '没有待解决审稿报告')
  await loadAll()
}

const loadExportText = async () => {
  exportText.value = await novelApi.exportProjectText(projectId.value)
}

const recordPressureSignal = async () => {
  const character = characters.value[0]
  if (!character) return
  await novelApi.saveLongStateRecord(projectId.value, 'pressure', {
    characterId: character.id,
    emotion: '压迫 / 失控边缘',
    value: Math.min(100, character.pressure + 18),
    threshold: 82,
    source: '外部 AI 回填：当前批次推进后，角色压力接近破声点。',
    breakpoint: '如果下一章继续逼迫，需要给出明确代价或余震。',
    aftermath: '后续对白应更短，行动更急，不能像无事发生。',
    status: character.pressure + 18 >= 82 ? 'breakpoint' : 'rising',
  })
  ElMessage.success('压力变化已记录')
  await loadAll()
}

const recordPlotDebt = async () => {
  await novelApi.saveLongStateRecord(projectId.value, 'debt', {
    title: 'Codex 批次回填：本轮承诺需要兑现',
    kind: 'promise',
    severity: 'this_batch',
    window: selectedChapter.value ? `第 ${selectedChapter.value.index + 1}-${selectedChapter.value.index + 3} 章` : '后续 3 章',
    body: '当前回填路线留下了读者承诺，需要在后续章节通过行动后果、关系裂痕或信息反转兑现。',
  })
  ElMessage.success('剧情债务已记录')
  await loadAll()
}

const createManualSnapshot = async () => {
  await novelApi.createSnapshot(projectId.value, {
    chapterId: selectedChapterId.value || undefined,
    title: '手动项目快照',
    reason: '记录当前本地项目状态，供外部 AI 回填、版本定版或人工调整前后对比。',
  })
  ElMessage.success('快照已创建')
  await loadAll()
}

const restoreSnapshot = async (snapshotId: string) => {
  await ElMessageBox.confirm('恢复快照会覆盖当前本地项目状态，确认继续？', '恢复快照', {
    type: 'warning',
    confirmButtonText: '恢复',
    cancelButtonText: '取消',
  })
  await novelApi.restoreSnapshot(projectId.value, snapshotId)
  ElMessage.success('快照已恢复')
  await loadAll()
}

const openStateExport = async () => {
  projectStateText.value = await novelApi.exportProjectState(projectId.value)
  stateExportDialogVisible.value = true
}

const openStateImport = () => {
  importStateText.value = ''
  stateImportDialogVisible.value = true
}

const importProjectState = async () => {
  await novelApi.importProjectState(importStateText.value)
  stateImportDialogVisible.value = false
  ElMessage.success('项目状态已导入')
  await loadAll()
}

const createChapter = async () => {
  const chapter = await novelApi.createChapter(projectId.value)
  selectedChapterId.value = chapter.id
  ElMessage.success('章节已创建')
  await loadAll()
}

const handleModuleAction = (event: Event) => {
  const detail = (event as CustomEvent<{ action: string; projectId: string }>).detail
  if (!detail || detail.projectId !== projectId.value) return
  if (detail.action === 'refresh') loadAll()
  if (detail.action === 'create-ai-task') openTaskDialog()
  if (detail.action === 'create-chapter') createChapter()
  if (detail.action === 'create-outline-node') openOutlineDialog()
  if (detail.action === 'create-style-asset') openStyleAssetDialog()
}

const targetLabel = (value: AiTaskTarget) =>
  ({
    next_chapter: '下一章',
    next_10_chapters: '下 10 章',
    next_50_chapters: '下 50 章',
    next_100_chapters: '下 100 章',
    rewrite_chapter: '章节重写',
    style_adjustment: '风格调整',
    style_extract: '风格提取',
    style_process: '风格处理',
  })[value]
const contextModeLabel = (value: McpContextMode) => ({ lite: '省 Token', full: '平衡', deep: '深度' })[value]
const reviewModeLabel = (value: string) => ({ token_saver: '省 Token', balanced: '平衡', strict: '严格', fast: '快速', standard: '标准' })[value] ?? value
const aiTaskStatusLabel = (value: string) => ({ queued: '排队', context_ready: '上下文就绪', waiting_for_ai: '等待 AI', completed: '已回写', needs_review: '需确认' })[value] ?? value
const writeKindLabel = (value: string) =>
  ({
    ai_task: 'AI 任务',
    chapter_version: '章节版本',
    chapter_final: '章节定版',
    rewrite: '章节重写',
    outline: '大纲',
    world_fact: '世界事实',
    character: '角色',
    style: '风格',
    snapshot: '快照',
  })[value] ?? value
const localIssueCategoryLabel = (value: string) =>
  ({
    project_scope: '项目归属',
    word_count: '字数变化',
    chapter_boundary: '章首章尾',
    locked_fact: '锁定事实',
    new_entity: '新增实体',
    risk_keyword: '高风险词',
    pressure_curve: '压力曲线',
    breakpoint: '破声点',
    plot_debt: '剧情债务',
    character_state: '角色状态',
    index_dirty: '索引',
  })[value] ?? value
const chapterStatusLabel = (value: ChapterStatus) =>
  ({
    queued: '待规划',
    planned: '已规划',
    context_ready: '上下文就绪',
    planning: '规划中',
    ready_to_generate: '待 Codex',
    generating: 'Codex 处理中',
    draft_saved: '草稿已保存',
    draft_complete_signal_received: '候选已回写',
    postcheck_running: '后审中',
    facts_extracted: '事实已抽取',
    waiting_fact_confirmation: '待确认事实',
    committed: '已定版',
    paused: '暂停',
    failed: '失败',
  })[value]
const versionStatusLabel = (value: string) => ({ candidate: '候选', applied: '已应用', archived: '已归档' })[value] ?? value
const outlineKindLabel = (value: string) => ({ book: '全书', volume: '卷', arc: '故事线', chapter: '章节' })[value] ?? value
const outlineStatusLabel = (value: string) => ({ planned: '计划中', active: '活跃', done: '已完成', needs_review: '待复查' })[value] ?? value
const resourceKindLabel = (value: string) =>
  ({
    project: '项目状态',
    chapter: '章节正文',
    outline: '大纲故事线',
    ledger: '长篇状态',
    style: '风格资产',
    world: '世界事实',
    character: '角色关系',
    version: '回填记录',
  })[value] ?? value
const resourceAccessLabel = (value: string) =>
  ({
    project: '基础',
    chapter: '正文',
    outline: '大纲',
    ledger: '状态',
    style: '风格',
    world: '事实',
    character: '角色',
    version: '回填',
  })[value] ?? '资源'
const outlineContractSummary = (node?: OutlineNode) =>
  [
    node?.focus ? `焦点：${node.focus}` : '',
    node?.plotLine ? `剧情线：${node.plotLine}` : '',
    node?.chapterFunction ? `功能：${node.chapterFunction}` : '',
  ]
    .filter(Boolean)
    .join('；')
const styleAssetKindLabel = (value: string) =>
  ({
    project_style: '项目风格',
    volume_style: '卷风格',
    scene_mode: '场景模式',
    character_voice: '角色语气',
    dialogue_sample: '对白样本',
    good_sample: '好段落',
    bad_pattern: '坏模式',
    forbidden: '禁止项',
  })[value] ?? value
const riskLabel = (value: string) => ({ low: '低风险', medium: '中风险', high: '高风险' })[value] ?? value
const severityLabel = (value: string) => ({ info: '提示', warning: '警告', danger: '危险', low: '低风险', medium: '中风险', high: '高风险' })[value] ?? value
const candidateStatusLabel = (value: string) => ({ pending: '待处理', confirmed: '已沉淀', rejected: '已忽略' })[value] ?? value
const debtSeverityLabel = (value: string) =>
  ({ normal: '正常', notice: '注意', high: '高风险', danger: '危险', this_batch: '本批次处理' })[value] ?? value
const characterName = (characterId: string) => characters.value.find((item) => item.id === characterId)?.name ?? characterId

watch(projectId, loadAll)
watch(selectedChapterId, (chapterId) => {
  applyChapterToForm(chapters.value.find((chapter) => chapter.id === chapterId))
})

onMounted(() => {
  window.addEventListener('novel-forge:module-action', handleModuleAction)
  loadAll()
})

onUnmounted(() => {
  window.removeEventListener('novel-forge:module-action', handleModuleAction)
})
</script>

<style lang="scss" scoped>
.project-module {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface-raised) 92%, transparent);
  box-shadow: var(--sh-card);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--bd-line);
  background: color-mix(in srgb, var(--surface-field) 76%, transparent);

  h3,
  span {
    margin: 0;
  }

  h3 {
    color: var(--t1);
    font-size: 14px;
    font-weight: 900;
  }
}

.module-grid {
  display: grid;
  flex: 1 1 auto;
  min-height: 0;
  gap: 8px;
  overflow: hidden;
}

.module-grid > .panel {
  display: flex;
  flex-direction: column;
}

.mcp-grid {
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  grid-template-rows: minmax(96px, auto) minmax(210px, 1fr) minmax(170px, 0.78fr) minmax(140px, 0.62fr);
  overflow: auto;
}

.two-col,
.context-grid,
.audit-grid,
.overview-grid {
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.72fr);
}

.wide-panel,
.state-section.wide {
  grid-column: 1 / -1;
}

.status-hero {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  min-height: 96px;
  padding: 14px 16px;
}

.hero-copy {
  min-width: 0;

  h2,
  p {
    margin: 0;
  }

  h2 {
    margin-top: 4px;
    color: var(--t1);
    font-size: 20px;
    font-weight: 900;
  }

  p {
    margin-top: 7px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.eyebrow {
  color: var(--brand-copper);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-metrics,
.metric-panel,
.status-stack {
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--bd-line);
}

.hero-metrics {
  grid-template-columns: repeat(4, 96px);

  div {
    padding: 9px 10px;
    background: var(--paper-surface);
  }
}

.hero-metrics span,
.metric-cell span,
.status-stack span {
  display: block;
  color: var(--t5);
  font-size: 10px;
  font-weight: 800;
}

.hero-metrics strong,
.metric-cell strong,
.status-stack strong {
  display: block;
  margin-top: 5px;
  color: var(--t1);
  font-size: 20px;
  font-weight: 900;
}

.row-list,
.scroll-area {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}

.ledger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 66px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--bd-line);

  &:last-child {
    border-bottom: 0;
  }

  &.compact {
    min-height: 54px;
  }

  &.tall {
    align-items: flex-start;
    min-height: 88px;
  }
}

.row-main {
  min-width: 0;

  strong,
  p,
  small,
  code {
    display: block;
    margin: 0;
  }

  strong {
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  p,
  small,
  code {
    margin-top: 5px;
    overflow-wrap: anywhere;
    color: var(--t5);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  }
}

.issue-line {
  color: var(--brand-copper) !important;
}

.row-actions,
.head-action-group,
.inline-controls,
.writer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--bd-line);
  background: color-mix(in srgb, var(--surface-field) 58%, transparent);
}

.kind-filter {
  width: 150px;
}

.text-action {
  border: 0;
  color: var(--brand-moss);
  background: transparent;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  &.danger {
    color: var(--status-danger);
  }
}

.hint,
.plain-mark,
.text-status,
.risk-text {
  color: var(--t5);
  font-size: 11px;
  font-weight: 800;
}

.risk-high,
.risk-danger {
  color: var(--status-danger);
}

.risk-medium,
.risk-warning {
  color: var(--brand-amber);
}

.manuscript-layout {
  display: grid;
  grid-template-columns: 218px minmax(0, 1fr);
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.chapter-rail {
  display: flex;
  flex-direction: column;
}

.chapter-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.chapter-row {
  display: grid;
  width: 100%;
  gap: 4px;
  padding: 12px;
  border: 0;
  border-bottom: 1px solid var(--bd-line);
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover,
  &.active {
    background: var(--glass-active-bg);
    box-shadow: inset 2px 0 0 var(--brand-moss);
  }

  strong,
  span,
  em {
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

  span,
  em {
    color: var(--t5);
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
  }
}

.writer-stage {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.writer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 54px;
  padding: 9px 12px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--surface-raised);
  box-shadow: var(--sh-edge);

  h2,
  span {
    margin: 0;
  }

  h2 {
    color: var(--t1);
    font-size: 16px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }
}

.segmented {
  display: inline-flex;
  gap: 3px;
  height: 30px;
  padding: 3px;
  border: 1px solid var(--bd-line);
  border-radius: var(--button-radius);
  background: var(--surface-field);

  button {
    height: 22px;
    padding: 0 10px;
    border: 0;
    border-radius: var(--button-radius);
    color: var(--t4);
    background: transparent;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;

    &.active {
      color: var(--on-brand);
      background: var(--brand-moss);
    }
  }
}

.contract-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  margin-top: 8px;
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--bd-line);

  div {
    min-width: 0;
    padding: 8px 10px;
    background: color-mix(in srgb, var(--surface-field) 82%, transparent);
  }

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--t5);
    font-size: 10px;
    font-weight: 900;
  }

  strong {
    margin-top: 4px;
    color: var(--t3);
    font-size: 12px;
    font-weight: 800;
  }
}

.paper-editor {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 8px;
}

.draft-input {
  flex: 1 1 auto;

  :deep(.el-textarea__inner) {
    height: 100%;
    min-height: 100% !important;
    padding: 20px 22px;
    border-color: var(--bd-line);
    border-radius: 8px;
    color: var(--t2);
    background: var(--paper-surface);
    box-shadow: var(--sh-card);
    font-size: 14px;
    line-height: 1.9;
    resize: none;
  }
}

.reader-surface {
  flex: 1 1 auto;
  min-height: 0;
  padding: 22px;
  overflow: auto;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  color: var(--t2);
  background: var(--paper-surface);
  box-shadow: var(--sh-card);
  white-space: pre-wrap;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.95;
  }
}

.empty-copy {
  color: var(--t5);
}

.context-sections {
  padding: 12px;

  section {
    padding: 10px 0;
    border-bottom: 1px solid var(--bd-line);

    &:last-child {
      border-bottom: 0;
    }
  }

  h4,
  p,
  small {
    margin: 0;
  }

  h4 {
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  p,
  small {
    display: block;
    margin-top: 6px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.priority-list {
  margin: 0;
  padding: 14px 18px 14px 34px;
  color: var(--t3);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.7;
}

.task-template-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
  overflow: auto;
}

.task-template {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--paper-surface);

  strong,
  p,
  small,
  span {
    display: block;
    margin: 0;
  }

  strong {
    margin-top: 4px;
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  p,
  small {
    margin-top: 5px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
  }
}

.long-state {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(190px, 0.78fr) minmax(0, 1.22fr);
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.state-section {
  display: flex;
  flex-direction: column;
}

.split-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-height: 0;
  overflow: auto;
}

.pressure-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 0.3fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--bd-line);

  strong,
  p,
  small {
    display: block;
    margin: 0;
  }

  p,
  small {
    margin-top: 5px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
  }
}

.pressure-meter {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-sunken);

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--brand-moss), var(--brand-amber), var(--status-danger));
  }
}

.ledger-columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  min-height: 0;
  overflow: auto;

  > div {
    min-width: 0;
    border-right: 1px solid var(--bd-line);

    &:last-child {
      border-right: 0;
    }
  }

  h4 {
    margin: 0;
    padding: 10px 12px;
    border-bottom: 1px solid var(--bd-line);
    color: var(--t2);
    font-size: 12px;
    font-weight: 900;
    background: var(--surface-field);
  }

  article {
    padding: 10px 12px;
    border-bottom: 1px solid var(--bd-line);
  }

  strong,
  p,
  small {
    display: block;
    margin: 0;
  }

  p,
  small {
    margin-top: 5px;
    color: var(--t5);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
  }
}

.dialogue-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;

  article {
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: var(--paper-surface);
  }

  strong,
  p,
  ul,
  small {
    margin: 0;
  }

  p,
  small,
  li {
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }

  ul {
    margin-top: 8px;
    padding-left: 18px;
  }
}

.metric-panel {
  grid-column: 1 / -1;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.metric-cell,
.status-stack div {
  padding: 10px 12px;
  background: var(--surface-raised);
}

.metric-cell p {
  margin: 4px 0 0;
  color: var(--t5);
  font-size: 11px;
  font-weight: 700;
}

.export-preview,
.context-json {
  min-height: 0;
  height: 100%;
  margin: 0;
  padding: 14px;
  overflow: auto;
  color: var(--t2);
  background: var(--paper-surface);
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.dialog-note {
  margin: 0 0 12px;
  padding: 10px 12px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  color: var(--t5);
  background: var(--surface-field);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
}

.task-package-body {
  display: grid;
  gap: 8px;
}

.task-package-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--surface-field);

  div {
    min-width: 0;
    padding: 9px 12px;
    border-right: 1px solid var(--bd-line);

    &:last-child {
      border-right: 0;
    }
  }

  span {
    display: block;
    color: var(--t5);
    font-size: 11px;
    font-weight: 800;
  }

  strong {
    display: block;
    overflow: hidden;
    margin-top: 4px;
    color: var(--t1);
    font-size: 13px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.writeback-targets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;

  article {
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: var(--surface-raised);
  }

  strong {
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  p {
    margin: 6px 0;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.55;
  }

  span {
    color: var(--brand-moss);
    font-size: 11px;
    font-weight: 900;

    &.optional {
      color: var(--brand-copper);
    }
  }
}

.version-dialog-body {
  overflow: hidden !important;
}

.version-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 10px;
  height: min(68vh, 640px);
  overflow: hidden;
}

.version-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  min-height: 0;
  overflow: hidden;

  section {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 12px;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    background: var(--surface-raised);
  }

  h4 {
    flex: 0 0 auto;
    margin: 0 0 8px;
    color: var(--t2);
    font-size: 13px;
    font-weight: 900;
  }

  pre {
    flex: 1 1 auto;
    min-height: 0;
    margin: 0;
    padding: 12px;
    overflow: auto;
    border: 1px solid var(--bd-line);
    border-radius: 8px;
    color: var(--t2);
    background: var(--paper-surface);
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  background: var(--surface-field);
}

.version-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--bd-line);
  border-radius: 8px;
  color: inherit;
  background: var(--paper-surface);
  text-align: left;
  cursor: pointer;

  &.active {
    border-color: var(--brand-moss);
    box-shadow: inset 2px 0 0 var(--brand-moss);
  }

  b {
    display: grid;
    place-items: center;
    height: 24px;
    border: 1px solid var(--bd-line);
    border-radius: 999px;
    color: var(--t5);
    font-size: 11px;
  }

  strong,
  em {
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

  em {
    margin-top: 4px;
    color: var(--t5);
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
  }
}

.compare-hint {
  margin-right: auto;
  color: var(--t5);
  font-size: 12px;
  font-weight: 700;
}

.check-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--bd-line);

  strong,
  span {
    display: block;
  }
}

.check-row {
  padding: 10px 0;
  border-bottom: 1px solid var(--bd-line);

  strong,
  p,
  small {
    display: block;
    margin: 0;
  }

  p,
  small {
    margin-top: 6px;
    color: var(--t5);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }
}

.empty-state {
  padding: 20px;
}

@media (max-width: 1180px) {
  .mcp-grid,
  .two-col,
  .context-grid,
  .audit-grid,
  .overview-grid,
  .manuscript-layout,
  .long-state {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .status-hero,
  .writer-head {
    align-items: flex-start;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .hero-metrics,
  .metric-panel,
  .contract-strip,
  .ledger-columns,
  .task-template-list,
  .split-list,
  .dialogue-grid,
  .version-shell,
  .version-compare {
    grid-template-columns: 1fr;
  }
}
</style>

<style lang="scss">
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

.nf-dialog-body {
  max-height: calc(95vh - 128px);
  overflow: auto;
}
</style>
