import * as React from 'react'
import { Node, NodeTypes, ComponentView } from '@src/interfaces'
import state from '@state'
import styled, { css } from 'styled-components'
import DragCorners from '@src/editor/Center/Preview/ComponentView/DragCorners'
import ClickOutside from 'react-click-outside'

const selectComponent = (component: Node) => e => {
  e.preventDefault()
  e.stopPropagation()
  state.ui.selectedNode = component
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
          fontSize: state.font.sizes[component.fontSize].fontSize,
        }}
        defaultValue={component.text}
        onChange={changeText(component)}
      />
    </ClickOutside>
  ) : (
    <TextWrapper
      style={{
        fontSize: state.font.sizes[component.fontSize].fontSize,
      }}
      onDoubleClick={editText(component)}
    >
      {component.text}
      <DragCorners component={component} />
    </TextWrapper>
  )

interface BoxProps {
  component: Node
}
const Boxxy = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  grid-gap: 16px;
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  transition: transform 0.3s, box-shadow 0.3s;
  background: ${({ component }: BoxProps) => state.colors.find((color) => color.id === component.background.colorId).hex};
`

const BoxComponent = ({ component }: BoxProps) => (
  <Boxxy component={component} onMouseDown={selectComponent(component)}>
    {component.children.map(child => (
      <Component component={child} />
    ))}
    <DragCorners component={component} />
  </Boxxy>
)

interface Props {
  component: Node
}
function Component({ component }: Props) {
  if (component.type === NodeTypes.Box) {
    return <BoxComponent component={component} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextComponent component={component} />
  }
}

export default Component
