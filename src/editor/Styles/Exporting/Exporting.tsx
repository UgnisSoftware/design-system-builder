import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  padding: 24px;
  flex: 1;
`

const Exporting = () => (
  <Wrapper>
    Currently there are no exporters available. You can vote for your favorite framework{' '}
    <a href="https://github.com/UgnisSoftware/Ugnis/issues/1">here</a>
  </Wrapper>
)

export default Exporting
