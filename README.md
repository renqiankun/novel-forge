# NovelForge

NovelForge is a local desktop foundation for long-form novel story simulation.

The project is intentionally kept as a clean template:

- Electron desktop shell for project management and manual review.
- Vue renderer for the future authoring workspace.
- SQLite plus Drizzle as the local authority database foundation.
- MCP placeholder modules for future Codex / Claude Code integration.

The desktop app must not directly call AI provider APIs. External AI hosts should interact with local story context through MCP tools, resources, prompts, validators, and save flows.
