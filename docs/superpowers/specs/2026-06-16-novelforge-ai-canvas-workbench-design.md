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

1. User records a Codex task in the app.
2. App stores task policy: target, context mode, review mode, candidate fact strategy, checkpoint interval, and auto-pause rule.
3. App exposes an MCP-readable task package.
4. External AI reads resources and writes back candidate versions, style assets, facts, or long-state updates.
5. App creates visible nodes and write logs.
6. Human confirms only high-impact changes or final version selection.

### Version Confirmation Flow

1. Chapter node shows candidate version count.
2. User opens version comparison.
3. Dialog compares current applied version and selected candidate.
4. Local checks and candidate facts are visible beside the version list.
5. User may apply candidate, request rewrite, archive candidate, or run local check.
6. Applying a version updates the authoritative chapter state and write log.

### Pending Fact / Risk Flow

1. Risk node appears when candidate facts, audit reports, or chapter issues require attention.
2. Low/medium-risk facts may support batch settle from the audit dialog.
3. High-risk or conflicting facts require explicit confirmation.
4. Confirmed facts become authoritative world facts or locked facts according to risk policy.

## Module Mapping

The interface should map to current project modules and mock API surfaces:

- Canvas: `ProjectCanvas`, `ProjectCanvasNode`, `ProjectCanvasEdge`
- Node detail: `CanvasNodeDetail`
- Task package: `AiTask`, `AiTaskPackage`
- Context Pack: `ChapterContextPack`
- Versioning: `ChapterVersion`, `RewriteTask`, `LocalCheckResult`
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

## Acceptance Checklist

- At 1400 x 750, the canvas is the dominant surface.
- Left navigation is a compact icon dock, not a wide text sidebar.
- Project title and progress are visible in a floating card.
- Right details are absent until a node/action is selected.
- MCP status is visible in a short bottom bar.
- All project modules remain reachable from dock or toolbar tabs.
- Candidate versions can be compared and finalized without opening a full manuscript editor.
- High-risk facts and audit issues require explicit confirmation.
- The design matches warm paper manuscript desk styling.
- The interface communicates external-AI-first workflow within the first viewport.

## Non-goals

- No direct AI API integration inside Electron.
- No chat-client-style AI panel as the main UI.
- No persistent right-side detail panel on the canvas.
- No large dashboard/card-grid project page as the default surface.
- No manual full-text editor as the center of the project workbench.
