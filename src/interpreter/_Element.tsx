import * as React from 'react'
import RootAtom from './Root'
import { ElementNode, NodeTypes, RootNode } from '@src/interfaces/nodes'
import Atoms from '@src/interpreter/_Atoms'

interface RootProps {
  component: RootNode
  parent: ElementNode | null
  tilted?: boolean
  index: number
}

function RootElement({ component, parent, tilted, index }: RootProps) {
  if (component.type === NodeTypes.Root) {
    return (
      <RootAtom component={component} tilted={tilted} index={index}>
        {Object.values(component.children).map((node, subIndex) => (
          <Atoms
            key={parent ? parent.id + node.id : node.id}
            component={node}
            parent={parent}
            tilted={false}
            index={subIndex}
          />
        ))}
      </RootAtom>
    )
  }
}

export default RootElement
