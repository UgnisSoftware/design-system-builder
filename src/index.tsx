import { render } from 'react-dom'
import * as React from 'react'
import { connect } from 'lape'

import Editor from './editor/Editor'
let node = document.getElementById('editor')

class Root extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', () => this.forceUpdate(), false)
    window.addEventListener('orientationchange', () => this.forceUpdate(), false)
  }

  render() {
    return <Editor />
  }
}

if ((module as any).hot) {
  ;(module as any).hot.accept()
}

const WrappedRoot = connect(Root)

render(<WrappedRoot />, node)
