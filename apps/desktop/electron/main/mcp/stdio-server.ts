import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

import { dbConnect } from '../db/dbConnect'
import { desktopMcpToolDefinitions } from './tool-definitions'
import { executeDesktopMcpTool } from './tool-executor'

type JsonRecord = Record<string, unknown>

const stringify = (value: unknown) => JSON.stringify(value, null, 2)

export const mcpStdioErrorMessage = (error: unknown) => (error instanceof Error ? error.stack || error.message : String(error))

export const createNovelForgeMcpServer = async () => {
  await dbConnect()

  const server = new Server(
    {
      name: 'novelforge',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: desktopMcpToolDefinitions.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await executeDesktopMcpTool({
        name: request.params.name,
        arguments: (request.params.arguments ?? {}) as JsonRecord,
      })
      return {
        content: [
          {
            type: 'text',
            text: stringify(result),
          },
        ],
      }
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: mcpStdioErrorMessage(error),
          },
        ],
      }
    }
  })

  return server
}

export const startNovelForgeMcpStdio = async () => {
  process.env.NOVELFORGE_MCP_STDIO = '1'
  const server = await createNovelForgeMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
