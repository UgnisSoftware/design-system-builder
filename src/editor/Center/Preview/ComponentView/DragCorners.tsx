import styled from 'styled-components'
import { BoxNode, RootNode, TextNode } from '@src/interfaces'
import * as React from 'react'

const drag = (component: BoxNode | RootNode | TextNode, side: Direction) => e => {
  e.stopPropagation();
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
      width: oldSize.width + diffX * invertDiffX,
      height: oldSize.height + diffY * invertDiffY,
    }
    if (!(newSize.width < 0 || newSize.height < 0)) {
      if (side === Direction.NE || side === Direction.NW || side === Direction.SE || side === Direction.SW) {
        oldSize.width = newSize.width
        oldSize.height = newSize.height
      }
      if (side === Direction.N || side === Direction.S) {
        oldSize.height = newSize.height
      }
      if (side === Direction.W || side === Direction.E) {
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
  transition: border 0.3s;
  border: rgba(0, 0, 0, 0) dashed 1px;
  &:hover {
    border: #565656 dashed 1px;
  }
`

const TopDrag = styled(SideDrag)`
  top: 0px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: n-resize;
`
const BottomDrag = styled(SideDrag)`
  bottom: 0px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: s-resize;
`
const LeftDrag = styled(SideDrag)`
  top: 0px;
  left: 0px;
  width: 12px;
  bottom: 0px;
  cursor: w-resize;
`
const RightDrag = styled(SideDrag)`
  top: 0px;
  right: 0px;
  width: 12px;
  bottom: 0px;
  cursor: e-resize;
`

const CornerDrag = styled.div`
  position: absolute;
  transition: border 0.5s;
  width: 12px;
  height: 12px;
  &:hover {
    border: #565656 dashed 1px;
  }
`
const TopLeftDrag = styled(CornerDrag)`
  top: 0px;
  left: 0px;
  cursor: nw-resize;
`
const TopRightDrag = styled(CornerDrag)`
  top: 0px;
  right: 0px;
  cursor: ne-resize;
`

const BottomLeftDrag = styled(CornerDrag)`
  bottom: 0px;
  left: 0px;
  cursor: sw-resize;
`
const BottomRightDrag = styled(CornerDrag)`
  bottom: 0px;
  right: 0px;
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
  component: RootNode | BoxNode | TextNode
}
const DragCorners = ({ component }: Props) => (
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
