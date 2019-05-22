import * as React from 'react'
import styled from 'styled-components'

import TopBar from '../TopBar/TopBar'
import Buttons from './Buttons/Buttons'
import Background from './Background/Background'
import state from '@state'
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
        </Background>
      </Wrapper>
    )
  }
}
export default Elements
