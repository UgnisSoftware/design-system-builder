import * as React from 'react'
import styled from 'styled-components'
import stateComponents from '@state/components'
import stateSettings from '@state/settings'
import stateUi from '@state/ui'
import { Alignment, EditableNodes, IconTypes, NodeTypes } from '@src/interfaces/nodes'
import Component from '@src/interpreter/_Component'
import { connect } from 'lape'
import { dragComponent } from '@src/actions'
import { uuid } from '@src/utils'
import { Element, ElementType } from '@src/interfaces/elements'
import { getSelectedElement } from '@src/selector'

const bgColor = '#fcfcfc'
const Menu = styled.div`
  transform: translateX(${() => (stateUi.showAddComponentMenu ? '0' : '-100%')});
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
  font-size: 18px;
  transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  opacity: 0;
`

const Box = styled.div`
  background: #90ccf4;
  width: 130px;
  height: 80px;
`

const ComponentWrapper = styled.div`
  display: grid;
  justify-content: start;
  position: relative;
  flex-direction: column-reverse;
  align-content: center;

  &:hover ${Title} {
    opacity: 1;
  }
`
const ComponentWrapperIcons = styled(ComponentWrapper)`
  font-size: 38px;
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

const icons: IconTypes[] = [
  'beach_access',
  'casino',
  'golf_course',
  'pool',
  'business_center',
  'public',
  'sentiment_very_satisfied',
  'cake',
  'fitness_center',
]

let icon = icons[Math.floor(Math.random() * icons.length)]

const generateComponent = (type: NodeTypes, element?: Element): EditableNodes => {
  const newId = uuid()
  const baseComponent = {
    id: newId,
    columnStart: 1,
    columnEnd: 2,
    rowStart: 1,
    rowEnd: 2,
    states: {},
  }

  if (element) {
    return {
      ...baseComponent,
      type: NodeTypes.Element,
      elementId: element.id,
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      overrides: {},
    }
  }

  if (type === NodeTypes.Box) {
    return {
      ...baseComponent,
      type: NodeTypes.Box,
      backgroundColorId: 'dddd-4444',
      horizontalAlign: Alignment.stretch,
      verticalAlign: Alignment.stretch,
      states: {
        hover: {},
        parentHover: {},
      },
    }
  }
  if (type === NodeTypes.Text) {
    return {
      ...baseComponent,
      type: NodeTypes.Text,
      text: 'Text',
      fontSize: 'L',
      fontFamilyId: stateSettings.fonts[0].id,
      horizontalAlign: Alignment.center,
      verticalAlign: Alignment.center,
      states: {
        hover: {},
        parentHover: {},
      },
    }
  }
  if (type === NodeTypes.Icon) {
    const newComponent = {
      ...baseComponent,
      type: NodeTypes.Icon as NodeTypes.Icon,
      iconType: icon,
      fontSize: 'L',
      horizontalAlign: Alignment.center,
      verticalAlign: Alignment.center,
      states: {
        hover: {},
        parentHover: {},
      },
    } as const
    icon = icons[Math.floor(Math.random() * icons.length)]
    return newComponent
  }
}

const MenuComponent = () => {
  const element = getSelectedElement()

  return (
    <Menu>
      <ComponentWrapper>
        <Box onMouseDown={(e) => dragComponent(generateComponent(NodeTypes.Box))(e)} />
        <Title>Box</Title>
      </ComponentWrapper>
      <ComponentWrapper>
        <Text onMouseDown={(e) => dragComponent(generateComponent(NodeTypes.Text))(e)}>Text</Text>
        <Title>Text</Title>
      </ComponentWrapper>
      <ComponentWrapperIcons>
        <div onMouseDown={(e) => dragComponent(generateComponent(NodeTypes.Icon))(e as any)} className="material-icons">
          {icon}
        </div>
        <Title>Icon</Title>
      </ComponentWrapperIcons>
      {element.type === ElementType.Component &&
        stateComponents
          .filter((element) => element.type !== ElementType.Component)
          .map((component) => (
            <ComponentWrapper key={component.id}>
              <Component component={component.root} />
              <Title>{component.name}</Title>
              <OnClickOverlay onMouseDown={(e) => dragComponent(generateComponent(NodeTypes.Element, component))(e)} />
            </ComponentWrapper>
          ))}
    </Menu>
  )
}

export default connect(MenuComponent)
