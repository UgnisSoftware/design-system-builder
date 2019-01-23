import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces'

import Fonts from './Styles/Fonts/Fonts'
import LeftMenu from './LeftMenu/LeftMenu'
import Center from './Center/Center'
import ColorsAndSpacing from './Styles/ColorsAndSpacing'

const Root = styled.div`
  display: flex;
  min-height: 100%;
  user-select: none;
`

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      {state.router.path === RouterPaths.colors && <ColorsAndSpacing />}
      {state.router.path === RouterPaths.fonts && <Fonts />}
      {state.router.path === RouterPaths.elements && <Center />}
      {state.router.path === RouterPaths.component && <Center />}
      {state.router.path === RouterPaths.page && <Center />}
    </Root>
  )
}

export default Editor
