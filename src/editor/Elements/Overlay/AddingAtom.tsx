import * as React from 'react'
import stateUi from '@state/ui'
import { connect } from 'lape'
import styled from 'styled-components'
import Atom from '@src/interpreter/_Atoms'

const Wrapper = styled.div`
  transition: width 0.3s, height 0.3s;
  position: fixed;
  top: ${() => stateUi.addingAtom.y}px;
  left: ${() => stateUi.addingAtom.x}px;
  transform: translateX(-50%) translateY(-50%);
  opacity: 0.5;
  display: grid;
  width: ${() => stateUi.addingAtom.width}px;
  height: ${() => stateUi.addingAtom.height}px;
  pointer-events: none;
  z-index: 100000;
`

const AddingAtom = () => {
  if (!stateUi.addingAtom) {
    return null
  }
  const node = {
    ...stateUi.addingAtom.node,
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
