import state from '@state'
import { RouterPaths } from '@src/interfaces'

export const getCurrentComponent = () => {
  if (state.router.path === RouterPaths.elements) {
    return state.elements[state.router.componentId][0]
  }
  if (state.router.path === RouterPaths.component) {
    return state.components[state.router.componentId]
  }
  if (state.router.path === RouterPaths.page) {
    return state.pages[state.router.componentId]
  }
}
