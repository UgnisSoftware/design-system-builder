import * as React from 'react'

import TopBar from '../TopBar/TopBar'
import Buttons from './Buttons/Buttons'
import Background from '@src/editor/Background/Background'

class Elements extends React.Component {
  render() {
    return (
      <Background>
        <TopBar />
        <Buttons />
      </Background>
    )
  }
}
export default Elements
