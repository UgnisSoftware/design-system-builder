import * as React from 'react'

import TopBar from '../TopBar/TopBar'
import Buttons from './Buttons/Buttons'
import Inputs from './Inputs/Inputs'
import Background from '@src/editor/Background/Background'
import state from '@state'

class Elements extends React.Component {
  render() {
    return (
      <Background>
        <TopBar />
        {state.ui.router.componentId === 'Buttons' && <Buttons />}
        {state.ui.router.componentId === 'Inputs' && <Inputs />}
      </Background>
    )
  }
}
export default Elements
