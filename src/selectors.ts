import state from '@state'
import { RouterPaths } from '@src/interfaces'

export const getCurrentComponent = () => {
  if (state.ui.router.path === RouterPaths.elements) {
    return state.elements[state.ui.router.componentId][0]
  }
  if (state.ui.router.path === RouterPaths.component) {
    return state.components[state.ui.router.componentId]
  }
  if (state.ui.router.path === RouterPaths.page) {
    return state.pages[state.ui.router.componentId]
  }
}
