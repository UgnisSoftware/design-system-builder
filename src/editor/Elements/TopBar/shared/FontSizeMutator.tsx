import * as React from 'react'
import styled from 'styled-components'
import { IconRow, InfoColumn, StylelessButton, Title } from './_styles'
import { FontSizeName } from '@src/interfaces/settings'
import { changeProperty } from '@src/actions'

const FontSize = styled.div`
  margin-right: 8px;
  font-size: 18px;
`

const changeFontSize = (size: FontSizeName) => () => {
  changeProperty('fontSize', size)
}

const FontSizeMutator = () => (
  <InfoColumn>
    <Title>Font size</Title>
    <IconRow>
      <StylelessButton title="XS" onClick={changeFontSize(FontSizeName.XS)}>
        <FontSize>XS</FontSize>
      </StylelessButton>
      <StylelessButton title="S" onClick={changeFontSize(FontSizeName.S)}>
        <FontSize>S</FontSize>
      </StylelessButton>
      <StylelessButton title="M" onClick={changeFontSize(FontSizeName.M)}>
        <FontSize>M</FontSize>
      </StylelessButton>
      <StylelessButton title="L" onClick={changeFontSize(FontSizeName.L)}>
        <FontSize>L</FontSize>
      </StylelessButton>
      <StylelessButton title="XL" onClick={changeFontSize(FontSizeName.XL)}>
        <FontSize>XL</FontSize>
      </StylelessButton>
    </IconRow>
  </InfoColumn>
)

export default FontSizeMutator
