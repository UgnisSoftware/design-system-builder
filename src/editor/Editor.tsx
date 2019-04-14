import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces/router'

import Fonts from './Settings/Fonts/Fonts'
import LeftMenu from './LeftMenu/LeftMenu'
import ColorsAndSpacing from './Settings/ColorsAndSpacing'
import Exporting from '@src/editor/Settings/Exporting/Exporting'
import Devtools from '@src/editor/Devtools/Devtools'
import Assets from '@src/editor/Settings/Assets/Assets'
import Elements from '@src/editor/Elements/Elements'
import Components from './Components/Components'

const Root = styled.div`
  display: flex;
  min-height: 100%;
  user-select: none;
`

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      {state.ui.router.path === RouterPaths.elements && <Elements />}
      {state.ui.router.path === RouterPaths.component && <Components />}
      {state.ui.router.path === RouterPaths.colors && <ColorsAndSpacing />}
      {state.ui.router.path === RouterPaths.fonts && <Fonts />}
      {state.ui.router.path === RouterPaths.exporting && <Exporting />}
      {state.ui.router.path === RouterPaths.assets && <Assets />}
      <Devtools />
    </Root>
  )
}

export default Editor
