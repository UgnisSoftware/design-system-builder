import * as React from 'react'
import styled from 'styled-components'
import state from '@state'

const Zoom = styled.div`
  position: absolute;
  left: 24px;
  bottom: 24px;
`

export default () => <Zoom>{state.ui.zoom}%</Zoom>
