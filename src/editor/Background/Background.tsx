import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { ComponentState, Node } from '@src/interfaces'

const ElementsWrapper = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
`
const DisableStateLayer = styled.div`
  position: absolute;
  top: 64px;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 120px;

  background: rgba(177, 177, 177, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
`

const removeNode = (node: Node) => {
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
  const component = state.components[state.ui.router.componentId]

  if (
    (del || backspace) &&
    state.ui.selectedNode &&
    !state.ui.editingTextNode &&
    component.root !== state.ui.selectedNode
  ) {
    removeNode(component.root)
    state.ui.selectedNode = null
  }
}

const deselectState = () => {
  state.ui.state = ComponentState.default
}

class Background extends React.Component {
  componentDidMount() {
    window.addEventListener('keydown', deleteComponent)
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', deleteComponent)
  }

  render() {
    return (
      <ElementsWrapper>
        {this.props.children}
        {state.ui.state !== ComponentState.default && <DisableStateLayer onClick={deselectState} >State selected</DisableStateLayer>}
      </ElementsWrapper>
    )
  }
}
export default Background
