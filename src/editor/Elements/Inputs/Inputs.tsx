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
  grid-auto-flow: column;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: translateZ(0);
`

const Card = styled.div`
  position: relative;
  display: grid;
  flex: 1;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
  justify-items: center;
  grid-auto-flow: column;
  background: white;
  padding: 100px 128px 40px 128px;
  grid-gap: 64px;
  box-shadow: 0 10px 20px hsla(0, 0%, 0%, 0.15), 0 3px 6px hsla(0, 0%, 0%, 0.1);
  transform: translateZ(0);
`

const Title = styled.div`
  position: absolute;
  top: 32px;
  left: 32px;
  font-size: 24px;
`
const Key = styled.div`
  padding-top: 16px;
`

const PerspectiveBox = styled.div`
  position: relative;
  display: grid;
  flex: 1;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
  justify-items: center;
  padding-bottom: 24px;
  perspective: 1000px;
  transition: transform 0.25s;
  transform: ${() =>
    `translateZ(0) ${state.ui.componentView === ComponentView.Tilted ? `rotateY(30deg) rotateX(30deg)` : ''}`};
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
  const buttonElement = Object.entries(state.elements.Inputs)
  return (
    <Wrapper onClick={unselectComponent}>
      <Card>
        <Title>Inputs:</Title>
        {buttonElement.map(([key, button]) => (
          <PerspectiveBox onClick={unselectComponent} key={key}>
            <Component component={button} parent={null} />
            <Key>{key}</Key>
          </PerspectiveBox>
        ))}
      </Card>
    </Wrapper>
  )
}

export default connect(Preview)
