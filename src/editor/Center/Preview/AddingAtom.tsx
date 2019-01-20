import * as React from 'react'
import state from '@state'
import { connect } from 'lape'

const AddingAtom = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: state.ui.addingAtom.position.y + 'px',
        left: state.ui.addingAtom.position.x + 'px',
        width: '160px',
        height: '100px',
        background: '#90ccf4',
        pointerEvents: 'none',
      }}
    />
  )
}

export default connect(AddingAtom)
