import React from 'react'
import { STATE_DRAGGED, HOVER_MOBILE } from '../../events'

export default (title, dragRef) => (
    <button
        style={{
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            flex: '0 0 auto',
            position: 'relative',
            transform: 'translateZ(0)',
            margin: '0 10px 0 0',
            boxShadow: 'inset 0 0 0 2px #828282',
            background: '#1e1e1e',
            padding: '4px 7px',
        }}
        title={title}
    >
        <span
            style={{
                color: 'white',
                display: 'inline-block',
            }}
            onMouseDown={e => STATE_DRAGGED(dragRef, e)}
            onTouchStart={e => STATE_DRAGGED(dragRef, e)}
            onTouchMove={HOVER_MOBILE}
        >
            {dragRef.id}
        </span>
    </button>
)
