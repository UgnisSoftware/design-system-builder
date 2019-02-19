import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import Component from '@src/editor/Components/_Component'
import { connect } from 'lape'
import { ComponentView } from '@src/interfaces'

const Wrapper = styled.div`
  position: relative;
  display: grid;
  flex: 1;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
  justify-items: center;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: translateZ(0);
`

const PerspectiveBox = styled.div`
  display: contents;
  position: relative;
  perspective: 1000px;
  transition: transform 0.25s;
  transform: ${() =>
    `translateZ(0) ${state.ui.componentView === ComponentView.Tilted ? `rotateY(30deg) rotateX(30deg)` : ''}`};
`

const unselectComponent = e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = null
    state.ui.editingTextNode = null
    state.ui.editingBoxNode = null
    state.ui.showAddComponentMenu = false
  }
}

const Preview = () => {
  const buttonElement = state.elements.Button.concat(state.elements.Button)
  return (
    <Wrapper onClick={unselectComponent}>
      {buttonElement.map(button => (
        <PerspectiveBox onClick={unselectComponent}>
          <>
            <Component component={button} parent={null} />
          </>
        </PerspectiveBox>
      ))}
    </Wrapper>
  )
}

export default connect(Preview)
