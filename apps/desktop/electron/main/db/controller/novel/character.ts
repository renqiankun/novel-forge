import { NovelCharacterService } from '../../services/novel/character-service'
import { objectParam, registerNovelRoute, stringParam } from './route-utils'

export const registerNovelCharacterRoutes = () => {
  registerNovelRoute('db/novel/character/world-fact/list', (params) =>
    NovelCharacterService.listWorldFacts(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/character/world-fact/save', (params) =>
    NovelCharacterService.saveWorldFact(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/character/world-fact/delete', (params) =>
    NovelCharacterService.deleteWorldFact(stringParam(params, 'projectId'), stringParam(params, 'factId')),
  )

  registerNovelRoute('db/novel/character/list', (params) => NovelCharacterService.list(stringParam(params, 'projectId')))

  registerNovelRoute('db/novel/character/save', (params) =>
    NovelCharacterService.save(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/character/delete', (params) =>
    NovelCharacterService.delete(stringParam(params, 'projectId'), stringParam(params, 'characterId')),
  )

  registerNovelRoute('db/novel/character/graph', (params) =>
    NovelCharacterService.graph(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/character/relation/list', (params) =>
    NovelCharacterService.listRelations(stringParam(params, 'projectId')),
  )

  registerNovelRoute('db/novel/character/relation/save', (params) =>
    NovelCharacterService.saveRelation(stringParam(params, 'projectId'), objectParam(params, 'payload')),
  )

  registerNovelRoute('db/novel/character/relation/delete', (params) =>
    NovelCharacterService.deleteRelation(stringParam(params, 'projectId'), stringParam(params, 'relationId')),
  )
}
