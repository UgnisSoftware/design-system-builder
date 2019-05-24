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

const unselectComponent = e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = null
    state.ui.stateManager = null
    state.ui.editingTextNode = null
    state.ui.editingBoxNode = null
    state.ui.showAddComponentMenu = false
  }
}

class Elements extends React.Component {
  render() {
    const element = state.elements[state.ui.router[0]].find(el => el.id === state.ui.router[1])

    if (!element) {
      return <>No Button with id {state.ui.router[1]} was found</>
    }

    return (
      <Wrapper>
        <TopBar />
        <Background>
          <AddComponentButton />
          <ElementWrapper onClick={unselectComponent}>
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
