import { Emitter } from 'lape'
import { DeepPartial, Element } from './interfaces/elements'
import { RootNode } from '@src/interfaces/nodes'
import mergeDeepRight from 'ramda/es/mergeDeepRight'
import stateUi from '@state/ui'
import { getSelectedElement, getSelectedModifier } from '@src/selector'

export function uuid() {
  // return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function() {
  return ('' + 1e7).replace(/[10]/g, function () {
    return (0 | (Math.random() * 16)).toString(16)
  })
}

export const connectDevTools = (state) => {
  if (!(window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    return
  }
  const config = {
    features: {
      pause: false, // start/pause recording of dispatched actions
      lock: false, // lock/unlock dispatching actions and side effects
      persist: false, // persist states on page reloading
      export: false, // export history of actions in a file
      import: false,
      jump: false, // jump back and forth (time travelling)
      skip: false, // skip (cancel) actions
      reorder: false, // drag and drop actions in the history list
      dispatch: false, // dispatch custom actions or action creators
      test: false, // generate tests for the selected actions
    },
  }

  const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect(config)
  devTools.init(state)

  Emitter.listenSetEvents(() => {
    devTools.send('State changed', state)
  })
}

export const mergeElements = (a: Element, b: DeepPartial<RootNode>): Element => {
  return { ...a, root: { ...mergeDeepRight(a.root, b), order: b.order } as RootNode }
}

export const getSelectedNode = () => {
  if (!stateUi.selectedNode) {
    return null
  }
  const selectedElement = getSelectedElement()
  const modifier = getSelectedModifier()
  const elementState = stateUi.stateManager
  const mergedElement = modifier ? mergeElements(selectedElement, selectedElement.modifiers[modifier]) : selectedElement

  const child = mergedElement.root.children[stateUi.selectedNode.id]
  const node = elementState ? mergeDeepRight(child, child.states[elementState]) : child

  return node
}
