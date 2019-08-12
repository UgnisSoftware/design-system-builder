import * as React from 'react'
import { Divider, TopBarBox } from './shared/_styles'
import FontSizeMutator from '@src/editor/TopBar/shared/FontSizeMutator'
import ZIndexMutator from '@src/editor/TopBar/shared/ZIndexMutator'
import StateMutator from '@src/editor/TopBar/shared/StateMutator'
import FontColorMutator from '@src/editor/TopBar/shared/FontColorMutator'
import IconTypeMutator from '@src/editor/TopBar/shared/IconTypeMutator'
import AlignmentMutators from '@src/editor/TopBar/shared/AlingmentMutators'

const IconMutators = () => {
  return (
    <TopBarBox>
      <ZIndexMutator />
      <Divider />
      <FontColorMutator />
      <Divider />
      <FontSizeMutator />
      <Divider />
      <AlignmentMutators />
      <Divider />
      <IconTypeMutator />
      <StateMutator />
    </TopBarBox>
  )
}

export default IconMutators
