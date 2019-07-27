import { ElementNode } from '@src/interfaces/nodes'
import * as React from 'react'
import { InfoColumn, TopBarBox } from './shared/_styles'
import { getSelectedNode } from '@src/utils'

const ElementMutators = () => {
  const component = getSelectedNode() as ElementNode
  return (
    <TopBarBox>
      <InfoColumn>{component.type} TODO Overrides</InfoColumn>
    </TopBarBox>
  )
}

export default ElementMutators
