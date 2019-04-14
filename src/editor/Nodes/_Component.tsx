import * as React from 'react'

import Element from './_Element'
import RootAtom from './Root'
import ImageAtom from './Image'
import BoxAtom from './Box'
import InputAtom from './Input'
import TextAtom from './Text'
import { Nodes, NodeTypes } from '@src/Interfaces/nodes'
import IconAtom from '@src/editor/Nodes/Icon'

interface Props {
  component: Nodes
  parent: Nodes | null
}
function Component({ component, parent }: Props) {
  if (component.type === NodeTypes.Root) {
    return (
      <RootAtom component={component}>
        {component.children.map(node => (
          <Component component={node} parent={component} />
        ))}
      </RootAtom>
    )
  }
  if (component.type === NodeTypes.Element) {
    return <Element component={component} parent={parent} />
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
  if (component.type === NodeTypes.Image) {
    return <ImageAtom component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Icon) {
    return <IconAtom component={component} parent={parent} />
  }
}

export default Component
