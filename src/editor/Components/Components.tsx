import * as React from 'react'

import TopBar from '../TopBar/TopBar'
import Preview from './Preview/Preview'
import Background from '@src/editor/Background/Background'

class CenterColumn extends React.Component {
  render() {
    return (
      <Background>
        <TopBar />
        <Preview />
      </Background>
    )
  }
}
export default CenterColumn
