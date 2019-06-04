import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { Element, Elements } from '@src/interfaces/elements'
import { RouterPaths } from '@src/interfaces/router'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'
import { uuid } from '@src/utils'
import { route } from '@src/actions'
import { Alignment, NodeTypes, Overflow, Units } from '@src/interfaces/nodes'
import Link from '@components/Link/Link'
import { FontSizeName } from '@src/interfaces/styles'

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
  padding-top: 16px;
  z-index: 100;
  overflow: scroll;
  max-height: 100vh;
  padding-bottom: 32px;
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
  color: ${Colors.grey500};
  padding: 16px 16px 6px 16px;
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

const deleteItem = (array, item) => () => {
  const index = array.indexOf(item)
  array.splice(index, 1)
}

const showAddElement = (elementName: typeof state.ui.addingElement) => () => {
  state.ui.addingElement = elementName
}

const addElement = (elementName: typeof state.ui.addingElement) => value => {
  state.ui.addingElement = null

  if (!value) {
    return
  }
  const newId = uuid()
  const newRootId = uuid()
  const newElement: Element = {
    id: newId,
    name: value,
    root: {
      id: newRootId,
      type: NodeTypes.Root,
      nodeType: NodeTypes.Button,
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
          value: 12,
          unit: Units.Px,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 12,
          unit: Units.Px,
        },
      ],
      rows: [
        {
          value: 8,
          unit: Units.Px,
        },
        {
          value: 1,
          unit: Units.Fr,
        },
        {
          value: 8,
          unit: Units.Px,
        },
      ],
      children: [
        {
          id: '55a53c774',
          type: NodeTypes.Text,
          position: {
            columnStart: 2,
            columnEnd: 3,
            rowStart: 2,
            rowEnd: 3,
          },
          alignment: {
            horizontal: Alignment.center,
            vertical: Alignment.center,
          },
          text: 'Button',
          fontColorId: 'white-6666',
          fontSize: FontSizeName.S,
          focus: {},
          hover: {},
          fontFamilyId: 'R1-123332',
        },
      ],
      backgroundColorId: 'prim-1',
      border: 'borbor-6666',
      boxShadow: 'shadow-7777',
      focus: {},
      hover: {},
    },
  }
  route(elementName, newId)
  state.elements[elementName].push(newElement)
}

const sortComponents = (component1: Element, component2: Element) => component1.name.localeCompare(component2.name)

const LeftMenu = () => (
  <LeftMenuBox>
    <Link href="/">
      <Logo>
        <LogoImg src="/images/logo.png" height={32} />
        Ugnis
      </Logo>
    </Link>
    <Title>Elements</Title>

    {Object.keys(state.elements)
      .filter(key => key !== 'components')
      .map((key: keyof Elements) => (
        <>
          <SubTitle>
            {key}
            <AddComponentBox onClick={showAddElement(key)}>
              <PlusSign />
            </AddComponentBox>
          </SubTitle>
          {state.ui.addingElement === key && <AddInput onSave={addElement(key)} />}
          {state.elements[key].map(element => (
            <>
              <ComponentItem
                onDelete={deleteItem(state.elements[key], element)}
                onClick={route(key, element.id)}
                component={element}
              />
            </>
          ))}
        </>
      ))}

    <Title>
      Components
      <AddComponentBox onClick={showAddElement('components')}>
        <PlusSign />
      </AddComponentBox>
    </Title>
    {state.ui.addingElement === 'components' && <AddInput onSave={addElement('components')} />}
    {state.elements.components
      .concat()
      .sort(sortComponents)
      .map(component => (
        <ComponentItem
          key={component.id}
          component={component}
          onClick={route('components', component.id)}
          onDelete={deleteItem(state.elements.components, component)}
        />
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
