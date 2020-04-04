import { ElementNode, InputNode } from '@src/interfaces/nodes'
import stateSettings from '@state/settings'
import * as React from 'react'
import styled, { css } from 'styled-components'
import { selectComponent } from '@src/actions'

interface BoxProps {
  component: InputNode
  parent?: ElementNode
  tilted: boolean
  index: number
}

const Input = styled.input`
  transition: all 0.3s;
  position: relative;
  display: grid;
  outline: none;

  background: ${({ component }: BoxProps) =>
    component.backgroundColorId
      ? stateSettings.colors.find((color) => color.id === component.backgroundColorId).hex
      : 'none'};
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
  box-shadow: ${({ tilted }) => (tilted ? `-10px 10px 3px -3px rgba(100, 100, 100, 0.5)` : '')};
`

const InputElement = ({ component, parent, tilted, index }: BoxProps) => (
  <Input
    id={component.id}
    component={component}
    onMouseDown={selectComponent(component, parent)}
    tilted={tilted}
    index={index}
  />
)

export default InputElement
