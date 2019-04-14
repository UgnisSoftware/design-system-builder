import * as React from 'react'
import state from '@state'
import { connect } from 'lape'
import { NodeTypes } from '@src/Interfaces/nodes'

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
          opacity: 0.75,
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
          opacity: 0.75,
        }}
      />
    )
  }
  if (state.ui.addingAtom.type === NodeTypes.Image) {
    return (
      <img
        src={state.ui.addingAtom.imageUrl}
        style={{
          position: 'absolute',
          top: state.ui.addingAtom.position.y + 'px',
          left: state.ui.addingAtom.position.x + 'px',
          width: '160px',
          height: '100px',
          background: '#90ccf4',
          pointerEvents: 'none',
          opacity: 0.75,
        }}
      />
    )
  }
}

export default connect(AddingAtom)
