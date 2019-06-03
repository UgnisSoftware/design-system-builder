import state from '@state'

export const getSelectedElement = () => state.elements[state.ui.router[0]].find(el => el.id === state.ui.router[1])
