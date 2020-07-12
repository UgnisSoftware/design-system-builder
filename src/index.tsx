import { render } from 'react-dom'
import { connect } from 'lape'
import './state/router'
import * as React from 'react'
import styled from 'styled-components'

import stateComponents from '@state/components'

import HomePage from './editor/HomePage/HomePage'
import Docs from './editor/HomePage/Docs'
import Fonts from './editor/Settings/Fonts/Fonts'
import LeftMenu from './editor/LeftMenu/LeftMenu'
import ColorsAndSpacing from './editor/Settings/Styles/ColorsAndSpacing'
import Exporting from '@src/editor/Settings/Exporting/Exporting'
import Assets from '@src/editor/Settings/Assets/Assets'
import Elements from '@src/editor/Elements/Elements'
import { connectDevTools } from '@src/utils'
import AddingAtom from '@src/editor/Elements/Overlay/AddingAtom'
import { matches, paths } from '@state/router'

const Root = styled.div`
  display: flex;
  min-height: 100%;
  user-select: none;
`

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      {matches(paths.homepage) && <HomePage />}
      {matches(paths.docs) && <Docs />}
      {matches(paths.element) && <Elements />}
      {matches(paths.color) && <ColorsAndSpacing />}
      {matches(paths.font) && <Fonts />}
      {matches(paths.export) && <Exporting />}
      {matches(paths.assets) && <Assets />}
      <AddingAtom />
    </Root>
  )
}

connectDevTools(stateComponents)

export default Editor

declare var module: any
if (module.hot) {
  module.hot.accept()
}

const WrappedRoot = connect(Editor)

render(<WrappedRoot />, document.getElementById('editor'))
