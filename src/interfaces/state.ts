import { Styles } from '@src/interfaces/styles'
import { UI } from '@src/interfaces/ui'
import { Elements, ElementProxies } from '@src/interfaces/elements'
import { Components } from '@src/interfaces/components'

export interface State {
  elementProxies: ElementProxies
  elements: Elements
  components: Components
  styles: Styles
  ui: UI
}
