import * as React from 'react'
import state from '@state'
import { NodeTypes } from '@src/interfaces/nodes'
import NoneSelectedMutators from '@src/editor/Elements/TopBar/NoneSelectedMutators'
import ElementMutators from '@src/editor/Elements/TopBar/ElementMutators'
import BoxMutators from '@src/editor/Elements/TopBar/BoxMutators'
import TextMutators from '@src/editor/Elements/TopBar/TextMutators'
import IconMutators from '@src/editor/Elements/TopBar/IconMutators'

const TopBar = () => {
  const selectedNode = state.ui.selectedNode
  if (!selectedNode) {
    return <NoneSelectedMutators />
  }

  if (selectedNode.type === NodeTypes.Element) {
    return <ElementMutators />
  }
  if (selectedNode.type === NodeTypes.Box) {
    return <BoxMutators />
  }
  if (selectedNode.type === NodeTypes.Text) {
    return <TextMutators />
  }
  if (selectedNode.type === NodeTypes.Icon) {
    return <IconMutators />
  }
  return null
}

export default TopBar
