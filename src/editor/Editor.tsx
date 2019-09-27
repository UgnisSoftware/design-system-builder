import * as React from 'react'
import styled from 'styled-components'

import stateComponents from '@state/components'
import stateUi from '@state/ui'
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
      {stateUi.router[0] === undefined && <HomePage />}
      {stateUi.router[0] === RouterPaths.docs && <Docs />}
      {Object.values(ElementType).includes(stateUi.router[0] as any) && <Elements />}
      {stateUi.router[0] === RouterPaths.colors && <ColorsAndSpacing />}
      {stateUi.router[0] === RouterPaths.fonts && <Fonts />}
      {stateUi.router[0] === RouterPaths.exporting && <Exporting />}
      {stateUi.router[0] === RouterPaths.assets && <Assets />}
      {stateUi.addingAtom && <AddingAtom />}
    </Root>
  )
}

connectDevTools(stateComponents)

export default Editor
