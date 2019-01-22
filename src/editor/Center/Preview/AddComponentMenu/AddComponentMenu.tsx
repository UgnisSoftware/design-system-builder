import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Component as ComponentInterface, FontSizeName, NodeTypes, RouterPaths, Node, Units } from '@src/interfaces'
import Component from '@src/editor/Center/Preview/ComponentView/_Component'
import { uuid } from '@src/editor/utils'

const Menu = styled.div`
  background: rgba(244, 255, 244, 0.6);
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 24px;
  user-select: none;
`

const Title = styled.div`
  padding-left: 8px;
  display: flex;
  transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  opacity: 0;
`

const Box = styled.div`
  background: #90ccf4;
  width: 162px;
  height: 100px;
`

const ComponentWrapper = styled.div`
  position: relative;
  height: 320px;

  &:hover ${Title} {
    opacity: 1;
  }
`

const Text = styled.span`
  font-size: 38px;
`

const ComponentClickCatcher = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

const addComponent = (type: NodeTypes, component?: ComponentInterface) => (
  event: React.MouseEvent & React.TouchEvent,
) => {
  event.stopPropagation()
  event.persist()
  const box = (event.target as HTMLDivElement).getBoundingClientRect()
  const newId = uuid()

  // state.components[state.router.componentId].nodes.push(newNode)
  let currentX = event.touches ? event.touches[0].pageX : event.pageX
  let currentY = event.touches ? event.touches[0].pageY : event.pageY

  state.ui.showAddComponentMenu = false
  state.ui.addingAtom = {
    type: NodeTypes.Box,
    position: {
      x: currentX - box.left,
      y: currentY - box.top,
    },
  }

  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    state.ui.addingAtom.position.y -= diffY / (state.ui.zoom / 100)
    state.ui.addingAtom.position.x -= diffX / (state.ui.zoom / 100)
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

    if (state.ui.hoveredCell) {
      state.ui.hoveredCell.component.children.push({
        id: newId,
        type: NodeTypes.Box,
        position: {
          columnStart: state.ui.hoveredCell.colIndex+1,
          columnEnd: state.ui.hoveredCell.colIndex+2,
          rowStart: state.ui.hoveredCell.rowIndex+1,
          rowEnd: state.ui.hoveredCell.rowIndex+2,
        },
        columns: [
          {
            value: 1,
            unit: Units.Fr,
          },
        ],
        rows: [
          {
            value: 1,
            unit: Units.Fr,
          },
        ],
        children: [],
        background: {
          colorId: 'dddd-4444',
        },
      })
    }
    state.ui.addingAtom = null
    state.ui.hoveredCell = null
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

export default () => {
  return (
    <Menu>
      <ComponentWrapper>
        <Box onMouseDown={addComponent(NodeTypes.Box)} />
        <Title>Box</Title>
      </ComponentWrapper>
      <ComponentWrapper>
        <Text onMouseDown={addComponent(NodeTypes.Text)}>Hello</Text>
        <Title>Text</Title>
      </ComponentWrapper>
    </Menu>
  )
}
