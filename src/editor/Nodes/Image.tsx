import * as React from 'react'
import styled, { css } from 'styled-components'
import state from '@state'
import { ImageNode, Nodes, ObjectFit } from '@src/Interfaces/nodes'

interface BoxProps {
  component: ImageNode
  parent: Nodes
}

const selectComponent = (component: Nodes, parent: Nodes) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
    if (state.ui.editingBoxNode !== component) {
      state.ui.editingBoxNode = null
    }

    let currentX = e.touches ? e.touches[0].pageX : e.pageX
    let currentY = e.touches ? e.touches[0].pageY : e.pageY
    function drag(e) {
      e.preventDefault()
      const newX = e.touches ? e.touches[0].pageX : e.pageX
      const newY = e.touches ? e.touches[0].pageY : e.pageY
      const diffX = currentX - newX
      const diffY = currentY - newY

      if (!state.ui.draggingNodePosition) {
        // don't drag immediately
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
          return
        }
        state.ui.draggingNodePosition = {
          x: 0,
          y: 0,
        }
      }
      state.ui.draggingNodePosition.y -= diffY
      state.ui.draggingNodePosition.x -= diffX
      currentX = newX
      currentY = newY
      return false
    }
    window.addEventListener('mousemove', drag)
    window.addEventListener('touchmove', drag)
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)
    function stopDragging(event) {
      event.preventDefault()
      state.ui.draggingNodePosition = null
      if (state.ui.hoveredCell && parent) {
        const nodeIndex = parent.children.indexOf(component)
        parent.children.splice(nodeIndex, 1)
        component.position = {
          columnStart: state.ui.hoveredCell.colIndex + 1,
          columnEnd: state.ui.hoveredCell.colIndex + 1 + component.position.columnEnd - component.position.columnStart,
          rowStart: state.ui.hoveredCell.rowIndex + 1,
          rowEnd: state.ui.hoveredCell.rowIndex + 1 + component.position.rowEnd - component.position.rowStart,
        }
        state.ui.hoveredCell.component.children.push(component)
        state.ui.hoveredCell = null
      }
      window.removeEventListener('mousemove', drag)
      window.removeEventListener('touchmove', drag)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('touchend', stopDragging)
      return false
    }
    return false
  }
}

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

const Image = styled.div`
  transition: all 0.3s;
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  padding: ${({ component }: BoxProps) =>
    component.padding
      ? `${component.padding.top} ${component.padding.right} ${component.padding.bottom} ${component.padding.left}`
      : 'none'};
  background: ${({ component }: BoxProps) => `url(${component.imageUrl})`};
  background-size: ${({ component }: BoxProps) =>
    component.objectFit === ObjectFit.fill ? '100% 100%' : component.objectFit};
  box-shadow: ${({ component }: BoxProps) =>
    component.boxShadow ? state.styles.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value : 'none'};
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

const ImageComponent = ({ component, parent }: BoxProps) => (
  <Image
    parent={parent}
    component={component}
    onMouseDown={selectComponent(component, parent)}
    style={stylesForSelected(component)}
  />
)

export default ImageComponent
