import * as React from 'react'
import { Divider, TopBarBox } from './shared/_styles'
import FontSizeMutator from '@src/editor/TopBar/shared/FontSizeMutator'
import ZIndexMutator from '@src/editor/TopBar/shared/ZIndexMutator'
import StateMutator from '@src/editor/TopBar/shared/StateMutator'
import FontColorMutator from '@src/editor/TopBar/shared/FontColorMutator'

const IconMutators = () => {
  return (
    <TopBarBox>
      <ZIndexMutator />
      <Divider />
      <FontColorMutator />
      <Divider />
      <FontSizeMutator />
      <StateMutator />
    </TopBarBox>
  )
}

export default IconMutators
