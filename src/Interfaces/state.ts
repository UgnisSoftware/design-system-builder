import { Styles } from '@src/Interfaces/styles'
import { UI } from '@src/Interfaces/ui'
import { Elements } from '@src/Interfaces/elements'
import { Components } from '@src/Interfaces/components'

export interface State {
  elements: Elements
  components: Components
  styles: Styles
  ui: UI
}
