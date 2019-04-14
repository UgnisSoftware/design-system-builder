import state from '@state'

export const route = (path, componentId?) => () => {
  state.ui.selectedNode = null
  state.ui.stateManager = null
  state.ui.router.path = path
  state.ui.router.componentId = componentId
}
