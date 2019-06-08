import { Settings } from '@src/interfaces/settings'
import { UI } from '@src/interfaces/ui'
import { Elements } from '@src/interfaces/elements'

export interface State {
  elements: Elements
  settings: Settings
  ui: UI
}
