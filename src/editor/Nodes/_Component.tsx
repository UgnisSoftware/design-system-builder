import * as React from 'react'

import RootAtom from './Root'
import { Nodes, NodeTypes } from '@src/interfaces/nodes'
import Atoms from '@src/editor/Nodes/_Atoms'

interface RootProps {
  component: Nodes
  tilted?: boolean
}

function RootComponent({ component, tilted }: RootProps) {
  if (!component) {
    return null
  }
  if (component.type === NodeTypes.Root) {
    return (
      <RootAtom component={component} tilted={false} index={0}>
        {component.order.map((id, index) => (
          <Atoms key={id} component={component.children[id]} parent={null} tilted={tilted} index={index} />
        ))}
      </RootAtom>
    )
  }
}
export default RootComponent
