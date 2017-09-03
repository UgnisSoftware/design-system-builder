import React from 'react'
import { HOVER_MOBILE, VIEW_HOVERED } from '../../../../events'

export default () => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '8px',
            paddingRight: '8px',
            height: '15px',
        }}
        onMouseMove={e => VIEW_HOVERED({ id: '_lastNode' }, {}, 1, e)}
        onTouchMove={HOVER_MOBILE}
    />
)
