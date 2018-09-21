import React from 'react'
import styled from 'styled-components'

import SymbolBox from '@components/SymbolBox'
import { SpacingSizeName } from '@src/interfaces'
import state from '@state'
import TextInput from '@components/TextInput'
import { view } from 'react-easy-state/dist/es.es6'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
`

interface SpacingSizeProps {
  spacingSizeName: SpacingSizeName
}

const onSpacingSizeChange = (spacingSizeName: SpacingSizeName) => (event: React.ChangeEvent<HTMLInputElement>) => {
  state.spacing[spacingSizeName] = event.target.value
}

const SpacingSize = ({ spacingSizeName }: SpacingSizeProps) => (
  <Wrapper>
    <SymbolBox>{spacingSizeName}</SymbolBox>
    <TextInput
      name={`spacingSize_${spacingSizeName}`}
      label="Spacing Size"
      value={state.spacing[spacingSizeName]}
      onChange={onSpacingSizeChange(spacingSizeName)}
    />
  </Wrapper>
)

export default view(SpacingSize)
