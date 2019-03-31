import state from '@state'
import { RouterPaths } from '@src/interfaces'

export const getCurrentComponent = () => {
  if (state.ui.router.path === RouterPaths.component) {
    return state.components[state.ui.router.componentId]
  }
}
