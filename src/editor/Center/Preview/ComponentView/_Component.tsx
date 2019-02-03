import * as React from 'react'
import { ComponentView, Node, NodeTypes, ObjectFit } from '@src/interfaces'
import state from '@state'
import styled, { css } from 'styled-components'
import DragCorners from '@src/editor/Center/Preview/ComponentView/DragCorners'
import ClickOutside from 'react-click-outside'

const selectComponent = (component: Node) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
    if (state.ui.editingBoxNode !== component) {
      state.ui.editingBoxNode = null
    }
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
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  overflow: ${({ component }: BoxProps) => (component.overflow ? component.overflow : 'normal')};
  justify-self: ${({ component }: BoxProps) => component.alignment.horizontal};
  align-self: ${({ component }: BoxProps) => component.alignment.vertical};
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  overflow-wrap: break-word;
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
  all: unset;
  transition: all 0.3s;
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  overflow: ${({ component }: BoxProps) => (component.overflow ? component.overflow : 'normal')};
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
}
const TextComponent = ({ component }: TextProps) =>
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
      component={component}
      style={{
        fontSize: state.font.sizes[component.fontSize].fontSize,
      }}
      onMouseDown={selectComponent(component)}
      onDoubleClick={editText(component)}
    >
      {component.text}
    </TextWrapper>
  )

const editBox = (component: Node) => e => {
  if (e.currentTarget === e.target) {
    state.ui.editingBoxNode = component
  }
}

interface BoxProps {
  component: Node
}

const Boxxy = styled.div`
  transition: all 0.3s;
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  padding: ${({ component }: BoxProps) =>
    component.padding
      ? `${component.padding.top} ${component.padding.right} ${component.padding.bottom} ${component.padding.left}`
      : 'none'};
  overflow: ${({ component }: BoxProps) => (component.overflow ? component.overflow : 'normal')};
  background: ${({ component }: BoxProps) =>
    component.background ? state.colors.find(color => color.id === component.background.colorId).hex : 'none'};
  box-shadow: ${({ component }: BoxProps) =>
    component.boxShadow ? state.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value : 'none'};
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  ${({ component }: BoxProps) => {
    const border = state.border.find(border => border.id === component.border)
    return border
      ? css`
          border: ${border.style};
          border-radius: ${border.radius};
        `
      : ''
  }};
`

const BoxComponent = ({ component }: BoxProps) => (
  <Boxxy component={component} onMouseDown={selectComponent(component)} onDoubleClick={editBox(component)}>
    {component.children.map(child => (
      <Component component={child} />
    ))}
    <DragCorners component={component} />
  </Boxxy>
)

const Image = styled.div`
  transition: all 0.3s;
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: BoxProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: BoxProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: BoxProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: BoxProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  padding: ${({ component }: BoxProps) =>
    component.padding
      ? `${component.padding.top} ${component.padding.right} ${component.padding.bottom} ${component.padding.left}`
      : 'none'};
  background: ${({ component }: BoxProps) => `url(${component.imageUrl})`};
  background-size: ${({ component }: BoxProps) => component.objectFit === ObjectFit.fill ? "100% 100%" : component.objectFit};
  box-shadow: ${({ component }: BoxProps) =>
    component.boxShadow ? state.boxShadow.find(boxShadow => boxShadow.id === component.boxShadow).value : 'none'};
  ${() => (state.ui.componentView === ComponentView.Tilted ? tiltedCSS : '')};
  ${({ component }: BoxProps) => {
    const border = state.border.find(border => border.id === component.border)
    return border
      ? css`
          border: ${border.style};
          border-radius: ${border.radius};
        `
      : ''
  }};
`

const ImageComponent = ({ component }: BoxProps) => (
  <Image component={component} onMouseDown={selectComponent(component)} onDoubleClick={editBox(component)}>
    {component.children.map(child => (
      <Component component={child} />
    ))}
    <DragCorners component={component} />
  </Image>
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
  if (component.type === NodeTypes.Image) {
    return <ImageComponent component={component} />
  }
}

export default Component
