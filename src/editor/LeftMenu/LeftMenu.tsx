import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { Component } from '@src/Interfaces/components'
import { RouterPaths } from '@src/interfaces/router'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'
import { uuid } from '@src/utils'
import { route } from '@src/actions'
import StaticItem from '@src/editor/LeftMenu/StaticItem'
import { Alignment, NodeTypes, Overflow, Units } from '@src/Interfaces/nodes'

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
  padding-top: 16px;
  z-index: 100;
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
  font-weight: 400;
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
    root: {
      id: 'rootId',
      type: NodeTypes.Box,
      position: {
        columnStart: 1,
        columnEnd: -1,
        rowStart: 1,
        rowEnd: -1,
      },
      alignment: {
        horizontal: Alignment.stretch,
        vertical: Alignment.stretch,
      },
      padding: {
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px',
      },
      overflow: Overflow.visible,
      columns: [
        {
          value: 1,
          unit: Units.Fr,
        },
      ],
      rows: [
        {
          value: 100,
          unit: Units.Px,
        },
      ],
      children: [],
      background: {
        colorId: state.styles.colors[0].id,
      },
      hover: {},
      focus: {},
    },
  }
  route(RouterPaths.component, newId)
  state.components[newId] = newComponent
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
      <>
        <StaticItem
          onClick={route(RouterPaths.elements, elementKey)}
          name={elementKey}
          selected={state.ui.router.componentId === elementKey}
        />
      </>
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

    <Title>Settings</Title>
    <Item onClick={route(RouterPaths.colors)} selected={state.ui.router.path === RouterPaths.colors}>
      Styles
    </Item>
    <Item onClick={route(RouterPaths.fonts)} selected={state.ui.router.path === RouterPaths.fonts}>
      Fonts
    </Item>
    <Item onClick={route(RouterPaths.assets)} selected={state.ui.router.path === RouterPaths.assets}>
      Assets
    </Item>
    <Item onClick={route(RouterPaths.exporting)} selected={state.ui.router.path === RouterPaths.exporting}>
      Exporting
    </Item>
  </LeftMenuBox>
)

export default LeftMenu
