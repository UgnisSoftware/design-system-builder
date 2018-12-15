import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { Component, NodeTypes, RouterPaths, ViewTypes } from '@src/interfaces'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { route } from '@src/editor/actions'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'
import { uuid } from '@src/editor/utils'

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
  padding-top: 16px;
`

const Title = styled.div`
  position: relative;
  font-size: 18px;
  letter-spacing: 1px;
  font-weight: 500;
  color: ${Colors.darkGrey};
  padding: 10px 16px 10px 16px;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:hover {
    filter: brightness(0.8);
  }
`

const AddComponentBox = styled.div`
  cursor: pointer;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7%;
  margin-left: 10px;
  vertical-align: middle;
  line-height: 45px;
  color: rgb(152, 161, 164);
  transition: all 200ms ease;

  &:hover {
    color: ${Colors.accent};
  }
`

const showAddComponent = () => {
  state.ui.addingComponent = true
}
const addComponent = value => {
  state.ui.addingComponent = false

  if (!value) {
    return
  }

  const newId = uuid()
  const newComponent: Component = {
    name: value,
    viewMode: ViewTypes.SingleCenter,
    root: {
      id: 'rootId',
      type: NodeTypes.Root,
      position: {
        top: 0,
        left: 0,
      },
      size: {
        width: 254,
        height: 254,
      },
      background: {
        color: '#49c67f',
      },
      children: [],
    },
  }
  state.router.path = RouterPaths.component
  state.router.componentId = newId
  state.components[newId] = newComponent
  state.ui.addingComponent = false
}

const showAddPage = () => {
  state.ui.addingPage = true
}

const addPage = value => {
  state.ui.addingPage = false

  if (!value) {
    return
  }

  const newId = uuid()
  const newComponent: Component = {
    name: value,
    viewMode: ViewTypes.SingleCenter,
    root: {
      id: 'rootId',
      type: NodeTypes.Root,
      position: {
        top: 0,
        left: 0,
      },
      size: {
        width: 254,
        height: 254,
      },
      background: {
        color: '#49c67f',
      },
      children: [],
    },
  }
  state.router.path = RouterPaths.component
  state.router.componentId = newId
  state.components[newId] = newComponent
  state.ui.addingComponent = false
}

const LeftMenu = () => (
  <LeftMenuBox>
    <Title>
      Components
      {!state.ui.addingComponent && (
        <AddComponentBox onClick={showAddComponent}>
          <PlusSign />
        </AddComponentBox>
      )}
    </Title>
    {state.ui.addingComponent && <AddInput onSave={addComponent} />}
    {Object.keys(state.components).map(componentId => (
      <ComponentItem key={componentId} id={componentId} />
    ))}

    <Title>
      Pages
      {!state.ui.addingComponent && (
        <AddComponentBox onClick={showAddPage}>
          <PlusSign />
        </AddComponentBox>
      )}
    </Title>
    {state.ui.addingPage && <AddInput onSave={addPage} />}
    {Object.keys(state.pages).map(componentId => (
      <ComponentItem key={componentId} id={componentId} />
    ))}

    <Title>Styles</Title>
    <Item onClick={route(RouterPaths.colors)} selected={state.router.path === RouterPaths.colors}>
      Colors & Spacing
    </Item>
    <Item onClick={route(RouterPaths.fonts)} selected={state.router.path === RouterPaths.fonts}>
      Fonts
    </Item>
  </LeftMenuBox>
)

export default LeftMenu
