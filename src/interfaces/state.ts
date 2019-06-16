import { Settings } from '@src/interfaces/settings'
import { UI } from '@src/interfaces/ui'
import { Element } from '@src/interfaces/elements'

export interface State {
  elements: Element[]
  settings: Settings
  ui: UI
}
