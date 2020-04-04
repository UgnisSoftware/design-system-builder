import stateSettings from '@state/settings'
import stateUi from '@state/ui'
import * as React from 'react'
import styled, { css } from 'styled-components'
import { BoxNode, ElementNode, ObjectFit } from '@src/interfaces/nodes'
import { selectComponent } from '@src/actions'
import { getSelectedNode } from '@src/utils'

interface BoxProps {
  component: BoxNode
  parent?: ElementNode
  tilted: boolean
  index: number
}

const BoxAtom = styled.div`
  transition: all 0.3s;
  justify-self: stretch;
  align-self: stretch;
  grid-column: ${({ component }: BoxProps) => `${component.columnStart} / ${component.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.rowStart} / ${component.rowEnd}`};
  box-shadow: ${({ component, tilted }: BoxProps) =>
    tilted
      ? `-10px 10px 3px -3px rgba(100, 100, 100, 0.5)`
      : component.boxShadow
      ? stateSettings.boxShadow.find((boxShadow) => boxShadow.id === component.boxShadow).value
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
        background: ${stateSettings.colors.find((color) => color.id === component.backgroundColorId).hex};
      `
    }
  }}
  ${({ component }: BoxProps) => {
    const border = stateSettings.border.find((border) => border.id === component.border)
    return border
      ? css`
          border: ${border.style};
          border-radius: ${border.radius};
        `
      : ''
  }};
  transform: ${({ tilted, index }) =>
    tilted ? `translateZ(0) translateX(${10 * index}px) translateY(-${10 * index}px)` : ''};
`
const componentToStyle = (component: BoxNode) => {
  if (stateUi.selectedNode && stateUi.selectedNode.id === component.id && stateUi.stateManager) {
    return getSelectedNode()
  }
  return component
}

const BoxComponent = ({ component, parent, tilted, index }: BoxProps) => (
  <BoxAtom
    component={componentToStyle(component)}
    onMouseDown={selectComponent(component, parent)}
    tilted={tilted}
    index={index}
  />
)

export default BoxComponent
