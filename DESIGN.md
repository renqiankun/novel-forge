# NovelForge Design Baseline

NovelForge is a local desktop story-state workbench for long-form novel planning, MCP-readable context management, version review, and Codex/Claude Code led AI creation.

## Visual Direction

The interface direction is **warm paper manuscript desk**.

The app should feel like a quiet writing desk with ledgers, manuscript pages, annotations, and compact inspectors. It is not a dashboard product, not a marketing page, and not a generic admin system.

## Layout Rules

- Use top-level global navigation only for app-level sections: dashboard, projects, MCP, settings.
- Inside a novel project, use compact segmented project navigation. The first project page is always the AI workbench, followed by manuscript review and outline planning.
- The primary product flow is external-AI-controlled chapter production: record the author goal, expose MCP resources, let Codex/Claude Code read context, receive candidate writes, compare versions, then finalize the best version.
- The desktop app is passive in the current phase. It does not call an AI API directly; real generation is controlled outside the app by Codex, then returned to the app as versions.
- The AI workbench is the default project surface. It shows queued AI tasks, MCP resource previews, recent writes, and high-impact confirmations. It must not pretend Electron is the AI control client.
- AI task creation must include execution policy controls: context budget, review mode, candidate-fact strategy, checkpoint interval, and auto-pause condition. These policies are saved with mock tasks so the future MCP layer can read them directly.
- Human editing is secondary. The author mostly inspects context, confirms high-risk changes, chooses versions, and asks the external AI to continue or revise.
- Project outline is the planning spine: full-book promise, volume goal, arc conflict, and chapter goal/payoff. It should be visible as its own project module and included in the current chapter context pack.
- World facts, characters, style, issues, and candidate facts are Codex context around the current chapter. They should inform generation and rewriting instead of becoming user confirmation chores.
- World facts and character states are not all fixed at project start. They can begin with seed rules, then grow from chapter drafts, candidate facts, local checks, and user edits as the story advances.
- The manuscript workspace should feel like a writing stage plus rewrite-task controls and a version pool, not a data-management dashboard or built-in AI client.
- The manuscript workspace itself should not be wrapped in a large card. Use an unframed writing surface beside the chapter list.
- Manuscript versions sit at the bottom of the writing surface as a fixed-height version drawer; long version lists scroll internally.
- Rewrite conditions are opened from a single button and edited in a dialog, not shown as a persistent right-side panel.
- Do not show a persistent "control client" panel in the manuscript workspace. Keep passive app behavior in short notes and modal copy only.
- Page headers and module headers use compact lightweight info cards with fine borders, low shadows, and short copy.
- Tips, mock notices, and status explanations should be inline notes or rows, never large standalone cards.
- Avoid large card grids. Cards are allowed only for small repeated records where a ledger row would be worse.
- Avoid table-first pages. Use responsive ledger rows for facts, characters, candidates, and audit records.
- No page may require horizontal scrolling at desktop minimum width. Use `minmax(0, 1fr)`, wrapping rows, and single-column fallbacks.

## Color

Light mode uses warm paper with visible desk separation. The background should be warmer than pure white, but still quiet enough for long editing sessions:

- App background: `#f8f0e4`
- Paper surface: `#fffdf7`
- Raised panel: `#fff9ef`
- Sunken region: `#efe4d1`
- Ink: `#2d2118`
- Muted ink: `#7d6854`
- Copper accent: `#a45f2b`
- Moss accent: `#496b56`
- Amber focus: `#c7832f`

Dark mode uses warm ink and old-paper contrast rather than pure black:

- Night desk: `#17120e`
- Dark panel: `#211a14`
- Warm ink text: `#efe3cf`
- Muted dark text: `#b59d82`
- Copper accent: `#d19156`
- Moss accent: `#7fa88d`

## Components

- Buttons: business command buttons prefer capsule radius. Native window controls stay compact.
- Panels: 8px radius, fine warm borders, low shadows, no nested card stacks.
- Context strips: no filled box unless they contain editable controls that need a boundary.
- Lists: prefer ledger rows with a left label column, flexible body, and wrapping action area.
- Editors: manuscript text areas should be visually central and readable, with a rewrite-task dialog and a compact version pool nearby.
- Forms: dense, label-top, responsive grids that collapse to one column.

## Dark Mode

Every new UI must use theme variables from `renderer/theme/theme-variable.module.scss`. Do not hardcode light-only surfaces.

## Do

- Keep project-scoped data under a selected novel project.
- Use ledger rows for facts, characters, and audit reports outside the manuscript flow.
- Use outline nodes for full-book, volume, arc, and chapter planning; bind chapter outline nodes to real chapter records whenever possible.
- Keep issue/candidate-fact status lightweight in the manuscript workspace; Codex should absorb it for the next generation pass.
- Low-risk candidate facts may be batch-settled from review surfaces; high-risk or conflicting changes stay as explicit user confirmations.
- Keep text readable and stable on narrow desktop widths.
- Preserve preload file proxy, updater download, and IPC templates.

## Don't

- Do not place world, character, chapter, or audit modules in the global sidebar.
- Do not use wide tables for primary content.
- Do not build large dashboard/card-grid pages.
- Do not create horizontal scrolling in project pages.
- Do not use blue/purple SaaS dashboard palettes as the default.
- Do not bring back StepPilot, test-case, recording, runner, or browser-automation UI concepts.
