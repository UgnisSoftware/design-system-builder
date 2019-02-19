import * as React from 'react'
import { ComponentView, DragDirection, Node, NodeTypes, ObjectFit } from '@src/interfaces'
import state from '@state'
import styled, { css } from 'styled-components'
import DragCorners from './DragCorners'
import ClickOutside from 'react-click-outside'

const selectComponent = (component: Node, parent: Node) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = component
    if (state.ui.editingBoxNode !== component) {
      state.ui.editingBoxNode = null
    }

    let currentX = e.touches ? e.touches[0].pageX : e.pageX
    let currentY = e.touches ? e.touches[0].pageY : e.pageY
    function drag(e) {
      if (!state.ui.draggingNodePosition) {
        state.ui.draggingNodePosition = {
          x: 0,
          y: 0,
        }
      }
      e.preventDefault()
      const newX = e.touches ? e.touches[0].pageX : e.pageX
      const newY = e.touches ? e.touches[0].pageY : e.pageY
      const diffX = currentX - newX
      const diffY = currentY - newY

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
      onMouseDown={selectComponent(component, parent)}
      onDoubleClick={editText(component)}
    >
      {component.text}
      <DragCorners component={component} parent={parent} />
    </TextWrapper>
  )

const editBox = (component: Node) => e => {
  if (e.currentTarget === e.target) {
    state.ui.editingBoxNode = component
  }
}

interface BoxProps {
  component: Node
  parent: Node
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

  ${({ component }: BoxProps) =>
    Object.keys(component.hover).length && !state.ui.draggingNodePosition
      ? css`
          &:hover {
            ${() =>
              component.hover.background
                ? css`
                    background: ${({ component }: BoxProps) =>
                      state.colors.find(color => color.id === component.hover.background.colorId).hex};
                  `
                : ''}
            ${() =>
              component.hover.boxShadow
                ? css`
                    box-shadow: ${({ component }: BoxProps) =>
                      component.boxShadow
                        ? state.boxShadow.find(boxShadow => boxShadow.id === component.hover.boxShadow).value
                        : 'none'};
                  `
                : ''}
            ${({ component }: BoxProps) => {
              const border = state.border.find(border => border.id === component.hover.border)
              return border
                ? css`
                    border: ${border.style};
                    border-radius: ${border.radius};
                  `
                : ''
            }};
            
          }
        `
      : ''};
`
interface BorderProps {
  col: number
  row: number
}

const Border = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  border: #565656 dashed 1px;
  user-select: none;
  z-index: 999999;
`

const changeGridSize = (rowIndex: number, colIndex: number) => () => {
  const direction = state.ui.expandingNode.direction
  const position = state.ui.expandingNode.node.position
  const columnPositive = [DragDirection.E, DragDirection.SE, DragDirection.NE].includes(direction)
  const columnNegative = [DragDirection.W, DragDirection.SW, DragDirection.NW].includes(direction)
  const rowPositive = [DragDirection.S, DragDirection.SW, DragDirection.SE].includes(direction)
  const rowNegative = [DragDirection.N, DragDirection.NE, DragDirection.NW].includes(direction)
  if (columnPositive && colIndex + 2 > position.columnStart) {
    position.columnEnd = colIndex + 2
  }
  if (columnNegative && colIndex + 1 < position.columnEnd) {
    position.columnStart = colIndex + 1
  }
  if (rowPositive && rowIndex + 2 > position.rowStart) {
    position.rowEnd = rowIndex + 2
  }
  if (rowNegative && rowIndex + 1 < position.rowEnd) {
    position.rowStart = rowIndex + 1
  }
}

const BoxComponent = ({ component, parent }: BoxProps) => (
  <Boxxy
    component={component}
    onMouseDown={selectComponent(component, parent)}
    onDoubleClick={editBox(component)}
    style={stylesForSelected(component)}
  >
    {component.children.map(child => (
      <Component component={child} parent={component} />
    ))}
    <DragCorners component={component} parent={parent} />
    {state.ui.expandingNode &&
      state.ui.expandingNode.parent === component &&
      component.rows.map((_, rowIndex) =>
        component.columns.map((_, colIndex) => (
          <Border
            key={`${colIndex}_${rowIndex}`}
            row={rowIndex + 1}
            col={colIndex + 1}
            onMouseOver={changeGridSize(rowIndex, colIndex)}
          />
        )),
      )}
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
  background-size: ${({ component }: BoxProps) =>
    component.objectFit === ObjectFit.fill ? '100% 100%' : component.objectFit};
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

const ImageComponent = ({ component, parent }: BoxProps) => (
  <Image
    component={component}
    onMouseDown={selectComponent(component, parent)}
    onDoubleClick={editBox(component)}
    style={stylesForSelected(component)}
  >
    {component.children.map(child => (
      <Component component={child} parent={component} />
    ))}
    <DragCorners component={component} parent={parent} />
    {state.ui.expandingNode &&
      state.ui.expandingNode.parent === component &&
      component.rows.map((_, rowIndex) =>
        component.columns.map((_, colIndex) => (
          <Border
            key={`${colIndex}_${rowIndex}`}
            row={rowIndex + 1}
            col={colIndex + 1}
            onMouseOver={changeGridSize(rowIndex, colIndex)}
          />
        )),
      )}
  </Image>
)

interface Props {
  component: Node
  parent: Node | null
}
function Component({ component, parent }: Props) {
  if (component.type === NodeTypes.Box) {
    return <BoxComponent component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextComponent component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Image) {
    return <ImageComponent component={component} parent={parent} />
  }
}

export default Component
