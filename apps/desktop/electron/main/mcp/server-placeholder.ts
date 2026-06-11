import {
  desktopMcpToolDefinitions,
  type McpToolDefinition,
} from './tool-definitions'

export interface DesktopMcpPlaceholder {
  mode: 'placeholder'
  tools: McpToolDefinition[]
}

export const createDesktopMcpPlaceholder = (): DesktopMcpPlaceholder => ({
  mode: 'placeholder',
  tools: desktopMcpToolDefinitions,
})
