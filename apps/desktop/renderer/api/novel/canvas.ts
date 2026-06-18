import { queryDB } from '../_queryDB'

export const novelCanvasApi = {
  getProjectCanvas: (projectId: string) => queryDB('db/novel/canvas/get', { projectId }),

  getCanvasNodeDetail: (projectId: string, nodeId: string) =>
    queryDB('db/novel/canvas/node-detail', { projectId, nodeId }),
}
