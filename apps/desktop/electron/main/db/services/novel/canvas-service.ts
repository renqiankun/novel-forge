import { buildProjectCanvas, getCanvasNodeDetail } from '../../../novel/novel-api-service'

export class NovelCanvasService {
  static get(projectId: string) {
    return buildProjectCanvas(projectId)
  }

  static nodeDetail(projectId: string, nodeId: string) {
    return getCanvasNodeDetail(projectId, nodeId)
  }
}
