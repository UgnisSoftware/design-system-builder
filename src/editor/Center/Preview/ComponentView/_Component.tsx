import * as React from 'react'
import { Node, NodeTypes, ComponentView } from '@src/interfaces'
import state from '@state'
import styled, { css } from 'styled-components'
import RootComponent from "./Root";
import DragCorners from "@src/editor/Center/Preview/ComponentView/DragCorners";

export const startComponentDrag = component => e => {
  state.ui.selectedNode = component
  e.preventDefault()
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

const TextWrapper = styled.div`
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  transition: transform 0.3s, box-shadow 0.3s;
`

interface TextProps {
  component: Node
}
const TextComponent = ({ component }: TextProps) => (
  <TextWrapper
    style={{
      position: 'absolute',
      top: component.position.top,
      left: component.position.left,
      width: component.size.width,
      height: component.size.height,
      fontSize: state.font.sizes[component.fontSize].fontSize,
    }}
    onMouseDown={startComponentDrag(component)}
  >
    {component.text}
    <DragCorners component={component}/>
  </TextWrapper>
)

const Boxxy = styled.div`
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  transition: transform 0.3s, box-shadow 0.3s;
`

interface BoxProps {
  component: Node
}
const BoxComponent = ({ component }: BoxProps) => (
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
    <DragCorners component={component}/>
  </Boxxy>
)

interface Props {
  component: Node
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
