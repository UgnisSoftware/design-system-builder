import * as React from 'react'
import state from '@state'
import { connect } from 'lape'
import styled from 'styled-components'
import Atom from '@src/interpreter/_Atoms'

const Wrapper = styled.div`
  transition: width 0.3s, height 0.3s;
  position: fixed;
  top: ${() => state.ui.addingAtom.y}px;
  left: ${() => state.ui.addingAtom.x}px;
  transform: translateX(-50%) translateY(-50%);
  opacity: 0.5;
  display: grid;
  width: ${() => state.ui.addingAtom.width}px;
  height: ${() => state.ui.addingAtom.height}px;
  pointer-events: none;
  z-index: 100000;
`

const AddingAtom = () => {
  const node = {
    ...state.ui.addingAtom.node,
    columnStart: 1,
    columnEnd: -1,
    rowStart: 1,
    rowEnd: -1,
  }
  return (
    <Wrapper>
      <Atom component={node} parent={null} />
    </Wrapper>
  )
}

export default connect(AddingAtom)
