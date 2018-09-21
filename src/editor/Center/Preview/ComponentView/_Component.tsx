import * as React from 'react'
import { BoxNode, TextNode, NodeTypes, RootNode, ComponentView } from '@src/interfaces'
import state from '@state'
import styled, { css } from 'styled-components'
import { view } from 'react-easy-state/dist/es.es6'

export const startComponentDrag = component => e => {
  e.preventDefault()
  e.persist()
  let currentX = e.touches ? e.touches[0].pageX : e.pageX
  let currentY = e.touches ? e.touches[0].pageY : e.pageY
  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    const root = state.components[state.router.componentId].root
    const id = root.children.findIndex(child => child.id === component.id)
    root.children[id].position.top -= diffY
    root.children[id].position.left -= diffX
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
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

const tiltedCSS = css`
  transform: translateX(10px) translateY(-10px);
  box-shadow: -10px 10px 3px -3px rgba(100, 100, 100, 0.5);
`

const TextWrapper = styled.span`
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  transition: transform 0.3s, box-shadow 0.3s;
`

interface TextProps {
  component: TextNode
}
const TextComponent = view(({ component }: TextProps) => (
  <TextWrapper
    style={{
      position: 'absolute',
      top: component.position.top,
      left: component.position.left,
      fontSize: state.font.sizes[component.fontSize].fontSize,
    }}
    onMouseDown={startComponentDrag(component)}
  >
    {component.text}
  </TextWrapper>
))

const Boxxy = styled.div`
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  transition: transform 0.3s, box-shadow 0.3s;
`

interface BoxProps {
  component: BoxNode
}
const BoxComponent = view(({ component }: BoxProps) => (
  <Boxxy
    style={{
      position: 'absolute',
      top: component.position.top,
      left: component.position.left,
      width: component.size.width,
      height: component.size.height,
      background: component.background.color,
    }}
    onMouseDown={startComponentDrag(component)}
  >
    {component.children.map(component => (
      <Component key={component.id} component={component} />
    ))}
  </Boxxy>
))

const X = styled.div`
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%) translateY(-100%);
`
const Y = styled.div`
  position: absolute;
  top: 50%;
  left: -8px;
  transform: translateY(-50%) translateX(-100%);
`

const TopDrag = styled.div`
  position: absolute;
  top: -10px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: n-resize;
`
const BottomDrag = styled.div`
  position: absolute;
  bottom: -10px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: s-resize;
`
const LeftDrag = styled.div`
  position: absolute;
  top: 0px;
  left: -10px;
  width: 12px;
  bottom: 0px;
  cursor: w-resize;
`
const RightDrag = styled.div`
  position: absolute;
  top: 0px;
  right: -10px;
  width: 12px;
  bottom: 0px;
  cursor: e-resize;
`

const TopLeftDrag = styled.div`
  position: absolute;
  top: -13px;
  left: -13px;
  width: 15px;
  height: 15px;
  cursor: nw-resize;
`
const TopRightDrag = styled.div`
  position: absolute;
  top: -13px;
  right: -13px;
  width: 15px;
  height: 15px;
  cursor: ne-resize;
`

const BottomLeftDrag = styled.div`
  position: absolute;
  bottom: -13px;
  left: -13px;
  width: 15px;
  height: 15px;
  cursor: sw-resize;
`
const BottomRightDrag = styled.div`
  position: absolute;
  bottom: -13px;
  right: -13px;
  width: 15px;
  height: 15px;
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

const drag = (side: Direction) => e => {
  e.preventDefault()
  e.persist()
  let currentX = e.touches ? e.touches[0].pageX : e.pageX
  let currentY = e.touches ? e.touches[0].pageY : e.pageY
  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    const root = state.components[state.router.componentId].root
    const oldSize = root.size

    const invertDiffX = side === Direction.SE || side === Direction.NE || side === Direction.E ? -1 : 1
    const invertDiffY = side === Direction.SE || side === Direction.SW || side === Direction.S ? -1 : 1
    const newSize: Size = {
      width: oldSize.width + diffX * 2 * invertDiffX,
      height: oldSize.height + diffY * 2 * invertDiffY,
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

const Rooty = styled.div`
  position: relative;
  transition: transform 0.3s;
  transform: ${() => (state.ui.componentView === ComponentView.Tilted ? `rotateY(30deg) rotateX(30deg)` : 'none')};
`

interface RootProps {
  component: RootNode
}
const RootComponent = view(({ component }: RootProps) => (
  <Rooty id="_rootComponent">
    <X>{component.size.width}</X>
    <Y>{component.size.height}</Y>
    <TopDrag onMouseDown={drag(Direction.N)} />
    <LeftDrag onMouseDown={drag(Direction.W)} />
    <RightDrag onMouseDown={drag(Direction.E)} />
    <BottomDrag onMouseDown={drag(Direction.S)} />
    <TopLeftDrag onMouseDown={drag(Direction.NW)} />
    <TopRightDrag onMouseDown={drag(Direction.NE)} />
    <BottomLeftDrag onMouseDown={drag(Direction.SW)} />
    <BottomRightDrag onMouseDown={drag(Direction.SE)} />
    <div
      style={{
        position: 'relative',
        width: component.size.width,
        height: component.size.height,
        background: component.background.color,
      }}
    >
      {component.children.map(component => (
        <Component key={component.id} component={component} />
      ))}
    </div>
  </Rooty>
))

interface Props {
  component: RootNode | BoxNode | TextNode
}
const Component = ({ component }: Props) => {
  if (component.type === NodeTypes.Root) {
    return <RootComponent component={component} />
  }
  if (component.type === NodeTypes.Box) {
    return <BoxComponent component={component} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextComponent component={component} />
  }
}

export default Component
