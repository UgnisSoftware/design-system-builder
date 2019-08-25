import state from '@state'
import { TextNode } from '@src/interfaces/nodes'
import Select from '@components/Select'
import * as React from 'react'
import { Divider, IconRow, InfoColumn, Title, TopBarBox } from './shared/_styles'
import FontSizeMutator from '@src/editor/Elements/TopBar/shared/FontSizeMutator'
import FontColorMutator from '@src/editor/Elements/TopBar/shared/FontColorMutator'
import StateMutator from '@src/editor/Elements/TopBar/shared/StateMutator'
import ZIndexMutator from '@src/editor/Elements/TopBar/shared/ZIndexMutator'
import { changeProperty } from '@src/actions'
import { getSelectedNode } from '@src/utils'
import AlignmentMutators from '@src/editor/Elements/TopBar/shared/AlingmentMutators'

const changeFontFamily = (fontFamilyId: string) => {
  changeProperty('fontFamilyId', fontFamilyId)
}

const TextMutators = () => {
  const component = getSelectedNode() as TextNode
  return (
    <TopBarBox>
      <ZIndexMutator />
      <Divider />
      <AlignmentMutators />
      <Divider />
      <FontColorMutator />
      <Divider />
      <FontSizeMutator />
      <Divider />
      <InfoColumn>
        <Title>Font family</Title>
        <IconRow>
          <Select
            options={state.settings.fonts.map(font => font.id)}
            value={component.fontFamilyId}
            toName={id => state.settings.fonts.find(font => font.id === id).fontFamily}
            onChange={changeFontFamily}
          />
        </IconRow>
      </InfoColumn>
      <StateMutator />
    </TopBarBox>
  )
}

export default TextMutators
