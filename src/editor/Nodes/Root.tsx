import { Node, RootNode } from '@src/interfaces'
import state from '@state'
import * as React from 'react'
import styled, { css } from 'styled-components'

const selectComponent = (component: Node) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
  }
}

interface RootProps {
  component: RootNode
  children: React.ReactNode
}

const RootWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: RootProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: RootProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  padding: ${({ component }: RootProps) =>
    component.padding
      ? `${component.padding.top} ${component.padding.right} ${component.padding.bottom} ${component.padding.left}`
      : 'none'};
  overflow: ${({ component }: RootProps) => (component.overflow ? component.overflow : 'normal')};
  background: ${({ component }: RootProps) =>
    component.background ? state.colors.find(color => color.id === component.background.colorId).hex : 'none'};
  box-shadow: ${({ component }: RootProps) =>
    component.boxShadow ? state.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value : 'none'};
  ${({ component }: RootProps) => {
    const border = state.border.find(border => border.id === component.border)
    return border
      ? css`
          border: ${border.style};
          border-radius: ${border.radius};
        `
      : ''
  }};
`

const componentToStyle = (component: RootNode) => {
  if (state.ui.selectedNode === component && state.ui.stateManager) {
    return { ...component, ...component[state.ui.stateManager] }
  }
  return component
}

const Root = ({ component, children }: RootProps) => (
  <RootWrapper parent={parent} component={componentToStyle(component)} onMouseDown={selectComponent(component)}>
    {children}
  </RootWrapper>
)

export default Root
