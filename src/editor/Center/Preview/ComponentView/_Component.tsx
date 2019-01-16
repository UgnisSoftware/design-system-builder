import * as React from 'react'
import { Node, NodeTypes, ComponentView } from '@src/interfaces'
import state from '@state'
import styled, { css } from 'styled-components'
import DragCorners from '@src/editor/Center/Preview/ComponentView/DragCorners'
import ClickOutside from 'react-click-outside'

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
    component.position.top -= diffY / (state.ui.zoom / 100)
    component.position.left -= diffX / (state.ui.zoom / 100)
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
  overflow-wrap: break-word;
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  transition: transform 0.3s, box-shadow 0.3s;
`

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
}
const TextComponent = ({ component }: TextProps) =>
  state.ui.editingTextNode === component ? (
    <ClickOutside onClickOutside={stopEdit} key={component.id}>
      <EmptyTextArea
        style={{
          position: 'absolute',
          top: component.position.top,
          left: component.position.left,
          width: component.size.width,
          height: component.size.height,
          fontSize: state.font.sizes[component.fontSize].fontSize,
        }}
        defaultValue={component.text}
        onChange={changeText(component)}
      />
    </ClickOutside>
  ) : (
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
      onDoubleClick={editText(component)}
    >
      {component.text}
      <DragCorners component={component} />
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
    <DragCorners component={component} />
  </Boxxy>
)

const ComponentWrapper = styled.div`
  position: relative;
  height: 320px;
`

const ComponentClickCatcher = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

interface ComponentProps {
  component: Node
}
const ComponentComponent = ({ component }: ComponentProps) => (
  <ComponentWrapper
    style={{
      position: 'absolute',
      top: component.position.top,
      left: component.position.left,
      width: component.size.width,
      height: component.size.height,
    }}
  >
    {state.components[component.id].nodes.map(node => (
      <Component component={node} />
    ))}
    <ComponentClickCatcher onMouseDown={startComponentDrag(component)} />
  </ComponentWrapper>
)

interface Props {
  component: Node
}
function Component({ component }: Props) {
  if (component.type === NodeTypes.Component) {
    return <ComponentComponent component={component} />
  }
  if (component.type === NodeTypes.Box) {
    return <BoxComponent component={component} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextComponent component={component} />
  }
}

export default Component
