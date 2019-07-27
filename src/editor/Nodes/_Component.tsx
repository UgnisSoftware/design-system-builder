import * as React from 'react'

import Element from './_Element'
import RootAtom from './Root'
import BoxAtom from './Box'
import InputAtom from './Input'
import TextAtom from './Text'
import { Nodes, NodeTypes } from '@src/interfaces/nodes'
import IconAtom from '@src/editor/Nodes/Icon'
import state from '@state'

interface Props {
  component: Nodes
}
function Component({ component }: Props) {
  if (!component) {
    return null
  }
  if (component.type === NodeTypes.Root) {
    return (
      <RootAtom component={component} parent={null}>
        {component.order.map(id => (
          <Component key={id} component={component.children[id]} />
        ))}
      </RootAtom>
    )
  }
  if (component.type === NodeTypes.Element) {
    const element = {
      ...state.elements.find(el => el.id === component.elementId).root,
      columnStart: component.columnStart,
      columnEnd: component.columnEnd,
      rowStart: component.rowStart,
      rowEnd: component.rowEnd,
    }
    return <Element component={element} parent={component} />
  }
  if (component.type === NodeTypes.Box) {
    return <BoxAtom component={component} parent={null} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextAtom component={component} parent={null} />
  }
  if (component.type === NodeTypes.Input) {
    return <InputAtom component={component} parent={null} />
  }
  if (component.type === NodeTypes.Icon) {
    return <IconAtom component={component} parent={null} />
  }
}

export default Component
