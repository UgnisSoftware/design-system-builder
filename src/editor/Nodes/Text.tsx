import state from '@state'
import { ComponentView, Node, TextNode } from '@src/interfaces'
import * as React from 'react'
import styled, { css } from 'styled-components'

interface TextProps {
  component: TextNode
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

const TextWrapper = styled.div`
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-template-columns: ${({ component }: TextProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: TextProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: TextProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: TextProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  overflow: ${({ component }: TextProps) => (component.overflow ? component.overflow : 'normal')};
  justify-self: ${({ component }: TextProps) => component.alignment.horizontal};
  align-self: ${({ component }: TextProps) => component.alignment.vertical};
  font-size: ${({ component }: TextProps) => state.font.sizes[component.fontSize].fontSize};
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  overflow-wrap: break-word;
`

const stylesForSelected = (component: Node) => {
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

const editText = (component: Node) => () => {
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
