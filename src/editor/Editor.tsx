import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces'

import Fonts from './Fonts/Fonts'
import LeftMenu from './LeftMenu/LeftMenu'
import Center from './Center/Center'
import ColorsAndSpacing from './ColorsAndSpacing/ColorsAndSpacing'

const Root = styled.div`
  display: flex;
  height: 100%;
  user-select: none;
`

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      {state.router.path === RouterPaths.colors && <ColorsAndSpacing />}
      {state.router.path === RouterPaths.fonts && <Fonts />}
      {state.router.path === RouterPaths.component && <Center />}
    </Root>
  )
}

export default Editor
