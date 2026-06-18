import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { dbConnect } from './db/dbConnect'
import { desktopMcpToolDefinitions } from './mcp/tool-definitions'
import { executeDesktopMcpTool } from './mcp/tool-executor'

process.env.NOVELFORGE_MCP_STDIO = '1'

type JsonRecord = Record<string, unknown>

const stringify = (value: unknown) => JSON.stringify(value, null, 2)

const errorMessage = (error: unknown) => (error instanceof Error ? error.stack || error.message : String(error))

const createServer = async () => {
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
            text: errorMessage(error),
          },
        ],
      }
    }
  })

  return server
}

const main = async () => {
  const server = await createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  process.stderr.write(`[NovelForge MCP] ${errorMessage(error)}\n`)
  process.exitCode = 1
})
