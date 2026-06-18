import {
  characterRelationGraphForProject,
  deleteCharacter,
  deleteCharacterRelation,
  deleteWorldFact,
  listCharacterRelations,
  listCharacters,
  listWorldFacts,
  saveCharacter,
  saveCharacterRelation,
  saveWorldFact,
} from '../../../novel/novel-api-service'

export class NovelCharacterService {
  static listWorldFacts(projectId: string) {
    return listWorldFacts(projectId)
  }

  static saveWorldFact(projectId: string, payload: Record<string, unknown>) {
    return saveWorldFact(projectId, payload)
  }

  static deleteWorldFact(projectId: string, factId: string) {
    return deleteWorldFact(projectId, factId)
  }

  static list(projectId: string) {
    return listCharacters(projectId)
  }

  static save(projectId: string, payload: Record<string, unknown>) {
    return saveCharacter(projectId, payload)
  }

  static delete(projectId: string, characterId: string) {
    return deleteCharacter(projectId, characterId)
  }

  static graph(projectId: string) {
    return characterRelationGraphForProject(projectId)
  }

  static listRelations(projectId: string) {
    return listCharacterRelations(projectId)
  }

  static saveRelation(projectId: string, payload: Record<string, unknown>) {
    return saveCharacterRelation(projectId, payload)
  }

  static deleteRelation(projectId: string, relationId: string) {
    return deleteCharacterRelation(projectId, relationId)
  }
}
