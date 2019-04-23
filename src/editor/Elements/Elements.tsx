import * as React from 'react'

import TopBar from '../TopBar/TopBar'
import Buttons from './Buttons/Buttons'
import Inputs from './Inputs/Inputs'
import Background from '@src/components/Background/Background'
import state from '@state'
import Dropdowns from '@src/editor/Elements/Dropdowns/Dropdowns'

class Elements extends React.Component {
  render() {
    return (
      <Background>
        <TopBar />
        {state.ui.router[1] === 'Button' && <Buttons />}
        {state.ui.router[1] === 'Input' && <Inputs />}
        {state.ui.router[1] === 'Dropdown' && <Dropdowns />}
      </Background>
    )
  }
}
export default Elements
