import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { NodeTypes, RootNode } from '@src/interfaces/nodes'
import { getSelectedElement } from '@src/selector'
import useKey from 'react-use/esm/useKey'

const ElementsWrapper = styled.div`
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: translateZ(0);
  align-items: center;
  align-content: center;
  justify-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  display: grid;
`

const removeNode = (node: RootNode) => {
  if (!node.children) return
  const nodeIndex = node.children.indexOf(state.ui.selectedNode)
  if (nodeIndex !== -1) {
    node.children.splice(nodeIndex, 1)
  } else {
    node.children.forEach(removeNode)
  }
}

const deleteComponent = e => {
  const del = e.keyCode === 46
  const backspace = e.keyCode === 8
  const component = getSelectedElement()

  if (
    (del || backspace) &&
    state.ui.selectedNode &&
    !state.ui.editingTextNode &&
    (state.ui.selectedNode.type !== NodeTypes.Root || state.ui.selectedNodeToOverride)
  ) {
    removeNode(component.root)
    state.ui.selectedNode = null
    state.ui.stateManager = null
  }
  return false
}

const unselectComponent = e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = null
    state.ui.stateManager = null
    state.ui.editingTextNode = null
    state.ui.editingBoxNode = null
    state.ui.showAddComponentMenu = false
    state.ui.showExportMenu = false
  }
}

const Background = props => {
  useKey(deleteComponent)
  return <ElementsWrapper onClick={unselectComponent}>{props.children}</ElementsWrapper>
}
export default Background
