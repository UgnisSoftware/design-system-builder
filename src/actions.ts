import state from '@state'
import { parseUrl } from '@src/utils'

export const route = (path, componentId?) => () => {
  state.ui.selectedNode = null
  state.ui.stateManager = null
  history.pushState(null, '', componentId ? `/${path}/${componentId}` : `/${path}`)
  state.ui.router = parseUrl()
}
