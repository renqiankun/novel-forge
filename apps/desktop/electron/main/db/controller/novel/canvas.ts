import { NovelCanvasService } from '../../services/novel/canvas-service'
import { registerNovelRoute, stringParam } from './route-utils'

export const registerNovelCanvasRoutes = () => {
  registerNovelRoute('db/novel/canvas/get', (params) => NovelCanvasService.get(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/canvas/node-detail', (params) =>
    NovelCanvasService.nodeDetail(stringParam(params, 'projectId'), stringParam(params, 'nodeId')),
  )
}
