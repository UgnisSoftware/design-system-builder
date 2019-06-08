import { render } from 'react-dom'
import * as React from 'react'
import { connect, Emitter } from 'lape'

import Editor from './editor/Editor'
import state from '@state'
let node = document.getElementById('editor')

class Root extends React.Component {
  componentDidMount() {
    Emitter.addSet(() => {
      localStorage.setItem(
        'state',
        JSON.stringify({
          elements: state.elements,
          settings: state.settings,
        }),
      )
    })

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
