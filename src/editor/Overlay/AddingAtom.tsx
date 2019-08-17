import * as React from 'react'
import state from '@state'
import { connect } from 'lape'
import styled from 'styled-components'
import Atom from '@src/editor/Nodes/_Atoms'

const Wrapper = styled.div`
  position: absolute;
  top: ${() => state.ui.addingAtom.y}px;
  left: ${() => state.ui.addingAtom.x}px;
  opacity: 0.75;
  display: grid;
  width: 450px;
  height: 80px;
  pointer-events: none;
`

const AddingAtom = () => {
  return (
    <Wrapper>
      <Atom component={state.ui.addingAtom.node} parent={null} />
    </Wrapper>
  )
}

export default connect(AddingAtom)
