import stateUi from '@state/ui'
import * as React from 'react'
import { Divider, IconRow, InfoColumn, StylelessButton, Title, TopBarBox } from './shared/_styles'

const changeGrid = () => {
  stateUi.showGrid = !stateUi.showGrid
}

const showExportMenu = () => {
  stateUi.showExportMenu = !stateUi.showExportMenu
}

const tiltView = () => {
  stateUi.tilted = !stateUi.tilted
}

const NoneSelectedMutators = () => {
  return (
    <TopBarBox>
      {stateUi.showAddComponentMenu && 'Click and drag'}
      <InfoColumn style={{ marginLeft: 'auto' }}>
        <Title>Layer view</Title>
        <IconRow>
          <StylelessButton
            title="Layers"
            className="material-icons"
            style={{
              fontSize: '24px',
              marginLeft: 'auto',
              marginRight: 'auto',
              transform: 'rotateZ(40deg)',
              color: stateUi.tilted ? ' rgb(83, 212, 134)' : 'black',
            }}
            onClick={tiltView}
          >
            layers
          </StylelessButton>
        </IconRow>
      </InfoColumn>
      <Divider />
      <InfoColumn>
        <Title>Edit Grid</Title>
        <IconRow>
          <StylelessButton
            title="Show grid"
            className="material-icons"
            style={{
              fontSize: '24px',
              marginLeft: 'auto',
              marginRight: 'auto',
              color: stateUi.showGrid ? ' rgb(83, 212, 134)' : 'black',
            }}
            onClick={changeGrid}
          >
            {stateUi.showGrid ? 'grid_on' : 'grid_off'}
          </StylelessButton>
        </IconRow>
      </InfoColumn>
      <Divider />
      <InfoColumn>
        <Title>Export</Title>
        <IconRow>
          <StylelessButton
            title="Show export menu"
            className="material-icons"
            style={{
              fontSize: '28px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '2px',

              color: stateUi.showExportMenu ? ' rgb(83, 212, 134)' : 'black',
            }}
            onClick={showExportMenu}
          >
            exit_to_app
          </StylelessButton>
        </IconRow>
      </InfoColumn>
    </TopBarBox>
  )
}

export default NoneSelectedMutators
