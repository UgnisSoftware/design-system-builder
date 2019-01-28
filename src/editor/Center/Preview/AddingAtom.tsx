import * as React from 'react'
import state from '@state'
import { connect } from 'lape'
import { NodeTypes } from '@src/interfaces'

const AddingAtom = () => {
  if (state.ui.addingAtom.type === NodeTypes.Text) {
    return (
      <div
        style={{
          fontSize: '38px',
          position: 'absolute',
          top: state.ui.addingAtom.position.y + 'px',
          left: state.ui.addingAtom.position.x + 'px',
          width: '160px',
          height: '100px',
          pointerEvents: 'none',
        }}
      >
        Hello
      </div>
    )
  }
  if (state.ui.addingAtom.type === NodeTypes.Box) {
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
}

export default connect(AddingAtom)
