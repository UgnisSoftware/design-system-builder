import state from '@state'
import * as React from 'react'
import styled, { css } from 'styled-components'
import { BoxNode, ObjectFit, RootNode } from '@src/Interfaces/nodes'
import { selectComponent } from '@src/editor/Nodes/_utils'

interface BoxProps {
  component: BoxNode
  parent: RootNode
}

const BoxAtom = styled.div`
  transition: all 0.3s;
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  box-shadow: ${({ component }: BoxProps) =>
    component.boxShadow
      ? state.styles.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value
      : 'none'};
  ${({ component }: BoxProps) => {
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
        background: ${state.styles.colors.find(color => color.id === component.backgroundColorId).hex};
      `
    }
  }}
  ${({ component }: BoxProps) => {
    const border = state.styles.border.find(border => border.id === component.border)
    return border
      ? css`
          border: ${border.style};
          border-radius: ${border.radius};
        `
      : ''
  }};
`

const BoxComponent = ({ component, parent }: BoxProps) => (
  <BoxAtom parent={parent} component={component} onMouseDown={selectComponent(component, parent)} />
)

export default BoxComponent
