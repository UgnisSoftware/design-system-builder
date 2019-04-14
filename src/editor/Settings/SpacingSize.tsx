import React from 'react'
import styled from 'styled-components'

import SymbolBox from '@components/SymbolBox'
import state from '@state'
import TextInput from '@components/TextInput'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
`

interface SpacingSizeProps {
  spacing: string
  index: number
}

const onSpacingSizeChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
  state.styles.spacing[index] = event.target.value
}

const SpacingSize = ({ spacing, index }: SpacingSizeProps) => (
  <Wrapper>
    <SymbolBox>{spacing}</SymbolBox>
    <TextInput
      name={`spacingSize_${index}`}
      label="Spacing Size"
      value={spacing}
      onChange={onSpacingSizeChange(index)}
    />
  </Wrapper>
)

export default SpacingSize
