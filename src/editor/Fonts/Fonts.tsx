import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import FontSizesList from './FontSizesList'
import H1 from '@components/H1'
import { view } from 'react-easy-state/dist/es.es6'

const Wrapper = styled.div`
  padding: 24px;
  overflow: scroll;
  flex: 1;
`

const FontsPage = () => (
  <Wrapper>
    <H1>Fonts</H1>
    <h2>{state.font.fontName}</h2>
    <FontSizesList />
  </Wrapper>
)

export default view(FontsPage)
