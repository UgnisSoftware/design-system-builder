import * as React from 'react'
import { Divider, TopBarBox } from './shared/_styles'
import FontSizeMutator from '@src/editor/Elements/TopBar/shared/FontSizeMutator'
import ZIndexMutator from '@src/editor/Elements/TopBar/shared/ZIndexMutator'
import StateMutator from '@src/editor/Elements/TopBar/shared/StateMutator'
import FontColorMutator from '@src/editor/Elements/TopBar/shared/FontColorMutator'
import IconTypeMutator from '@src/editor/Elements/TopBar/shared/IconTypeMutator'
import AlignmentMutators from '@src/editor/Elements/TopBar/shared/AlingmentMutators'

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
