import * as React from 'react'
import styled from 'styled-components'

import TopBar from './TopBar/TopBar'
import Preview from './Preview/Preview'

const Center = styled.div`
  overflow: scroll;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
`

export default () => (
  <Center>
    <TopBar />
    <Preview />
  </Center>
)
