import state from '@state'
import { ComponentView } from '@src/Interfaces/components'
import * as React from 'react'
import styled, { css } from 'styled-components'
import { Nodes, TextNode } from '@src/Interfaces/nodes'

interface TextProps {
  component: TextNode
  parent: Nodes
}

const selectComponent = (component: Nodes, parent: Nodes) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
  }
}

const tiltedCSS = css`
  transform: translateX(10px) translateY(-10px);
  box-shadow: -10px 10px 3px -3px rgba(100, 100, 100, 0.5);
`

const TextWrapper = styled.div`
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-column: ${({ component }: TextProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: TextProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  overflow: ${({ component }: TextProps) => (component.overflow ? component.overflow : 'normal')};
  justify-self: ${({ component }: TextProps) => component.alignment.horizontal};
  align-self: ${({ component }: TextProps) => component.alignment.vertical};
  font-size: ${({ component }: TextProps) => state.font.sizes[component.fontSize].fontSize};
  color: ${({ component }: TextProps) => component.fontColorId ? state.colors.find(color => color.id === component.fontColorId).hex : 'black'};
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  overflow-wrap: break-word;
`

const stylesForSelected = (component: Nodes) => {
  if (state.ui.selectedNode !== component || !state.ui.draggingNodePosition) {
    return null
  }

  return {
    transition: 'none',
    zIndex: 999999,
    pointerEvents: 'none',
    opacity: '0.75',
    transform: `translateX(${state.ui.draggingNodePosition.x}px) translateY(${state.ui.draggingNodePosition.y}px)`,
  }
}

const editText = (component: Nodes) => () => {
  state.ui.editingTextNode = component
}

const TextComponent = ({ component, parent }: TextProps) => (
  <TextWrapper
    style={stylesForSelected(component)}
    component={component}
    parent={parent}
    onMouseDown={selectComponent(component, parent)}
    onDoubleClick={editText(component)}
  >
    {component.text}
  </TextWrapper>
)

export default TextComponent
