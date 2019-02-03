import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces'

import Fonts from './Styles/Fonts/Fonts'
import LeftMenu from './LeftMenu/LeftMenu'
import Center from './Center/Center'
import ColorsAndSpacing from './Styles/ColorsAndSpacing'
import Exporting from '@src/editor/Styles/Exporting/Exporting'

const Root = styled.div`
  display: flex;
  min-height: 100%;
  user-select: none;
`

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      {state.ui.router.path === RouterPaths.colors && <ColorsAndSpacing />}
      {state.ui.router.path === RouterPaths.fonts && <Fonts />}
      {state.ui.router.path === RouterPaths.elements && <Center />}
      {state.ui.router.path === RouterPaths.component && <Center />}
      {state.ui.router.path === RouterPaths.page && <Center />}
      {state.ui.router.path === RouterPaths.exporting && <Exporting />}
    </Root>
  )
}

export default Editor
