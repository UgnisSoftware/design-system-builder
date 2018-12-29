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
  font-size: 16px;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: ${Colors.grey800};
  padding: 10px 16px 10px 16px;
  user-select: none;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  text-transform: uppercase;
  &:hover {
    filter: brightness(0.8);
  }
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
  padding-bottom: 14px;
  padding-right: 14px;
  cursor: pointer;
`

const LogoImg = styled.img`
  margin-right: -1px;
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
    id: newId,
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
    id: newId,
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
