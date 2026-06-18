import { queryDB } from '../_queryDB'

export const novelCharacterApi = {
  listWorldFacts: (projectId: string) => queryDB('db/novel/character/world-fact/list', { projectId }),

  saveWorldFact: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/character/world-fact/save', { projectId, payload }),

  deleteWorldFact: (projectId: string, factId: string) =>
    queryDB('db/novel/character/world-fact/delete', { projectId, factId }),

  listCharacters: (projectId: string) => queryDB('db/novel/character/list', { projectId }),

  saveCharacter: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/character/save', { projectId, payload }),

  deleteCharacter: (projectId: string, characterId: string) =>
    queryDB('db/novel/character/delete', { projectId, characterId }),

  getCharacterRelationGraph: (projectId: string) => queryDB('db/novel/character/graph', { projectId }),

  listCharacterRelations: (projectId: string) => queryDB('db/novel/character/relation/list', { projectId }),

  saveCharacterRelation: (projectId: string, payload: Record<string, unknown>) =>
    queryDB('db/novel/character/relation/save', { projectId, payload }),

  deleteCharacterRelation: (projectId: string, relationId: string) =>
    queryDB('db/novel/character/relation/delete', { projectId, relationId }),
}
