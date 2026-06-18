# NovelForge AI Canvas Workbench Design

Date: 2026-06-16
Status: Approved direction from continued design thread
Target viewport: 1400 x 750 desktop app

## Brief

NovelForge is a passive local novel-project workbench for external AI controllers such as Codex or Claude Code. The desktop app exposes story state, context packs, AI task packages, candidate versions, local checks, and confirmation gates through MCP-readable structures. It should not behave like a conventional human-first writing editor, and it should not directly call AI APIs.

The selected interface direction is:

**Minimal left dock + floating project card + full-screen novel canvas + on-demand detail drawers/dialogs + lightweight MCP status bar.**

This replaces a traditional wide sidebar with a compact dock so the chapter graph stays dominant. Human interaction stays focused on inspecting AI output, confirming versions, handling high-risk facts, and occasionally editing small text fragments through version/rewrite flows.

## Product Principles

1. AI writes and plans externally through MCP; the app records, validates, previews, and confirms.
2. The default project surface is the AI canvas, not a manuscript editor.
3. Volumes, chapters, versions, AI tasks, and risks are graph nodes with compact state.
4. Node details open only on demand, then disappear so the canvas returns to full space.
5. MCP state is always visible but small; expanded diagnostics live in dialogs.
6. Warm paper manuscript desk remains the visual language.

## Layout

At 1400 x 750, the project screen uses the available app shell minus native window chrome and global layout.

```text
+----------------------------------------------------------+
| 68 dock | floating project card | canvas toolbar/tabs     |
|         |                                               |
|         |   volume -> chapters -> versions -> risk/task  |
|         |                                               |
|         |   on-demand popover/drawer/dialog only         |
|---------+-----------------------------------------------|
|         | 28 px live MCP status bar                     |
+----------------------------------------------------------+
```

### Left Dock

- Width: 68 px.
- Persistent content: brand mark, primary project canvas, MCP, task package, context, outline, style, audit, snapshots/settings.
- Dock buttons use icon-only affordances with tooltips.
- Alert dots show pending review or MCP attention.
- A dock item may expand a compact flyout menu, but the flyout is transient.
- The dock must not contain long project names, module descriptions, or large counters.

### Floating Project Card

- Position: canvas top-left, offset 16 px from canvas edge.
- Width: about 246 px at the target viewport.
- Content:
  - project title
  - current chapter / target chapter count
  - queued AI task count
  - pending confirmation count
  - primary actions: record AI task, refresh canvas
- The card may collapse to a title strip if canvas width becomes tight.
- This card owns project context that previously lived in a wide sidebar.

### Canvas Toolbar

- Position: top of canvas, starting after the floating project card.
- Height: about 42-54 px depending on implementation shell.
- Content:
  - current graph scope label: volume / chapter / version / task / risk
  - segmented module tabs: Canvas, MCP, Context Pack, Outline, Long State, Style, Audit
  - compact controls: fit view, refresh, create Codex task
- Tabs open dialogs or route query panels; they do not navigate away from the canvas as a full page.

### Main Canvas

- Uses Vue Flow as the primary representation.
- Background: warm paper grid or subtle manuscript desk texture.
- Node families:
  - book or volume nodes
  - chapter nodes
  - chapter version nodes
  - AI task nodes
  - risk or pending confirmation nodes
- Edges communicate outline hierarchy, chapter sequence, task target, version ownership, and risk ownership.
- Node copy is short and scannable: title, state, one-line summary, metrics, badges.
- Nodes should never require horizontal page scroll.

### Detail Surfaces

Detail surfaces are not persistent layout columns.

- Node click opens a right drawer.
- Chapter action opens temporary action popover, then specialized dialog if needed.
- Version comparison opens a dialog with two-column compare and a candidate list.
- Rewrite conditions open a dialog, not a pinned right panel.
- MCP status, Context Pack, Outline, Long State, Style, Audit, and Snapshots open dialogs from tabs/dock.

## Interaction Model

### Default State

1. User opens a project.
2. The AI canvas is shown by default.
3. The dock indicates active Canvas.
4. Floating project card summarizes project progress and pending confirmations.
5. Bottom status bar shows MCP readiness, latest write-back, context mode, and pending high-risk items.

### Node Click

1. Select node.
2. Open right drawer.
3. Drawer shows details relevant to node type.
4. Drawer actions can open:
   - copy Codex prompt
   - Context Pack
   - rewrite conditions
   - version compare/finalize
   - local check
5. Closing the drawer restores full canvas.

### AI Task Flow

1. User chooses a visible generation scope from the workbench: next chapter, next 10 chapters, next 50 chapters, or next 100 chapters.
2. The app creates an MCP-readable task package; it does not generate text itself and does not become an AI chat panel.
3. App stores task policy: target, context mode, review mode, candidate fact strategy, checkpoint interval, and auto-pause rule.
4. App exposes an MCP-readable task package.
5. External AI reads resources and writes back candidate versions, style assets, facts, or long-state updates.
6. App creates visible nodes and write logs.
7. Human confirms only high-impact changes or final version selection.

Task packages are managed in a visible queue, not only as individual graph nodes. The queue determines the recommended next package to hand to external AI, while blocked packages remain visible but paused.

Generation scopes:

- Next chapter: AI writes or plans the immediate next chapter and returns candidate versions, checks, candidate facts, and chapter summary updates.
- Next 10 chapters: AI primarily updates outline, chapter targets, continuity state, and optional candidate drafts; it must checkpoint before high-impact changes become authoritative.
- Next 50 chapters: AI primarily updates volume-scale outline, midpoint turns, pressure curve, risk report, and checkpoint plan for medium-range drafting.
- Next 100 chapters: AI primarily builds or revises macro-outline, volume arcs, foreshadow schedules, pressure curves, and risk reports; it should not overwrite chapter text by default.

The workbench must make this clear in the first viewport through an AI progression control surface, not only inside a hidden dialog.

### Task Package Queue Flow

The workbench must provide a first-class task package queue.

Visible entry points:

- Left dock AI task package icon.
- Canvas toolbar task package tab.
- AI progression control surface, with a compact first-viewport queue preview.
- AI task node detail.

Queue list fields:

- Priority/order.
- Task title.
- Target scope: next chapter, next 10 chapters, next 50 chapters, next 100 chapters, rewrite target, style target, or audit target.
- Status: draft, ready, queued, running, paused, write_pending, completed, archived.
- Context mode and review mode.
- Checkpoint rule.
- Blocking dependency, if any.
- Latest write-back summary.
- Primary action: copy MCP task package, view Context Pack, view write-back, pause/resume, archive.

Ordering behavior:

- Users can reorder ready, draft, and queued task packages by drag handle or up/down controls.
- The order determines the recommended next executable task package for external AI.
- Reordering does not bypass blocking dependencies; a paused task can be placed high in the list, but it must remain paused until its confirmation gate is resolved.
- Running, completed, and archived tasks should not be silently moved into the executable queue.
- Saving the queue order should create a write log entry so external AI and audit surfaces can explain why a task became next.

The compact first-viewport preview should show the first three task packages and an obvious "task package queue / sortable" control. The full list opens in a dialog or drawer-style overlay, not a permanent wide sidebar.

### Version Confirmation Flow

1. Chapter node shows candidate version count.
2. User opens version comparison.
3. Dialog compares current applied version and selected candidate.
4. Local checks and candidate facts are visible beside the version list.
5. User may apply candidate, request rewrite, archive candidate, or run local check.
6. Applying a version updates the authoritative chapter state and write log.

Final version selection is always a human confirmation gate. External AI may recommend a candidate, but it should write only candidate versions until the user applies one as the main chapter version.

### Rewrite Flow

Chapter rewriting must be typed before a task package is created. The first implementation should support these rewrite categories:

- Style rewrite: preserve plot facts and scene outcome; change prose rhythm, density, atmosphere, and style-profile adherence.
- Plot rewrite: allow event order, conflict strength, and cause/effect changes; must produce an impact report.
- Dialogue rewrite: preserve scene result; adjust character voice, information reveal, subtext, and dialogue pacing.
- Continuity repair: fix timeline, foreshadow, message, fact, motivation, or long-state inconsistencies.
- Bridge rewrite: improve transition from previous chapter to next planned chapters.
- Local expression rewrite: rewrite only selected fragments without changing the chapter structure.

Rewrite tasks must produce a candidate version or candidate patch, not directly overwrite the authoritative version.

### Manual Confirmation Flow

The default canvas must show a visible "pending my confirmation" queue. It should not force users to inspect every node to learn what needs their decision.

Confirmation categories:

- Version finalization: choose which candidate becomes the authoritative chapter version.
- Plot-impact decision: accept, reject, or return changes that affect pressure value, breakpoint, foreshadow payoff, character relationship, or volume arc.
- Character style decision: confirm character voice rules such as dialogue restraint, vocabulary, emotional leakage, and explanation density.
- Whole-book style decision: confirm which style profile enters future Context Packs for the whole book or volume.
- Candidate fact decision: accept, reject, batch-settle, or return facts to AI.
- Rewrite decision: send an issue back as style rewrite, plot rewrite, dialogue rewrite, continuity repair, bridge rewrite, or local expression rewrite.

Queue rows should be labeled with short action semantics such as `must confirm`, `can batch`, `return to AI`, or `ready to finalize`. High-impact rows cannot be silently batch-settled.

### Pending Fact / Risk Flow

1. Risk node appears when candidate facts, audit reports, or chapter issues require attention.
2. Low/medium-risk facts may support batch settle from the audit dialog.
3. High-risk or conflicting facts require explicit confirmation.
4. Confirmed facts become authoritative world facts or locked facts according to risk policy.

## Screen-Level UI Specification

This section defines the actual interface surfaces before implementation. It is the source of truth for the first coded pass.

### 1. Default AI Canvas Workbench

Purpose: show the project as an AI-operable story state graph.

Persistent regions:

- 68 px left dock.
- Full canvas area.
- Floating project card.
- Canvas toolbar.
- 28 px MCP status bar.

Visible information:

- Project title and genre in the floating card.
- Current chapter progress, target chapter count, queued tasks, pending confirmations.
- Graph scope and module tabs in the toolbar.
- Volume, chapter, version, AI task, and risk nodes in the canvas.
- Latest MCP/write-back state in the status bar.
- Explicit access to MCP details, task package queue, Context Pack, outline/volume, long-state, style, audit, snapshots/export, and chapter text reader.

Primary actions:

- Record AI task.
- Refresh canvas.
- Fit canvas.
- Open module dialogs from toolbar tabs.
- Select graph node.

Design constraints:

- The canvas must feel like the main screen, not like content inside a dashboard card.
- The floating project card can overlap empty canvas space but must not cover important selected nodes.
- At 1400 x 750, users should see at least one volume, two chapter nodes, one task/version region, and one risk or pending review signal.

Feature visibility rule:

- The default canvas must not be a purely abstract node graph. It must also show core novel-planning information from the current project data model.
- Screenshot references that show dense volume/chapter cards should be treated as **node content references only**, not as a requirement to turn the whole canvas into a column/list board.
- Overall project progress is first-screen information: current chapter, target chapter count, total progress percent, queued AI tasks, pending confirmations, and recent write-back.
- Volume nodes should show volume progress, core conflict, target, expected chapter count, and main progress percent.
- Chapter nodes should include enough body/planning information to recognize the story beat without opening a drawer:
  - scene or location
  - POV
  - word count or target word count
  - current emotion/tension
  - key event
  - short body excerpt, draft line, or writing target
- Long-state highlights should be visible on the first screen when active: highest pressure value, nearest breakpoint, plot debt count, foreshadow count, and message/timeline warnings.
- Style state should also be visible when active: active style profile, applied style assets, pending style extraction, and whether a style task is waiting for external AI write-back.
- The first coded pass should keep the free AI canvas layout with version, task, risk, and context nodes; the richer chapter information belongs inside the nodes and drawers.

AI operation visibility rule:

- The first viewport must expose how to ask AI to continue with the next chapter, next 10 chapters, or next 100 chapters.
- The first viewport or AI progression dialog must also expose the current code-supported next 50 chapters target.
- The first viewport must expose what the human must confirm before the project state changes.
- The user should be able to see, without opening a drawer, whether the next likely action is generation, rewriting, version finalization, style confirmation, fact confirmation, or outline review.
- Generation controls create task packages for external AI; confirmation controls apply or reject local state changes after AI writes back.
- Core secondary modules from the existing project must be one click away from the workbench: MCP detail, Context Pack JSON preview, long-state ledger, audit/facts, snapshots, import/export, manuscript export, and chapter text reader.

### 2. Dock Expanded Flyout

Purpose: provide module navigation without a wide persistent sidebar.

Trigger:

- Hover, click, or keyboard focus on dock group button.

Content:

- 2-column compact menu.
- Canvas, MCP Status, Task Package, Context Pack, Outline, Long State, Style, Audit, Snapshots.
- Optional counters for pending or high-risk states, capped to short tokens such as `5`, `12`, or `!`.

Behavior:

- Closes on outside click, Escape, or selection.
- Selecting a module opens the matching dialog or sets the route query panel.
- It never changes the project screen into a separate full-width module page during the main workbench flow.

### 3. Chapter Detail Drawer

Purpose: inspect the selected chapter enough to decide what AI-facing action comes next.

Trigger:

- Click a chapter node.

Placement:

- Right side drawer, about 430 px wide on the target viewport.
- Overlay, not a permanent column.

Header:

- Node kind label.
- Chapter title.
- Chapter status and subtitle.

Actions:

- Copy Codex prompt.
- Open Context Pack.
- Open rewrite conditions.
- Open version compare/finalize.
- Open chapter text reader / minor edit.
- Run local check.

Body sections:

- Chapter metrics: status, word count, version count, latest check level.
- Outline contract: goal, conflict, payoff.
- Codex-readable summary: world facts, characters, active style, pressure/debt signals.
- Pending signals: candidate facts, audit reports, chapter issues.

Behavior:

- Drawer closes with Escape, close button, or outside interaction if no unsaved form exists.
- Closing the drawer keeps the node selected but restores canvas width.
- Drawer actions open dialogs layered above the canvas.

### 3a. Chapter Text Reader And Minor Edit Dialog

Purpose: allow the user to inspect authoritative chapter text and make tiny corrections without turning the app into a primary manuscript editor.

Trigger:

- Chapter drawer action.
- Version compare dialog.
- Applied version node.

Default mode:

- Readable chapter text view.
- Chapter metadata: applied version, source, latest local check, snapshot status, and Context Pack sync status.
- Actions: enter minor edit, open version compare, request AI rewrite, copy text.

Minor edit mode:

- Intended only for typo, punctuation, name, wording, or very short sentence fixes.
- Should show a concise edit boundary notice.
- Saves as a minor-edit version or patch, not as an invisible mutation.
- Creates a write log entry.
- Updates future Context Pack inputs.
- Preserves the previous authoritative text through snapshot or version history.

Guardrails:

- Large text changes should redirect to rewrite conditions.
- Minor edit must not silently alter outline, facts, style profile, or long-state records.
- If a minor edit touches locked facts, character relationship, pressure value, breakpoint, or plot outcome, the app should warn and suggest a rewrite or confirmation flow.
- This is an exception path for practical cleanup, not the center of the product.

### 4. Version Compare And Finalize Dialog

Purpose: let the human choose which AI-generated candidate becomes the authoritative chapter version.

Trigger:

- Chapter drawer action.
- Version node click.
- Risk/action popover when candidate versions exist.

Layout:

- Dialog width: `min(1060px, 94vw)`.
- Main area: two-column comparison.
- Side area: candidate version list and local check summary.
- Footer: final decision buttons.

Visible information:

- Current applied version text or summary.
- Selected candidate text or summary.
- Version metadata: source, status, word count, created time.
- Local check level and suggested action.
- Related candidate facts or audit warnings.

Actions:

- Apply candidate as main version.
- Archive candidate.
- Request AI rewrite.
- Run local check.
- Open Context Pack for the same chapter.

Guardrails:

- Applying a candidate with danger-level local checks requires confirmation.
- Applying a candidate should create or reference a snapshot if the previous main version is being replaced.
- The dialog must not become a full manual editor. Small text correction can be an exception path, not the primary surface.

### 5. AI Task Creation Dialog

Purpose: record an MCP-readable task package for external Codex or Claude Code.

Trigger:

- Floating project card primary action.
- Canvas toolbar `Codex Task` action.
- Chapter drawer rewrite action.

Form sections:

- Target: next chapter, next 10 chapters, next 50 chapters, next 100 chapters, rewrite chapter, style adjustment, style extraction, style process.
- Target chapter when applicable.
- Context mode: Lite, Full, Deep.
- Review mode: token saver, balanced, strict.
- Candidate fact strategy: optimistic, balanced, conservative.
- Checkpoint interval.
- Auto-pause rule: none, high risk, checkpoint, any issue.
- Task title.
- Instruction for external AI.

Scope defaults:

- Next chapter defaults to candidate text, chapter summary, and local check.
- Next 10 chapters defaults to outline, chapter targets, continuity updates, candidate facts, and optional candidate text at checkpoint boundaries.
- Next 50 chapters defaults to volume-scale outline, midpoint turns, pressure curve, checkpoint plan, and risk report.
- Next 100 chapters defaults to macro-outline, volume arcs, pressure curve, foreshadow schedule, style constraints, and risk report.

Result:

- Creates a task record.
- Exposes an AI task package.
- Adds a task node to the canvas.
- Adds the task package to the task package queue.
- Adds a write log entry.

Copy tone:

- The dialog should make clear that real generation happens in the external AI host through MCP.
- The dialog should make clear that AI outputs remain candidates until a confirmation gate applies them.

### 5a. Task Package Queue Dialog

Purpose: inspect and reorder AI task packages before handing the next package to external AI.

Trigger:

- Left dock AI task package icon.
- Toolbar `Task Package` tab.
- AI progression control `Task Package Queue` button.
- AI task node details.

Layout:

- Dialog width: `min(1060px, 94vw)`.
- Dense sortable list/table.
- Each row contains priority, title, target, status, checkpoint, blocking dependency, and order controls.
- Secondary side panels or inline rows show selected task details, Context Pack action, and write-back summary.

Actions:

- Move task up.
- Move task down.
- Drag to reorder.
- Copy MCP task package.
- Open Context Pack.
- View write-back.
- Pause or resume.
- Archive.

Guardrails:

- Reordering changes recommendation order, not execution by itself.
- Paused or blocked tasks remain blocked even if moved to the top.
- Queue order save must be explicit.
- Queue order changes should be logged.
- External AI should be able to read the queue order through MCP.

### 6. MCP Status Dialog

Purpose: show detailed MCP readiness without making MCP the permanent main panel.

Trigger:

- Dock MCP button.
- Toolbar MCP tab.
- Status bar click.

Sections:

- External AI tasks: task title, target, status, task package action, mock complete action in current mock phase.
- MCP-readable resources: URI, kind, item count, context mode.
- Recent write-backs: kind, actor, summary, time.
- Tool list summary if available.

Status states:

- `mock_ready`: tools/resources available in mock mode.
- `connected`: future real MCP server connected.
- `blocked`: MCP server or required project context missing.
- `write_pending`: external AI has written candidate data that needs review.

Design constraints:

- Dense ledger rows, not large cards.
- The first row should answer: can an external AI safely read/write this project right now?

### 7. Context Pack Dialog

Purpose: preview what the external AI will read before planning or writing.

Trigger:

- Chapter drawer.
- Toolbar Context tab.
- AI task package dialog.

Layout:

- Summary card for target chapter and token budget.
- Constraint card for outline, locked facts, active style, and long-state pressure.
- JSON/text preview with copy action.
- Optional resource checklist showing what is included or excluded.

Important fields:

- Project.
- Chapter.
- Outline nodes.
- Active style.
- Enabled style assets.
- Characters.
- World facts.
- Scene cards.
- Local checks.
- Long state.
- Estimated token budget and hard limit.

Behavior:

- Changing Lite/Full/Deep updates included resource depth.
- The preview is local and does not spend AI tokens.

### 8. Outline And Long State Dialogs

Purpose: expose planning and continuity state as AI context, not as a manual data chore.

Outline dialog:

- Full-book promise.
- Volume goals.
- Arc conflict.
- Chapter goal/payoff.
- Status badge per node.
- Link from chapter outline node to real chapter when available.
- Current plot summary for the active chapter window.
- Volume view for current volume progress, target, conflict, expected chapter count, and risk.

Long State dialog:

- Threads.
- Foreshadows.
- Costs.
- Plot debts.
- Timeline.
- Messages.
- Pressures.
- Dialogue profiles.

Design:

- Use ledger rows with compact metadata and status marks.
- Allow editing later, but first implementation can prioritize viewing and writing back through existing mock APIs.

### 9. Style And Dialogue Dialog

Purpose: manage the style context that external AI should absorb.

Sections:

- Active style profile.
- Style extraction queue: source chapters, extraction target, current MCP task status, and expected write-back type.
- Style application scope: current chapter, current volume, batch generation, or future Context Pack inclusion.
- Style assets: project style, volume style, scene mode, character voice, dialogue sample, good sample, bad pattern, forbidden item.
- Add/edit style asset form.
- Character dialogue voice summary.
- Character style confirmation queue.
- Whole-book style confirmation queue.

Behavior:

- Activating a style profile changes the context pack.
- New style assets can come from user input or external AI write-back.
- Disabled assets stay in the library but are excluded from active context.
- Applying a style asset should make the affected scope clear before future generation or rewriting uses it.
- Character voice and whole-book style are separate confirmation decisions. Confirming one must not imply confirming the other.

### 10. Audit And Risk Dialog

Purpose: resolve confirmation gates created by local checks, candidate facts, and audit reports.

Sections:

- Pending candidate facts.
- Local check records.
- Audit reports.
- Chapter issues.
- Batch action for low/medium-risk facts.

Decision types:

- Accept candidate fact.
- Reject candidate fact.
- Resolve audit report.
- Mark issue for Codex.
- Request rewrite.
- Confirm version.
- Confirm character style.
- Confirm whole-book style.
- Confirm or reject plot-impact change.

Guardrails:

- High-risk facts cannot be silently batch-settled.
- Conflicting facts require explicit comparison and confirmation.
- A danger-level audit state should block final version application unless the user explicitly overrides with confirmation and snapshot.

### 11. Snapshots And Export Dialog

Purpose: protect the project before state-changing confirmations and support handoff/export.

Sections:

- Snapshot list.
- Snapshot create form.
- Restore action.
- Export project state JSON.
- Import project state JSON.
- Export manuscript text.

Guardrails:

- Restore requires a destructive confirmation.
- Import should validate project payload before replacing local state.
- Snapshot restore is a project-state action, not a visual-only undo.

### 12. Status Bar

Purpose: maintain passive MCP visibility with almost no vertical cost.

Height:

- 28 px.

Content tokens:

- Live dot.
- MCP state.
- Latest write-back kind and actor.
- Context mode and estimated token count.
- Pending high-risk count.
- Optional current project id/title if space allows.

Interactions:

- Click opens MCP Status dialog.
- Hover shows exact last updated time and latest write log summary.

Design:

- One line.
- No wrapping at target viewport.
- Truncate middle detail before shrinking critical status labels.

## Module Mapping

The interface should map to current project modules and mock API surfaces:

- Canvas: `ProjectCanvas`, `ProjectCanvasNode`, `ProjectCanvasEdge`
- Node detail: `CanvasNodeDetail`
- Task package: `AiTask`, `AiTaskPackage`, task queue order
- Context Pack: `ChapterContextPack`
- Versioning: `ChapterVersion`, `RewriteTask`, `LocalCheckResult`
- Chapter text reader and minor edit: applied chapter text, minor-edit version or patch, write log, snapshot/version history
- Outline: `OutlineNode`, `ProjectOutline`
- Long state: threads, foreshadows, costs, debts, timeline, messages, pressures, dialogue profiles
- Style: `StyleProfile`, `StyleAsset`, dialogue profiles
- Audit: `CandidateFact`, `AuditReport`, `ChapterIssue`, local check issues
- Snapshots/export: `SnapshotRecord`, project state import/export
- MCP status: resource previews, write logs, MCP tool list, recent AI runs

## Visual System

Use existing theme variables from `theme-variable.module.scss`.

Core light palette:

- App background: `--app-bg` / `#f8f0e4`
- Paper surface: `--paper-surface`
- Raised panel: `--surface-raised`
- Field/sunken region: `--surface-field`, `--surface-sunken`
- Ink: `--t1`, `--t2`
- Muted ink: `--t4`, `--t5`
- Copper accent: `--brand-copper`
- Moss accent: `--brand-moss`
- Amber focus: `--brand-amber`

Shape and density:

- Cards/panels: 8-12 px radius.
- Do not nest cards inside cards.
- Use ledger rows inside dialogs.
- Keep typography compact inside controls, drawers, and cards.
- Avoid blue/purple SaaS dashboard styling.

## Responsive Rules

- 1400 x 750 is the design target.
- No horizontal scrolling at desktop minimum width.
- At narrower widths:
  - dock remains 60-68 px
  - project card collapses or moves into toolbar flyout
  - toolbar tabs wrap into an overflow menu
  - drawers become full-width or near full-width overlays
  - dialogs use single-column grids
- Canvas nodes keep stable dimensions; badges and metrics wrap inside the node.

## Accessibility And States

- Dock buttons require tooltips and keyboard focus states.
- Selected nodes need visible focus/selection, not color alone.
- Pending review dots need accessible labels.
- Dialogs and drawers must trap focus and return focus to the invoking node/button.
- Status bar updates should be concise and not visually jumpy.
- Destructive actions such as restoring snapshots or overwriting final versions require confirmation.

## Implementation Notes

The existing `project-canvas/index.vue` already contains many of the right flows. The next implementation pass should focus on shell composition:

1. Replace the project-level wide/sidebar emphasis with a 68 px dock in the project workbench.
2. Move project progress summary into a floating project card on the canvas.
3. Keep `VueFlow` as the main canvas and preserve existing node/detail/dialog behavior.
4. Reduce bottom MCP UI to a 28 px live status bar.
5. Route expanded MCP, Context Pack, Outline, Long State, Style, Audit, and Snapshot content through dialogs or query-driven panels.
6. Preserve the passive-AI boundary: Electron records tasks and accepts MCP write-back, but does not become an AI chat client.

### 2026-06-17 Freeze Points

The current coded canvas direction is accepted as the implementation baseline for the next refactor pass.

- Nodes with body text or candidate body text must expose a direct `查看正文` action on the node. The action opens the guarded chapter text reader / minor edit dialog; it does not turn the canvas into a manuscript editor.
- Task, chapter, and outline nodes must not share the same detail content. Task nodes prioritize task package, MCP status, confirmation gates, and target chapter context. Chapter nodes prioritize Context Pack, body reader, rewrite, version finalization, and local checks. Book/volume/arc nodes prioritize range metrics, outline contract, long-state, and audit entry points.
- Icon-only dock and floating canvas controls must keep hover tooltips. Long explanatory text belongs in drawers or dialogs, not in the persistent canvas chrome.
- Vue Flow edges default to left/right handles with enough spacing between nodes. The canvas may expose fit/refresh controls as floating controls, but persistent panels on top of the canvas should collapse behind icon buttons.
- Task package queue remains a first-class follow-up feature: users must be able to see and reorder queued task packages, while blocked/running/completed states keep their execution constraints.

### Refactor Boundary

The next code pass should preserve behavior while splitting the current canvas file into focused parts:

- `CanvasFlow`: Vue Flow nodes, edges, node body actions, fit behavior, and flow-only styling.
- `NodeDetailDrawer`: task/chapter/outline detail branching and drawer actions.
- `ReaderDialog`, `VersionDialog`, `RewriteDialog`, `CheckResultDialog`: specialized chapter/version action surfaces.
- `ProjectPanels`: MCP, task package, Context Pack, outline, long-state, style, audit, snapshot/export overlays. This can be split after the first component extraction if the file remains large.

The refactor should not change the mock API contract, node layout semantics, or external-AI-first workflow.

### Stage 3/4 Contract Slice

- `AiWorkbench.taskQueue` is the canonical queue snapshot for the canvas and MCP-facing task pickup.
- Task package ordering is persisted through `reorderAiTaskQueue`; local UI order is only an optimistic reflection.
- `AiTaskPackage` exposes `queuePosition` and `queuePolicy` so Codex / Claude can explain why it picked a task and what it is allowed to write back.
- External AI can read `novel_project_canvas_get`, `novel_ai_workbench_get`, `novel_ai_task_queue_get`, `novel_ai_task_package_get`, and `novel_pending_reviews_get`.
- External AI can request `novel_ai_task_queue_reorder`, but queue reorder must not execute a task, apply a chapter version, settle candidate facts, or bypass pending review gates.
- The next executable task is derived from queue order, task status, and pause/review policy. Completed and manually blocked tasks remain visible as history.
- Electron main keeps MCP in placeholder mode for now, but `tool-routes.ts` maps every advertised tool to the intended mock/service method and flags the effect as `read`, `write`, or `dangerous`.
- The future real MCP server should call through the route layer, not directly import renderer mock state. Renderer mock APIs are temporary behavior references until a SQLite/service implementation owns project state.

## Acceptance Checklist

- At 1400 x 750, the canvas is the dominant surface.
- Left navigation is a compact icon dock, not a wide text sidebar.
- Project title and progress are visible in a floating card.
- Next chapter, next 10 chapters, and next 100 chapters AI progression controls are visible without hunting through module pages.
- Next 50 chapters is available as a supported task target.
- The task package queue is visible from the first viewport and from the dock/toolbar.
- Task packages can be reordered by drag handle or up/down controls, with blocking states preserved.
- A pending human confirmation queue is visible in the first viewport.
- Right details are absent until a node/action is selected.
- MCP status is visible in a short bottom bar.
- All project modules remain reachable from dock or toolbar tabs.
- MCP details, Context Pack JSON preview, long-state ledger, audit/facts, snapshots/import/export, and manuscript export are explicitly reachable in the design.
- Candidate versions can be compared and finalized without opening a full manuscript editor.
- Users can open chapter text for reading and make tiny typo/punctuation/short wording fixes through a guarded minor-edit path.
- Rewrite choices are typed as style, plot, dialogue, continuity, bridge, or local expression before task package creation.
- Character style confirmation and whole-book style confirmation are separate visible decisions.
- Current plot summary, outline preview, and volume view are reachable from the workbench.
- High-risk facts and audit issues require explicit confirmation.
- The design matches warm paper manuscript desk styling.
- The interface communicates external-AI-first workflow within the first viewport.

## Non-goals

- No direct AI API integration inside Electron.
- No chat-client-style AI panel as the main UI.
- No persistent right-side detail panel on the canvas.
- No large dashboard/card-grid project page as the default surface.
- No manual full-text editor as the center of the project workbench.
