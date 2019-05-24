import * as React from 'react'
import styled from 'styled-components'

import TopBar from '../TopBar/TopBar'
import Background from './Background/Background'
import state from '@state'

import AddComponentButton from '@src/editor/TopBar/AddComponentButton'
import AddComponentMenu from '@src/editor/Elements/AddComponentMenu/AddComponentMenu'
import AddingAtom from '@src/editor/Overlay/AddingAtom'
import Component from '@src/editor/Nodes/_Component'
import GridOverlay from '@src/editor/Overlay/Grid'
import { getSelectedElement } from '@src/selector'

const Wrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr;
`

const ElementWrapper = styled.div`
  width: 512px;
  position: relative;
  display: grid;
  flex: 1;
`

const Dimmer = styled.div`
  opacity: ${() => (state.ui.showGrid ? 0.3 : 1)};
`

class Elements extends React.Component {
  render() {
    const element = getSelectedElement()

    if (!element) {
      return (
        <Wrapper>
          <div />
          <Background>No Button with id {state.ui.router[1]} was found</Background>
        </Wrapper>
      )
    }

    return (
      <Wrapper>
        <TopBar />
        <Background>
          <AddComponentButton />
          <ElementWrapper>
            <Dimmer>
              <Component component={element.root} />
            </Dimmer>
            <GridOverlay rootNode={element.root} />
          </ElementWrapper>
          {state.ui.showAddComponentMenu && <AddComponentMenu />}
          {state.ui.addingAtom && <AddingAtom />}
        </Background>
      </Wrapper>
    )
  }
}
export default Elements
