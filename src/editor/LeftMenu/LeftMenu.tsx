import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { ElementType } from '@src/interfaces/elements'
import { RouterPaths } from '@src/interfaces/router'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'
import { route } from '@src/actions'
import Link from '@components/Link/Link'
import NewElement from '@src/elements/NewElement'
import { getSelectedElement, getSelectedModifier } from '@src/selector'
import { Element } from '@src/interfaces/elements'

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

  console.log(value)
  if (!value) {
    return
  }
  const newElement = NewElement(value)
  route(elementName, newElement.id)()
  state.elements.push(newElement)
}

const sortComponents = (component1: Element, component2: Element) => component1.name.localeCompare(component2.name)

const LeftMenu = () => {
  const selectedElement = getSelectedElement()
  const selectedModifierName = getSelectedModifier()

  return (
    <LeftMenuBox>
      <Link href="/">
        <Logo>
          <LogoImg src="/images/logo.png" height={32} />
          Ugnis
        </Logo>
      </Link>
      <Title>
        Elements
        <AddComponentBox onClick={showAddElement(ElementType.Button)}>
          <PlusSign />
        </AddComponentBox>
      </Title>
      {state.ui.addingElement === ElementType.Button && <AddInput onSave={addElement(ElementType.Button)} />}

      {state.elements
        .filter(element => element.type !== ElementType.Component)
        .concat()
        .sort(sortComponents)
        .map(element => (
          <React.Fragment key={element.id}>
            <ComponentItem
              selected={!selectedModifierName && selectedElement && selectedElement.id === element.id}
              onDelete={deleteItem(state.elements, element)}
              onClick={route(element.type, element.id)}
              name={element.name}
            />
            {selectedElement &&
              selectedElement.id === element.id &&
              element.modifiers &&
              Object.keys(element.modifiers).map(modifierName => {
                return (
                  <ComponentItem
                    subComponent
                    selected={selectedModifierName === modifierName}
                    key={element.id + modifierName}
                    name={modifierName}
                    onClick={route(element.type, element.id, modifierName)}
                    onDelete={deleteItem(state.elements, element)}
                  />
                )
              })}
          </React.Fragment>
        ))}

      <Title>
        Components
        <AddComponentBox onClick={showAddElement(ElementType.Component)}>
          <PlusSign />
        </AddComponentBox>
      </Title>
      {state.ui.addingElement === ElementType.Component && <AddInput onSave={addElement(ElementType.Component)} />}
      {state.elements
        .filter(element => element.type === ElementType.Component)
        .concat()
        .sort(sortComponents)
        .map(component => (
          <ComponentItem
            key={component.id}
            name={component.name}
            onClick={route('component', component.id)}
            onDelete={deleteItem(state.elements, component)}
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
}

export default LeftMenu
