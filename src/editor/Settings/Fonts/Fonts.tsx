import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import H1 from '../../../components/H1'
import FontSizeRow from '@src/editor/Settings/Fonts/FontSizeRow'
import { FontSizeName } from '@src/interfaces/styles'

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
    {state.styles.fonts.map(font => (
      <div key={font.id}>
        <h2>{font.fontFamily}</h2>
        <FontRow>
          <FontSizeRow font={font} fontSizeName={FontSizeName.XS} />
          <FontSizeRow font={font} fontSizeName={FontSizeName.S} />
          <FontSizeRow font={font} fontSizeName={FontSizeName.M} />
          <FontSizeRow font={font} fontSizeName={FontSizeName.L} />
          <FontSizeRow font={font} fontSizeName={FontSizeName.XL} />
        </FontRow>
      </div>
    ))}
  </Wrapper>
)

export default FontsPage
