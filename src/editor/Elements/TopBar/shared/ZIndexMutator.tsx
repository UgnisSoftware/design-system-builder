import * as React from 'react'
import { IconRow, InfoColumn, StylelessButton, Title } from './_styles'
import { moveLayer } from '@src/actions'

const ZIndexMutator = () => (
  <>
    <InfoColumn>
      <Title>Z index</Title>
      <IconRow>
        <StylelessButton title="Move to front" className="material-icons" onClick={moveLayer(1)}>
          flip_to_front
        </StylelessButton>
        <StylelessButton title="Move to back" className="material-icons" onClick={moveLayer(-1)}>
          flip_to_back
        </StylelessButton>
      </IconRow>
    </InfoColumn>
  </>
)

export default ZIndexMutator
