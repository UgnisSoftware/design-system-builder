import * as React from 'react'
import styled from 'styled-components'
import stateComponents from '@state/components'
import stateUi from '@state/ui'
import { ElementType } from '@src/interfaces/elements'

import AddInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { Colors } from '@src/styles'
import PlusSign from '@src/editor/components/PlusSign'
import NewElement from '@src/elements/NewElement'
import { getSelectedElement, getSelectedModifier } from '@src/selector'
import { Element } from '@src/interfaces/elements'
import router, { paths, pathToUrl, navigate } from '@state/router'

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
  padding-top: 16px;
  z-index: 100;
  overflow: auto;
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
const A = styled.a`
  text-decoration: none;
`

const deleteItem = (array, item) => () => {
  const index = array.indexOf(item)
  array.splice(index, 1)
}

const showAddElement = (elementName: typeof stateUi.addingElement) => () => {
  stateUi.addingElement = elementName
}

const addElement = (_: typeof stateUi.addingElement) => (value) => {
  stateUi.addingElement = null

  if (!value) {
    return
  }
  const newElement = NewElement(value)
  navigate(pathToUrl(paths.element, { componentId: newElement.id }))
  stateComponents.push(newElement)
}

const sortComponents = (component1: Element, component2: Element) => component1.name.localeCompare(component2.name)

const LeftMenu = () => {
  const selectedElement = getSelectedElement()
  const selectedModifierName = getSelectedModifier()

  return (
    <LeftMenuBox>
      <A href="/">
        <Logo>
          <LogoImg src="/images/logo.png" height={32} />
          Ugnis
        </Logo>
      </A>

      <Title>
        Components
        <AddComponentBox onClick={showAddElement(ElementType.Component)}>
          <PlusSign />
        </AddComponentBox>
      </Title>
      {stateUi.addingElement === ElementType.Component && <AddInput onSave={addElement(ElementType.Component)} />}
      {stateComponents
        .filter((element) => element.type === ElementType.Component)
        .concat()
        .sort(sortComponents)
        .map((component) => (
          <ComponentItem
            key={component.id}
            id={component.id}
            name={component.name}
            selected={!selectedModifierName && selectedElement && selectedElement.id === component.id}
            onDelete={deleteItem(stateComponents, component)}
          />
        ))}

      <Title>
        Elements
        <AddComponentBox onClick={showAddElement(ElementType.Button)}>
          <PlusSign />
        </AddComponentBox>
      </Title>
      {stateUi.addingElement === ElementType.Button && <AddInput onSave={addElement(ElementType.Button)} />}

      {stateComponents
        .filter((element) => element.type !== ElementType.Component)
        .concat()
        .sort(sortComponents)
        .map((element) => (
          <ComponentItem
            key={element.id}
            id={element.id}
            selected={!selectedModifierName && selectedElement && selectedElement.id === element.id}
            onDelete={deleteItem(stateComponents, element)}
            name={element.name}
          />
        ))}

      {console.log(router)}

      <Title>Settings</Title>
      <Item href={paths.color} selected={router.url === paths.color}>
        Styles
      </Item>
      <Item href={paths.font} selected={router.url === paths.font}>
        Fonts
      </Item>
      <Item href={paths.assets} selected={router.url === paths.assets}>
        Assets
      </Item>
      <Item href={paths.export} selected={router.url === paths.export}>
        Exporting
      </Item>
    </LeftMenuBox>
  )
}

export default LeftMenu
