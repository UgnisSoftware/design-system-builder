import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { ElementRoutes, RouterPaths } from '@src/interfaces/router'

import HomePage from './HomePage/HomePage'
import Fonts from './Settings/Fonts/Fonts'
import LeftMenu from './LeftMenu/LeftMenu'
import ColorsAndSpacing from './Settings/ColorsAndSpacing'
import Exporting from '@src/editor/Settings/Exporting/Exporting'
import Devtools from '@src/components/Devtools/Devtools'
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
      {state.ui.router[0] === undefined && <HomePage />}
      {ElementRoutes.includes(state.ui.router[0]) && <Elements />}
      {state.ui.router[0] === RouterPaths.components && <Components />}
      {state.ui.router[0] === RouterPaths.colors && <ColorsAndSpacing />}
      {state.ui.router[0] === RouterPaths.fonts && <Fonts />}
      {state.ui.router[0] === RouterPaths.exporting && <Exporting />}
      {state.ui.router[0] === RouterPaths.assets && <Assets />}
      <Devtools />
    </Root>
  )
}

export default Editor
