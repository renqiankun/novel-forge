export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export const desktopMcpToolDefinitions: McpToolDefinition[] = [
  {
    name: 'novel_project_list',
    description: 'List local novel projects visible to the current desktop workspace.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'story_context_get',
    description: 'Read project-scoped story context for an external AI host.',
    inputSchema: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
]
