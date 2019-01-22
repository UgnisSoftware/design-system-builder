import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { Component, NodeTypes, RouterPaths, ViewTypes } from '@src/interfaces'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'
import { uuid } from '@src/editor/utils'
import StaticItem from '@src/editor/LeftMenu/StaticItem'

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
  padding-top: 16px;
`

const Title = styled.div`
  position: relative;
  font-size: 16px;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: ${Colors.grey800};
  padding: 24px 16px 6px 16px;
  user-select: none;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  text-transform: uppercase;
`

const AddComponentBox = styled.div`
  cursor: pointer;
  width: 12px;
  height: 12px;
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

const Logo = styled.div`
  font-size: 28px;
  font-weight: 300;
  display: flex;
  color: ${Colors.brand};
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10px;
  padding-right: 21px;
  cursor: pointer;
`

const LogoImg = styled.img`
  margin-right: -1px;
`

const route = (path, componentId?) => () => {
  state.ui.selectedNode = null
  state.router.path = path
  state.router.componentId = componentId
}

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
    id: newId,
    name: value,
    viewMode: ViewTypes.SingleCenter,
    root: {
      id: 'rootId',
      type: NodeTypes.Box,
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
    id: newId,
    name: value,
    viewMode: ViewTypes.SingleCenter,
    nodes: [
      {
        id: 'rootId',
        type: NodeTypes.Box,
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
      },
    ],
  }
  state.router.path = RouterPaths.page
  state.router.componentId = newId
  state.pages[newId] = newComponent
  state.ui.addingComponent = false
}

const sortComponents = (component1: Component, component2: Component) => component1.name.localeCompare(component2.name)

const LeftMenu = () => (
  <LeftMenuBox>
    <Logo>
      <LogoImg src="/images/logo.png" height={32} />
      ugnis
    </Logo>
    <Title>Elements</Title>
    {Object.keys(state.elements).map(elementKey => (
      <StaticItem onClick={route(RouterPaths.elements, elementKey)} name={elementKey} />
    ))}

    <Title>
      Components
      {!state.ui.addingComponent && (
        <AddComponentBox onClick={showAddComponent}>
          <PlusSign />
        </AddComponentBox>
      )}
    </Title>
    {state.ui.addingComponent && <AddInput onSave={addComponent} />}
    {Object.values(state.components)
      .sort(sortComponents)
      .map(component => (
        <ComponentItem key={component.id} component={component} onClick={route(RouterPaths.component, component.id)} />
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
    {Object.values(state.pages)
      .sort(sortComponents)
      .map(page => (
        <ComponentItem key={page.id} component={page} onClick={route(RouterPaths.page, page.id)} />
      ))}

    <Title>Settings</Title>
    <Item onClick={route(RouterPaths.colors)} selected={state.router.path === RouterPaths.colors}>
      Styles
    </Item>
    <Item onClick={route(RouterPaths.fonts)} selected={state.router.path === RouterPaths.fonts}>
      Fonts
    </Item>
  </LeftMenuBox>
)

export default LeftMenu
