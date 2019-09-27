import * as React from 'react'
import styled from 'styled-components'

import stateUi from '@state/ui'

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
  stateUi.showAddComponentMenu = !stateUi.showAddComponentMenu
}

class AddMenuButton extends React.Component {
  render() {
    return (
      <AddCircle className="material-icons" onClick={showAddComponentMenu}>
        add_circle_outline
      </AddCircle>
    )
  }
}
export default AddMenuButton
