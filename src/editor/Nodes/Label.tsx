import { InputNode, Node } from '@src/interfaces'
import state from '@state'
import * as React from 'react'
import styled, { css } from 'styled-components'

const selectComponent = (component: Node) => e => {
  e.preventDefault()
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
  }
}

interface BoxProps {
  component: InputNode
  parent: Node
}

const Label = styled.label`
  transition: all 0.3s;
  position: relative;
  display: grid;
  outline: none;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};

  ${({ component }: BoxProps) =>
    Object.keys(component.hover).length && !state.ui.draggingNodePosition
      ? css`
          &:hover {
            ${() =>
              component.hover.background
                ? css`
                    background: ${({ component }: BoxProps) =>
                      state.colors.find(color => color.id === component.hover.background.colorId).hex};
                  `
                : ''}
            ${() =>
              component.hover.boxShadow
                ? css`
                    box-shadow: ${({ component }: BoxProps) =>
                      component.boxShadow
                        ? state.boxShadow.find(boxShadow => boxShadow.id === component.hover.boxShadow).value
                        : 'none'};
                  `
                : ''}
            ${({ component }: BoxProps) => {
              const border = state.border.find(border => border.id === component.hover.border)
              return border
                ? css`
                    border: ${border.style};
                    border-radius: ${border.radius};
                  `
                : ''
            }};
            
          }
        `
      : ''};
`

const InputWrapper = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto;
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
`

const Input = styled.input`
  transition: all 0.3s;
  position: relative;
  display: grid;
  outline: none;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  padding: ${({ component }: BoxProps) =>
    component.padding
      ? `${component.padding.top} ${component.padding.right} ${component.padding.bottom} ${component.padding.left}`
      : 'none'};
  overflow: ${({ component }: BoxProps) => (component.overflow ? component.overflow : 'normal')};
  background: ${({ component }: BoxProps) =>
    component.background ? state.colors.find(color => color.id === component.background.colorId).hex : 'none'};
  box-shadow: ${({ component }: BoxProps) =>
    component.boxShadow ? state.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value : 'none'};
  ${({ component }: BoxProps) => {
    const border = state.border.find(border => border.id === component.border)
    return border
      ? css`
          border: ${border.style};
          border-radius: ${border.radius};
        `
      : ''
  }};

  ${({ component }: BoxProps) =>
    Object.keys(component.hover).length && !state.ui.draggingNodePosition
      ? css`
          &:hover {
            ${() =>
              component.hover.background
                ? css`
                    background: ${({ component }: BoxProps) =>
                      state.colors.find(color => color.id === component.hover.background.colorId).hex};
                  `
                : ''}
            ${() =>
              component.hover.boxShadow
                ? css`
                    box-shadow: ${({ component }: BoxProps) =>
                      component.boxShadow
                        ? state.boxShadow.find(boxShadow => boxShadow.id === component.hover.boxShadow).value
                        : 'none'};
                  `
                : ''}
            ${({ component }: BoxProps) => {
              const border = state.border.find(border => border.id === component.hover.border)
              return border
                ? css`
                    border: ${border.style};
                    border-radius: ${border.radius};
                  `
                : ''
            }};
            
          }
        `
      : ''};
`

const InputElement = ({ component }: BoxProps) => (
  <Label for={component.id} component={component} onMouseDown={selectComponent(component)}>
    {component.label}
  </Label>
)

export default InputElement
