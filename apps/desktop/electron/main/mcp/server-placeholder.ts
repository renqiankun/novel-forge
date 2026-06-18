import {
  desktopMcpToolDefinitions,
  type McpToolDefinition,
} from './tool-definitions'
import { desktopMcpToolRoutes, getDesktopMcpToolRoute, type DesktopMcpToolRoute } from './tool-routes'

export interface DesktopMcpPlaceholder {
  mode: 'placeholder'
  tools: McpToolDefinition[]
  routes: DesktopMcpToolRoute[]
  describeTool: (name: string) => DesktopMcpToolRoute | undefined
}

export const createDesktopMcpPlaceholder = (): DesktopMcpPlaceholder => ({
  mode: 'placeholder',
  tools: desktopMcpToolDefinitions,
  routes: desktopMcpToolRoutes,
  describeTool: getDesktopMcpToolRoute,
})
