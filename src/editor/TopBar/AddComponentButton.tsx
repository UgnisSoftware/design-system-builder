import * as React from 'react'
import styled from 'styled-components'

import state from '@state'

const AddCircle = styled.i`
  position: absolute;
  top: 16px;
  left: 22px;
  font-size: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const showAddComponentMenu = () => {
  state.ui.showAddComponentMenu = !state.ui.showAddComponentMenu
}

class AddComponentButton extends React.Component {
  render() {
    return (
      <AddCircle className="material-icons" onClick={showAddComponentMenu}>
        add_circle_outline
      </AddCircle>
    )
  }
}
export default AddComponentButton
