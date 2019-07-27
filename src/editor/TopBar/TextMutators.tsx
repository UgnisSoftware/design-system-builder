import state from '@state'
import { Alignment, TextNode } from '@src/interfaces/nodes'
import Select from '@components/Select'
import * as React from 'react'
import styled from 'styled-components'
import { Divider, IconRow, InfoColumn, StylelessButton, Title, TopBarBox } from './shared/_styles'
import { Colors } from '@src/styles'
import FontSizeMutator from '@src/editor/TopBar/shared/FontSizeMutator'
import FontColorMutator from '@src/editor/TopBar/shared/FontColorMutator'
import StateMutator from '@src/editor/TopBar/shared/StateMutator'
import ZIndexMutator from '@src/editor/TopBar/shared/ZIndexMutator'
import { changeProperty } from '@src/actions'
import { getSelectedNode } from '@src/utils'

const HorizontalAlignmentWrapper = styled.div`
  cursor: pointer;
  display: grid;
  grid-template-columns: 6px 6px 6px;
  grid-template-rows: 18px;
  margin-right: 8px;
`

const VerticalAlignmentWrapper = styled.div`
  display: grid;
  grid-template-columns: 18px;
  grid-template-rows: 6px 6px 6px;
  margin-right: 8px;
`

const AlignmentItem = styled.div`
  background: ${Colors.grey200};
`

const AlignmentItemSelected = styled(AlignmentItem)`
  background: ${({ selected }) => (selected ? Colors.accent : Colors.grey500)};
`

const changeHorizontalAlignment = (alignment: Alignment) => () => {
  changeProperty('horizontalAlign', alignment)
}
const changeVerticalAlignment = (alignment: Alignment) => () => {
  changeProperty('verticalAlign', alignment)
}

const changeFontFamily = (fontFamilyId: string) => {
  changeProperty('fontFamilyId', fontFamilyId)
}

const TextMutators = () => {
  const component = getSelectedNode() as TextNode
  return (
    <TopBarBox>
      <ZIndexMutator />
      <Divider/>
      <InfoColumn>
        <Title>Horizontal</Title>
        <IconRow>
          <StylelessButton title="Stretch" onClick={changeHorizontalAlignment(Alignment.stretch)}>
            <HorizontalAlignmentWrapper>
              <AlignmentItemSelected selected={component.horizontalAlign === Alignment.stretch} />
              <AlignmentItemSelected selected={component.horizontalAlign === Alignment.stretch} />
              <AlignmentItemSelected selected={component.horizontalAlign === Alignment.stretch} />
            </HorizontalAlignmentWrapper>
          </StylelessButton>
          <StylelessButton title="Left" onClick={changeHorizontalAlignment(Alignment.start)}>
            <HorizontalAlignmentWrapper>
              <AlignmentItemSelected selected={component.horizontalAlign === Alignment.start} />
              <AlignmentItem />
              <AlignmentItem />
            </HorizontalAlignmentWrapper>
          </StylelessButton>
          <StylelessButton title="Middle" onClick={changeHorizontalAlignment(Alignment.center)}>
            <HorizontalAlignmentWrapper>
              <AlignmentItem />
              <AlignmentItemSelected selected={component.horizontalAlign === Alignment.center} />
              <AlignmentItem />
            </HorizontalAlignmentWrapper>
          </StylelessButton>
          <StylelessButton title="Right" onClick={changeHorizontalAlignment(Alignment.end)}>
            <HorizontalAlignmentWrapper>
              <AlignmentItem />
              <AlignmentItem />
              <AlignmentItemSelected selected={component.horizontalAlign === Alignment.end} />
            </HorizontalAlignmentWrapper>
          </StylelessButton>
        </IconRow>
      </InfoColumn>
      <Divider />
      <InfoColumn>
        <Title>Vertical</Title>
        <IconRow>
          <StylelessButton title="Stretch" onClick={changeVerticalAlignment(Alignment.stretch)}>
            <VerticalAlignmentWrapper>
              <AlignmentItemSelected selected={component.verticalAlign === Alignment.stretch} />
              <AlignmentItemSelected selected={component.verticalAlign === Alignment.stretch} />
              <AlignmentItemSelected selected={component.verticalAlign === Alignment.stretch} />
            </VerticalAlignmentWrapper>
          </StylelessButton>
          <StylelessButton title="Top" onClick={changeVerticalAlignment(Alignment.start)}>
            <VerticalAlignmentWrapper>
              <AlignmentItemSelected selected={component.verticalAlign === Alignment.start} />
              <AlignmentItem />
              <AlignmentItem />
            </VerticalAlignmentWrapper>
          </StylelessButton>
          <StylelessButton title="Middle" onClick={changeVerticalAlignment(Alignment.center)}>
            <VerticalAlignmentWrapper>
              <AlignmentItem />
              <AlignmentItemSelected selected={component.verticalAlign === Alignment.center} />
              <AlignmentItem />
            </VerticalAlignmentWrapper>
          </StylelessButton>
          <StylelessButton title="Bottom" onClick={changeVerticalAlignment(Alignment.end)}>
            <VerticalAlignmentWrapper>
              <AlignmentItem />
              <AlignmentItem />
              <AlignmentItemSelected selected={component.verticalAlign === Alignment.end} />
            </VerticalAlignmentWrapper>
          </StylelessButton>
        </IconRow>
      </InfoColumn>
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
