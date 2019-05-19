import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import Element from '@src/editor/Nodes/_Element'
import { connect } from 'lape'

const ElementWrapper = styled.div`
  display: grid;
`
const Wrapper = styled.div`
  position: relative;
  display: grid;
  flex: 1;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
  justify-items: center;
  grid-auto-flow: column;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: translateZ(0);
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

const Preview = () => {
  const buttonElement = state.elements.Buttons.find(button => button.id === state.ui.router[1])

  return (
    <Wrapper onClick={unselectComponent}>
      <ElementWrapper>
        <Element component={buttonElement.root} parent={null} />
      </ElementWrapper>
    </Wrapper>
  )
}

export default connect(Preview)
