import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Node, FontSizeName, NodeTypes } from '@src/interfaces'
import { uuid } from '@src/editor/utils'
import { startComponentDrag } from '@src/editor/Center/Preview/ComponentView/_Component'

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
  background: #49c67f;
  width: 162px;
  height: 100px;
`

const ComponentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120px;

  &:hover ${Title} {
    opacity: 1;
  }
`

const Text = styled.span`
  font-size: 38px;
`

const addComponent = (type: NodeTypes) => (event: React.MouseEvent) => {
  event.persist()
  const box = (event.target as HTMLDivElement).getBoundingClientRect()
  const height = box.bottom - box.top
  const width = box.right - box.left
  const newId = uuid()

  let newNode: Node
  if (type === NodeTypes.Box) {
    newNode = {
      id: newId,
      type: NodeTypes.Box,
      position: {
        left: box.left,
        top: box.top,
      },
      size: {
        width,
        height,
      },
      background: {
        color: '#49c67f',
      },
    }
  }
  if (type === NodeTypes.Text) {
    newNode = {
      id: newId,
      type: NodeTypes.Text,
      size: {
        width,
        height,
      },
      position: {
        left: box.left,
        top: box.top,
      },
      fontSize: FontSizeName.L,
      text: 'Hello',
    }
  }

  state.components[state.router.componentId].nodes.push(newNode)
  state.ui.showAddComponentMenu = false

  startComponentDrag(newNode)(event)
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

      {/*{Object.keys(state.components).map(componentId => <span>{state.components[componentId].name}</span>)}*/}
    </Menu>
  )
}
