import state from '@state'
import { BoxNode, ComponentView, Node } from '@src/interfaces'
import * as React from 'react'
import DragCorners from '@src/editor/Components/DragCorners'
import styled, { css } from 'styled-components'
import ClickOutside from 'react-click-outside'

interface BoxProps {
  component: BoxNode
  parent: Node
}

const selectComponent = (component: Node, parent: Node) => e => {
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

const tiltedCSS = css`
  transform: translateX(10px) translateY(-10px);
  box-shadow: -10px 10px 3px -3px rgba(100, 100, 100, 0.5);
`

const TextWrapper = styled.div`
  transition: all 0.3s;
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  overflow: ${({ component }: BoxProps) => (component.overflow ? component.overflow : 'normal')};
  justify-self: ${({ component }: BoxProps) => component.alignment.horizontal};
  align-self: ${({ component }: BoxProps) => component.alignment.vertical};
  font-size: ${({ component }: BoxProps) => state.font.sizes[component.fontSize].fontSize};
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
const stopEdit = () => {
  state.ui.editingTextNode = null
}
const changeText = (component: Node) => (e: React.ChangeEvent<HTMLInputElement>) => {
  component.text = e.target.value
}

const EmptyTextArea = styled.textarea`
  transition: all 0.3s;
  all: unset;
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  overflow: ${({ component }: BoxProps) => (component.overflow ? component.overflow : 'normal')};
  font-size: ${({ component }: BoxProps) => state.font.sizes[component.fontSize].fontSize};
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  border: none;
  overflow: auto;
  outline: none;
  background: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  padding: 0;
  resize: none; /*remove the resize handle on the bottom right*/
`

interface TextProps {
  component: Node
  parent: Node
}
const TextComponent = ({ component, parent }: TextProps) =>
  state.ui.editingTextNode === component ? (
    <ClickOutside
      onClickOutside={stopEdit}
      key={component.id}
      style={{
        display: 'contents',
      }}
    >
      <EmptyTextArea
        component={component}
        style={{
          fontSize: state.font.sizes[component.fontSize].fontSize,
        }}
        defaultValue={component.text}
        onChange={changeText(component)}
      />
    </ClickOutside>
  ) : (
    <TextWrapper
      style={stylesForSelected(component)}
      component={component}
      parent={parent}
      onMouseDown={selectComponent(component, parent)}
      onDoubleClick={editText(component)}
    >
      {component.text}
      <DragCorners component={component} parent={parent} />
    </TextWrapper>
  )

export default TextComponent
