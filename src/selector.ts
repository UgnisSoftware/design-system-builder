import stateComponents from '@state/components'
import stateUi from '@state/ui'

export const getSelectedElement = () => stateComponents.find(el => el.id === stateUi.router[1])
export const getSelectedModifier = () => stateUi.router[2]
