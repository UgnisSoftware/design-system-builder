import state from '@state'
import { ComponentView, IconNode, Node } from '@src/interfaces'
import * as React from 'react'
import styled, { css } from 'styled-components'

interface TextProps {
  component: IconNode
  parent: Node
}

const selectComponent = (component: Node, parent: Node) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
  }
}

const tiltedCSS = css`
  transform: translateX(10px) translateY(-10px);
  box-shadow: -10px 10px 3px -3px rgba(100, 100, 100, 0.5);
`

const IconWrapper = styled.div`
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-column: ${({ component }: TextProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: TextProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  color: ${({ component }: TextProps) => component.fontColorId ? state.colors.find(color => color.id === component.fontColorId).hex : 'black'};
  justify-self: ${({ component }: TextProps) => component.alignment.horizontal};
  align-self: ${({ component }: TextProps) => component.alignment.vertical};
`

const IconComponent = ({ component, parent }: TextProps) => (
  <IconWrapper
    component={component}
    title="Visible"
    className="material-icons"
    onMouseDown={selectComponent(component, parent)}
  >
    {component.iconType} {console.log(component)}
  </IconWrapper>
)

export default IconComponent
