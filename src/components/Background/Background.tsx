import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { RootNode } from '@src/Interfaces/nodes'

const ElementsWrapper = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
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
  const component = state.components[state.ui.router[2]]

  if (
    (del || backspace) &&
    state.ui.selectedNode &&
    !state.ui.editingTextNode &&
    component.root !== state.ui.selectedNode
  ) {
    removeNode(component.root)
    state.ui.selectedNode = null
    state.ui.stateManager = null
  }
}

class Background extends React.Component {
  componentDidMount() {
    window.addEventListener('keydown', deleteComponent)
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', deleteComponent)
  }

  render() {
    return <ElementsWrapper>{this.props.children}</ElementsWrapper>
  }
}
export default Background
