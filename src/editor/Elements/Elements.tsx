import * as React from 'react'

import TopBar from '../TopBar/TopBar'
import Button from './Button/Button'
import Background from '@src/editor/Background/Background'

class Elements extends React.Component {
  render() {
    return (
      <Background>
        <TopBar />
        <Button />
      </Background>
    )
  }
}
export default Elements
