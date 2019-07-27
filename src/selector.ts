import state from '@state'

export const getSelectedElement = () => state.elements.find(el => el.id === state.ui.router[1])
export const getSelectedModifier = () => state.ui.router[2]
