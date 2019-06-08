import { ElementNode, ObjectFit, RootNode } from '@src/interfaces/nodes'
import state from '@state'
import * as React from 'react'
import styled, { css } from 'styled-components'
import { selectComponent } from '@src/actions'

interface RootProps {
  component: RootNode
  parent: ElementNode | null
  children: React.ReactNode
}

const RootWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: RootProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: RootProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: RootProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: RootProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  overflow: ${({ component }: RootProps) => (component.overflow ? component.overflow : 'normal')};
  box-shadow: ${({ component }: RootProps) =>
    component.boxShadow
      ? state.settings.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value
      : 'none'};
  ${({ component }: RootProps) => {
    if (component.backgroundImageUrl) {
      return css`
        background: url(${component.backgroundImageUrl});
        background-size: ${component.backgroundImagePosition !== ObjectFit.fill
          ? component.backgroundImagePosition
          : '100% 100%'};
      `
    }
    if (component.backgroundColorId) {
      return css`
        background: ${state.settings.colors.find(color => color.id === component.backgroundColorId).hex};
      `
    }
  }}
  ${({ component }: RootProps) => {
    const border = state.settings.border.find(border => border.id === component.border)
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

const Root = ({ component, parent, children }: RootProps) => (
  <RootWrapper parent={parent} component={componentToStyle(component)} onMouseDown={selectComponent(component, parent)}>
    {children}
  </RootWrapper>
)

export default Root
