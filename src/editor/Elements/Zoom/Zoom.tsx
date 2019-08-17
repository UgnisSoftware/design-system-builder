import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Colors } from '@src/styles'

const Zoom = styled.div`
  position: absolute;
  left: 24px;
  bottom: 24px;
  display: grid;
  grid-auto-flow: column;
  background: ${Colors.grey100};
  gap: 8px;
  border-radius: 10px;
  align-items: center;
`

const Item = styled.div`
  display: grid;
  height: 24px;
  width: 24px;
  background: white;
  justify-content: center;
  align-content: center;
  border-radius: 50%;
  border: 1px solid ${Colors.grey200};
`

const zoom = (zoomIn: boolean) => () => {
  if (!zoomIn && state.ui.zoom - 20 > 10) {
    state.ui.zoom -= 20
  }
  if (zoomIn && state.ui.zoom + 20 < 310) {
    state.ui.zoom += 20
  }
}

export default () => (
  <Zoom>
    <Item onClick={zoom(false)}>-</Item>
    {state.ui.zoom}%<Item onClick={zoom(true)}>+</Item>
  </Zoom>
)
