import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces/router'

import HomePage from './HomePage/HomePage'
import Docs from './HomePage/Docs'
import Fonts from './Settings/Fonts/Fonts'
import LeftMenu from './LeftMenu/LeftMenu'
import ColorsAndSpacing from './Settings/Styles/ColorsAndSpacing'
import Exporting from '@src/editor/Settings/Exporting/Exporting'
import Assets from '@src/editor/Settings/Assets/Assets'
import Elements from '@src/editor/Elements/Elements'
import { connectDevTools } from '@src/utils'
import { ElementType } from '@src/interfaces/elements'
import AddingAtom from '@src/editor/Elements/Overlay/AddingAtom'

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
      {state.ui.router[0] === RouterPaths.docs && <Docs />}
      {Object.values(ElementType).includes(state.ui.router[0]) && <Elements />}
      {state.ui.router[0] === RouterPaths.colors && <ColorsAndSpacing />}
      {state.ui.router[0] === RouterPaths.fonts && <Fonts />}
      {state.ui.router[0] === RouterPaths.exporting && <Exporting />}
      {state.ui.router[0] === RouterPaths.assets && <Assets />}
      {state.ui.addingAtom && <AddingAtom />}
    </Root>
  )
}

connectDevTools(state)

export default Editor
