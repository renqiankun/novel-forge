import { novelAiApi } from './ai'
import { novelCanvasApi } from './canvas'
import { novelChapterApi } from './chapter'
import { novelCharacterApi } from './character'
import { novelProjectApi } from './project'
import { novelSettingsApi } from './settings'
import { novelStateApi } from './state'
import { novelStyleApi } from './style'

export { novelAiApi } from './ai'
export { novelCanvasApi } from './canvas'
export { novelChapterApi } from './chapter'
export { novelCharacterApi } from './character'
export { novelProjectApi } from './project'
export { novelSettingsApi } from './settings'
export { novelStateApi } from './state'
export { novelStyleApi } from './style'

export const novelDbApi = {
  ...novelProjectApi,
  ...novelCanvasApi,
  ...novelChapterApi,
  ...novelAiApi,
  ...novelStyleApi,
  ...novelCharacterApi,
  ...novelStateApi,
  ...novelSettingsApi,
}
