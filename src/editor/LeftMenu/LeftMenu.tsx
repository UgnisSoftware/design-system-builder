import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { Component } from '@src/interfaces/components'
import { RouterPaths } from '@src/interfaces/router'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'
import { uuid } from '@src/utils'
import { route } from '@src/actions'
import ElementItem from '@src/editor/LeftMenu/StaticItem'
import { Alignment, NodeTypes, Overflow, Units } from '@src/interfaces/nodes'
import Link from '@components/Link/Link'

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

const SubTitle = styled.div`
  position: relative;
  font-size: 14px;
  letter-spacing: 0.05em;
  font-weight: 500;
  color: ${Colors.grey800};
  padding: 16px 16px 6px 24px;
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
  font-size: 26px;
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
      type: NodeTypes.Root,
      nodeType: NodeTypes.Box,
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
      border: null,
      children: [],
      backgroundColorId: state.styles.colors[0].id,
      hover: {},
      focus: {},
    },
  }
  route(RouterPaths.components, newId)
  state.components[newId] = newComponent
  state.ui.addingComponent = false
}

const sortComponents = (component1: Component, component2: Component) => component1.name.localeCompare(component2.name)

const LeftMenu = () => (
  <LeftMenuBox>
    <Link href="/">
      <Logo>
        <LogoImg src="/images/logo.png" height={32} />
        Ugnis
      </Logo>
    </Link>
    <Title>
      Elements
    </Title>
    <SubTitle>
      Buttons
      <AddComponentBox><PlusSign/></AddComponentBox>
    </SubTitle>
    {state.elements.Buttons.map(element => (
      <>
        <ElementItem
          onClick={route(RouterPaths.buttons, element.id)}
          name={element.name}
          selected={state.ui.router[1] === element.id}
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
        <ComponentItem key={component.id} component={component} onClick={route(RouterPaths.components, component.id)} />
      ))}

    <Title>Settings</Title>
    <Item onClick={route(RouterPaths.colors)} selected={state.ui.router[1] === RouterPaths.colors}>
      Styles
    </Item>
    <Item onClick={route(RouterPaths.fonts)} selected={state.ui.router[1] === RouterPaths.fonts}>
      Fonts
    </Item>
    <Item onClick={route(RouterPaths.assets)} selected={state.ui.router[1] === RouterPaths.assets}>
      Assets
    </Item>
    <Item onClick={route(RouterPaths.exporting)} selected={state.ui.router[1] === RouterPaths.exporting}>
      Exporting
    </Item>
  </LeftMenuBox>
)

export default LeftMenu
