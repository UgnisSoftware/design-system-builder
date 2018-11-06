import state from '@state'
import styled from 'styled-components'
import { ComponentView, RootNode } from '@src/interfaces'
import * as React from 'react'
import Component from '@src/editor/Center/Preview/ComponentView/_Component'
import DragCorners from '@src/editor/Center/Preview/ComponentView/DragCorners'

const Rooty = styled.div`
  position: relative;
  transition: transform 0.3s;
  transform: ${() => (state.ui.componentView === ComponentView.Tilted ? `rotateY(30deg) rotateX(30deg)` : 'none')};
`

const selectRoot = (component: RootNode) => (e) => {
  if(e.target === this){
    state.ui.selectedNodeId = component.id
  }
}

interface RootProps {
  component: RootNode
}
const RootComponent = ({ component }: RootProps) => (
  <Rooty id="_rootComponent">
    <div
      style={{
        position: 'relative',
        width: component.size.width,
        height: component.size.height,
        background: component.background.color,
      }}
      onClick={selectRoot(component)}
    >
      {component.children.map(component => (
        <Component key={component.id} component={component} />
      ))}
      <DragCorners component={component} />
    </div>
  </Rooty>
)

export default RootComponent
