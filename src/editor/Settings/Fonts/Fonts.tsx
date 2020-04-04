import * as React from 'react'
import styled from 'styled-components'

import stateSettings from '@state/settings'
import H1 from '../../components/H1'
import FontSizeRow from '@src/editor/Settings/Fonts/FontSizeRow'

const Wrapper = styled.div`
  padding: 24px;
  overflow: scroll;
  flex: 1;
  max-height: 100vh;
`

const FontRow = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const FontsPage = () => (
  <Wrapper>
    <H1>Fonts</H1>
    {stateSettings.fonts.map((font) => (
      <div key={font.id}>
        <h2>{font.fontFamily}</h2>
        <FontRow>
          <FontSizeRow font={font} fontSizeName="XS" />
          <FontSizeRow font={font} fontSizeName="S" />
          <FontSizeRow font={font} fontSizeName="M" />
          <FontSizeRow font={font} fontSizeName="L" />
          <FontSizeRow font={font} fontSizeName="XL" />
        </FontRow>
      </div>
    ))}
  </Wrapper>
)

export default FontsPage
