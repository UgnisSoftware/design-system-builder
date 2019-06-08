import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Alignment, Nodes, NodeTypes } from '@src/interfaces/nodes'
import Component from '@src/editor/Nodes/_Component'
import { connect } from 'lape'
import { addComponent } from '@src/actions'
import { FontSizeName } from '@src/interfaces/settings'
import { uuid } from '@src/utils'
import { Element, Elements } from '@src/interfaces/elements'

const bgColor = '#fcfcfc'
const Menu = styled.div`
  transform: translateX(${() => (state.ui.showAddComponentMenu ? '0' : '-100%')});
  transition: 0.3s all cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: rgb(244, 244, 244);
  padding: 64px 24px;
  display: grid;
  grid-gap: 32px;
  align-items: start;
  align-content: start;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 498px;
  overflow: scroll;
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: radial-gradient(circle, transparent 20%, ${bgColor} 20%, ${bgColor} 80%, transparent 80%, transparent),
    radial-gradient(circle, transparent 20%, ${bgColor} 20%, ${bgColor} 80%, transparent 80%, transparent) 50px 50px,
    linear-gradient(#f2f2f2 8px, transparent 8px) 0 -4px, linear-gradient(90deg, #f2f2f2 8px, transparent 8px) -4px 0;
  background-color: ${bgColor};
  background-size: 20px 20px, 20px 20px, 10px 10px, 10px 10px;
`

const Title = styled.div`
  position: absolute;
  top: -20px;
  left: 0;
  display: flex;
  transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  opacity: 0;
`

const Box = styled.div`
  background: #90ccf4;
  height: 80px;
`

const ComponentWrapper = styled.div`
  display: grid;
  position: relative;
  flex-direction: column-reverse;
  align-content: center;

  &:hover ${Title} {
    opacity: 1;
  }
`

const Text = styled.span`
  font-size: 38px;
`
const OnClickOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const generateComponent = (type: NodeTypes, key?: keyof Elements, element?: Element): Nodes => {
  const newId = uuid()
  const baseComponent = {
    id: newId,
    position: {
      columnStart: 1,
      columnEnd: 2,
      rowStart: 1,
      rowEnd: 2,
    },
    alignment: {
      horizontal: Alignment.stretch,
      vertical: Alignment.stretch,
    },
    hover: {},
    focus: {},
  }

  if (element) {
    return {
      ...baseComponent,
      type: NodeTypes.Element,
      elementType: key,
      elementId: element.id,
      overrides: {},
    }
  }

  if (type === NodeTypes.Box) {
    return {
      ...baseComponent,
      type: NodeTypes.Box,
      backgroundColorId: 'dddd-4444',
    }
  }
  if (type === NodeTypes.Text) {
    return {
      ...baseComponent,
      type: NodeTypes.Text,
      text: 'Hello',
      fontSize: FontSizeName.L,
      fontFamilyId: state.settings.fonts[0].id,
    }
  }
}

const MenuComponent = () => {
  return (
    <Menu>
      <ComponentWrapper>
        <Box />
        <Title>Box</Title>
        <OnClickOverlay onMouseDown={e => addComponent(generateComponent(NodeTypes.Box))(e)} />
      </ComponentWrapper>
      <ComponentWrapper>
        <Text>Text</Text>
        <Title>Text</Title>
        <OnClickOverlay onMouseDown={e => addComponent(generateComponent(NodeTypes.Text))(e)} />
      </ComponentWrapper>
      {state.ui.router[0] === 'components' &&
        Object.keys(state.elements)
          .filter(key => key !== 'components')
          .map((key: keyof Elements) =>
            state.elements[key].map(component => (
              <ComponentWrapper key={component.id}>
                <Component component={component.root} />
                <Title>{component.name}</Title>
                <OnClickOverlay
                  onMouseDown={e => addComponent(generateComponent(NodeTypes.Element, key, component))(e)}
                />
              </ComponentWrapper>
            )),
          )}
    </Menu>
  )
}

export default connect(MenuComponent)
