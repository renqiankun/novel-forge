import { registerNovelAiRoutes } from './ai'
import { registerNovelCanvasRoutes } from './canvas'
import { registerNovelChapterRoutes } from './chapter'
import { registerNovelCharacterRoutes } from './character'
import { registerNovelProjectRoutes } from './project'
import { registerNovelSettingsRoutes } from './settings'
import { registerNovelStateRoutes } from './state'
import { registerNovelStyleRoutes } from './style'

export const registerNovelDbControllers = () => {
  registerNovelProjectRoutes()
  registerNovelCanvasRoutes()
  registerNovelChapterRoutes()
  registerNovelAiRoutes()
  registerNovelStyleRoutes()
  registerNovelCharacterRoutes()
  registerNovelStateRoutes()
  registerNovelSettingsRoutes()
}
