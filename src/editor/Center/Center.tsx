import * as React from 'react'
import styled from 'styled-components'

import TopBar from './TopBar/TopBar'
import Preview from './Preview/Preview'
import Zoom from './Zoom/Zoom'
import state from '@state'

const Center = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
`

const zoom = e => {
  state.ui.zoom += e.deltaY > 0 ? -10 : 10
}

export default () => (
  <Center onWheel={zoom}>
    <TopBar />
    <Preview />
    <Zoom />
  </Center>
)
