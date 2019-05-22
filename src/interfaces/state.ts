import { Styles } from '@src/interfaces/styles'
import { UI } from '@src/interfaces/ui'
import { Elements } from '@src/interfaces/elements'
import { Components } from '@src/interfaces/components'

export interface State {
  elements: Elements
  components: Components
  styles: Styles
  ui: UI
}
