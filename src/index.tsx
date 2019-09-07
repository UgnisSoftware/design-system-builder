import { render } from 'react-dom'
import * as React from 'react'
import { connect } from 'lape'

import Editor from './editor/Editor'
import useOrientation from 'react-use/esm/useOrientation'
import useWindowSize from 'react-use/esm/useWindowSize'
let node = document.getElementById('editor')

const Root = () => {
  useOrientation()
  useWindowSize()

  return <Editor />
}

if ((module as any).hot) {
  ;(module as any).hot.accept()
}

const WrappedRoot = connect(Root)

render(<WrappedRoot />, node)
