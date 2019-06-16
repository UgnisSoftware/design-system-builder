import state from '@state'

export const getSelectedElement = () => state.elements.find(el => el.id === state.ui.router[1])
