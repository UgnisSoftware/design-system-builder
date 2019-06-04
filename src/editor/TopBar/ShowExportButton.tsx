import * as React from 'react'
import styled from 'styled-components'

import state from '@state'

const AddCircle = styled.i`
  position: absolute;
  top: ${() => (state.ui.stateManager ? `86px` : `16px`)};
  right: 22px;
  font-size: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const showExportMenu = () => {
  state.ui.showExportMenu = !state.ui.showExportMenu
}

class ShowExportButton extends React.Component {
  render() {
    return (
      <AddCircle className="material-icons" onClick={showExportMenu}>
        exit_to_app
      </AddCircle>
    )
  }
}
export default ShowExportButton
