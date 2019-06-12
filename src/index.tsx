import { render } from 'react-dom'
import * as React from 'react'
import { connect, Emitter } from 'lape'

import Editor from './editor/Editor'
import state from '@state'
import useOrientation from 'react-use/esm/useOrientation'
import useWindowSize from 'react-use/esm/useWindowSize'
import useEffectOnce from 'react-use/esm/useEffectOnce'
let node = document.getElementById('editor')

const Root = () => {
  useOrientation()
  useWindowSize()

  useEffectOnce(() => {
    Emitter.addSet(() => {
      localStorage.setItem(
        'state',
        JSON.stringify({
          elements: state.elements,
          settings: state.settings,
        }),
      )
    })
  })

  return <Editor />
}

if ((module as any).hot) {
  ;(module as any).hot.accept()
}

const WrappedRoot = connect(Root)

render(<WrappedRoot />, node)
