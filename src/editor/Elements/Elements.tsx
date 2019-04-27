import * as React from 'react'

import TopBar from '../TopBar/TopBar'
import Buttons from './Buttons/Buttons'
import Inputs from './Inputs/Inputs'
import Background from './Background/Background'
import state from '@state'
import Dropdowns from '@src/editor/Elements/Dropdowns/Dropdowns'
import Docs from '@src/editor/Elements/Docs/Docs'
import { ElementRoutes } from '@src/interfaces/router'

class Elements extends React.Component {
  render() {
    return (
      <>
        <Background>
          <TopBar />
          {state.ui.router[1] === ElementRoutes.Buttons && <Buttons />}
          {state.ui.router[1] === ElementRoutes.Inputs && <Inputs />}
          {state.ui.router[1] === ElementRoutes.Popups && <Inputs />}
        </Background>
        <Docs route={state.ui.router[1]} />
      </>
    )
  }
}
export default Elements
