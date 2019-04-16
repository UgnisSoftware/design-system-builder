import { InputNode, Nodes } from '@src/Interfaces/nodes'
import state from '@state'
import * as React from 'react'
import styled, { css } from 'styled-components'

const selectComponent = (component: Nodes) => e => {
  e.preventDefault()
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
  }
}

interface BoxProps {
  component: InputNode
  parent: Nodes
}

const Input = styled.input`
  transition: all 0.3s;
  position: relative;
  display: grid;
  outline: none;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  background: ${({ component }: BoxProps) =>
    component.backgroundColorId
      ? state.styles.colors.find(color => color.id === component.backgroundColorId).hex
      : 'none'};
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

const InputElement = ({ component }: BoxProps) => (
  <Input id={component.id} component={component} onMouseDown={selectComponent(component)} />
)

export default InputElement
