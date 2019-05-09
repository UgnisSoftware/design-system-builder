import * as React from 'react'
import styled from 'styled-components'

import TopBar from '../TopBar/TopBar'
import Buttons from './Buttons/Buttons'
import Inputs from './Inputs/Inputs'
import Background from './Background/Background'
import state from '@state'
import Dropdowns from '@src/editor/Elements/Dropdowns/Dropdowns'
import { RouterPaths } from '@src/interfaces/router'

const Wrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 100%;
`

class Elements extends React.Component {
  render() {
    return (
      <Wrapper>
        <Background>
          <TopBar />
          {state.ui.router[0] === RouterPaths.buttons && <Buttons />}
          {state.ui.router[0] === RouterPaths.inputs && <Inputs />}
          {state.ui.router[0] === RouterPaths.popups && <Inputs />}
        </Background>
      </Wrapper>
    )
  }
}
export default Elements
