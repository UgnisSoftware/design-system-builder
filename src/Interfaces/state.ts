import { Styles } from '@src/Interfaces/styles'
import { UI } from '@src/Interfaces/ui'
import { Elements } from '@src/Interfaces/elements'
import { Component } from '@src/Interfaces/components'

export interface State {
  elements: Elements
  components: { [id: string]: Component }
  styles: Styles
  ui: UI
}
