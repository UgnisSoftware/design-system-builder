import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import H1 from '@components/H1'
import PlusSign from '@components/PlusSign'
import ColorBoxWithPicker from './ColorBoxWithPicker'
import { uuid } from '@src/editor/utils'
import SpacingSize from './SpacingSize'
import { SpacingSizeName } from '@src/interfaces'
import { colors } from './colorList'
import { Colors } from '@src/styles'

const Wrapper = styled.div`
  padding: 24px;
  flex: 1;
`

const ColorWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`

const AddColorBox = styled.div`
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7%;
  margin-left: 10px;
  vertical-align: middle;
  line-height: 45px;
  background-color: rgb(240, 240, 240);
  color: rgb(152, 161, 164);
  padding: 8px;
  transition: all 200ms ease;

  &:hover {
    background-color: ${Colors.accent};
    color: white;
  }
`

const SpacingWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const onAddColorClick = () => {
  const id = uuid()
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  state.ui.editingColorId = id
  state.colors[id] = randomColor
}

const ColorsAndSpacing = () => (
  <Wrapper>
    <H1>
      Colors
      <AddColorBox onClick={onAddColorClick}>
        <PlusSign />
      </AddColorBox>
    </H1>
    <ColorWrapper>
      {Object.keys(state.colors).map(id => (
        <ColorBoxWithPicker editing={state.ui.editingColorId === id} key={id} colorId={id} />
      ))}
    </ColorWrapper>

    <H1>Spacing</H1>
    <SpacingWrapper>
      <SpacingSize spacingSizeName={SpacingSizeName.XS} />
      <SpacingSize spacingSizeName={SpacingSizeName.S} />
      <SpacingSize spacingSizeName={SpacingSizeName.M} />
      <SpacingSize spacingSizeName={SpacingSizeName.L} />
      <SpacingSize spacingSizeName={SpacingSizeName.XL} />
    </SpacingWrapper>
  </Wrapper>
)

export default ColorsAndSpacing
