import styled from 'styled-components'
import { Node } from '@src/interfaces'
import * as React from 'react'
import state from '@state'

const drag = (component: Node, side: Direction) => e => {
  e.stopPropagation()
  e.preventDefault()
  let currentX = e.touches ? e.touches[0].pageX : e.pageX
  let currentY = e.touches ? e.touches[0].pageY : e.pageY
  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    const oldSize = component.size

    const invertDiffX = side === Direction.SE || side === Direction.NE || side === Direction.E ? -1 : 1
    const invertDiffY = side === Direction.SE || side === Direction.SW || side === Direction.S ? -1 : 1
    const newSize: Size = {
      width: oldSize.width + (diffX * invertDiffX) / (state.ui.zoom / 100),
      height: oldSize.height + (diffY * invertDiffY) / (state.ui.zoom / 100),
    }
    if (!(newSize.width < 0 || newSize.height < 0)) {
      if (side === Direction.NE) {
        component.position.top -= diffY / (state.ui.zoom / 100)
        oldSize.width = newSize.width
        oldSize.height = newSize.height
      }
      if (side === Direction.NW) {
        component.position.top -= diffY / (state.ui.zoom / 100)
        component.position.left -= diffX / (state.ui.zoom / 100)
        oldSize.width = newSize.width
        oldSize.height = newSize.height
      }
      if (side === Direction.SE) {
        oldSize.width = newSize.width
        oldSize.height = newSize.height
      }
      if (side === Direction.SW) {
        component.position.left -= diffX / (state.ui.zoom / 100)
        oldSize.width = newSize.width
        oldSize.height = newSize.height
      }
      if (side === Direction.N) {
        component.position.top -= diffY / (state.ui.zoom / 100)
        oldSize.height = newSize.height
      }
      if (side === Direction.S) {
        oldSize.height = newSize.height
      }
      if (side === Direction.W) {
        component.position.left -= diffX / (state.ui.zoom / 100)
        oldSize.width = newSize.width
      }
      if (side === Direction.E) {
        oldSize.width = newSize.width
      }
    }
    currentX = newX
    currentY = newY
    return false
  }
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', drag)
  function stopDragging(event) {
    event.preventDefault()
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
  }
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
}

const SideDrag = styled.div`
  position: absolute;
  transition: all 0.3s;
`

const TopDrag = styled(SideDrag)`
  top: -12px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: n-resize;
  border-bottom: #565656 dashed 1px;
`
const BottomDrag = styled(SideDrag)`
  bottom: -12px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: s-resize;
  border-top: #565656 dashed 1px;
`
const LeftDrag = styled(SideDrag)`
  top: 0px;
  left: -12px;
  width: 12px;
  bottom: 0px;
  cursor: w-resize;
  border-right: #565656 dashed 1px;
`
const RightDrag = styled(SideDrag)`
  top: 0px;
  right: -12px;
  width: 12px;
  bottom: 0px;
  cursor: e-resize;
  border-left: #565656 dashed 1px;
`

const CornerDrag = styled.div`
  position: absolute;
  transition: all 0.3s;
  width: 12px;
  height: 12px;
`
const TopLeftDrag = styled(CornerDrag)`
  top: -6px;
  left: -6px;
  cursor: nw-resize;
`
const TopRightDrag = styled(CornerDrag)`
  top: -6px;
  right: -6px;
  cursor: ne-resize;
`

const BottomLeftDrag = styled(CornerDrag)`
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
`
const BottomRightDrag = styled(CornerDrag)`
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
`

enum Direction {
  N = 'N',
  NE = 'NE',
  NW = 'NW',
  W = 'W',
  E = 'E',
  S = 'S',
  SW = 'SW',
  SE = 'SE',
}

interface Size {
  width: number
  height: number
}

interface Props {
  component: Node
}
const DragCorners = ({ component }: Props) =>
  state.ui.selectedNode.id === component.id && (
    <>
      <TopDrag onMouseDown={drag(component, Direction.N)} />
      <LeftDrag onMouseDown={drag(component, Direction.W)} />
      <RightDrag onMouseDown={drag(component, Direction.E)} />
      <BottomDrag onMouseDown={drag(component, Direction.S)} />
      <TopLeftDrag onMouseDown={drag(component, Direction.NW)} />
      <TopRightDrag onMouseDown={drag(component, Direction.NE)} />
      <BottomLeftDrag onMouseDown={drag(component, Direction.SW)} />
      <BottomRightDrag onMouseDown={drag(component, Direction.SE)} />
    </>
  )

export default DragCorners
