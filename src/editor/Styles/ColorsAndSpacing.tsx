import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import H1 from '@components/H1'
import PlusSign from '@components/PlusSign'
import ColorBoxWithPicker from './ColorBoxWithPicker'
import { uuid } from '@src/editor/utils'
import SpacingSize from './SpacingSize'
import { colors } from './colorList'
import { Colors } from '@src/styles'
import BoxShadow from '@src/editor/Styles/BoxShadow'
import Border from '@src/editor/Styles/Border'

const Wrapper = styled.div`
  padding: 24px;
  flex: 1;
`

const ColorWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`

const AddBox = styled.div`
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
  const randomColor = {
    ...colors[Math.floor(Math.random() * colors.length)],
    id,
  }

  state.ui.editingColorId = id
  state.colors.push(randomColor)
}

const onAddBoxShadowClick = () => {
  state.boxShadow.push({
    id: uuid(),
    value: '0 10px 20px hsla(0, 0%, 0%,.15), 0 3px 6px hsla(0, 0%, 0%, .10);',
  })
}

const onAddBorderClick = () => {
  state.border.push({
    id: uuid(),
    radius: '80px 149px 80px 51px',
    style: '2px solid #f78888',
  })
}

const ColorsAndSpacing = () => (
  <Wrapper>
    <H1>
      Colors
      <AddBox onClick={onAddColorClick}>
        <PlusSign />
      </AddBox>
    </H1>
    <ColorWrapper>
      {state.colors.map(color => (
        <ColorBoxWithPicker editing={state.ui.editingColorId === color.id} key={color.id} color={color} />
      ))}
    </ColorWrapper>

    <H1>Spacing</H1>
    <SpacingWrapper>
      {state.spacing.map((spacing, index) => (
        <SpacingSize index={index} spacing={spacing} key={`boxShadow_${index}`} />
      ))}
    </SpacingWrapper>

    <H1>
      Box Shadow
      <AddBox onClick={onAddBoxShadowClick}>
        <PlusSign />
      </AddBox>
    </H1>
    <SpacingWrapper>
      {state.boxShadow.map((boxShadow, index) => (
        <BoxShadow boxShadow={boxShadow} key={`boxShadow_${index}`} />
      ))}
    </SpacingWrapper>

    <H1>
      Borders
      <AddBox onClick={onAddBorderClick}>
        <PlusSign />
      </AddBox>
    </H1>
    <SpacingWrapper>
      {state.border.map((border, index) => (
        <Border border={border} key={`border_${index}`} />
      ))}
    </SpacingWrapper>
  </Wrapper>
)

export default ColorsAndSpacing
