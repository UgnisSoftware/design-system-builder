import * as React from 'react'
import RootAtom from './Root'
import IconAtom from './Icon'
import BoxAtom from './Box'
import InputAtom from './Input'
import TextAtom from './Text'
import { Nodes, NodeTypes } from '@src/Interfaces/nodes'
import state from '@state'

interface Props {
  component: Nodes
  parent: Nodes | null
}
function Element({ component, parent }: Props) {
  if (component.type === NodeTypes.Root) {
    return (
      <RootAtom component={component}>
        {component.children.map(node => (
          <Element component={node} parent={component} />
        ))}
      </RootAtom>
    )
  }
  if (component.type === NodeTypes.Element) {
    const element = { ...state.elements[component.elementType][component.elementId], position: component.position }
    return <Element component={element} parent={component} />
  }
  if (component.type === NodeTypes.Box) {
    return <BoxAtom component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextAtom component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Input) {
    return <InputAtom component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Icon) {
    return <IconAtom component={component} parent={parent} />
  }
}

export default Element
