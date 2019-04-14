import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import FontSizesList from './FontSizesList'
import H1 from '../../../components/H1'

const Wrapper = styled.div`
  padding: 24px;
  overflow: scroll;
  flex: 1;
`

const FontRow = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const FontsPage = () => (
  <Wrapper>
    <H1>Fonts</H1>
    <h2>{state.styles.font.fontName}</h2>
    <FontRow>
      <FontSizesList />
    </FontRow>
  </Wrapper>
)

export default FontsPage
