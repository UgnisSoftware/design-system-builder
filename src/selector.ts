import stateComponents from '@state/components'
import { paths, pathToParams } from '@state/router'

export const getSelectedElement = () => {
  const { componentId } = pathToParams(paths.element)

  return stateComponents.find(el => el.id === componentId)
}
export const getSelectedModifier = () => {
  const { modifierName } = pathToParams(paths.element)

  return modifierName
}
