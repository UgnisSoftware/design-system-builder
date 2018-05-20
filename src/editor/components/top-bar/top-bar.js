import React from 'react'
import StopPlayComponent from './stop-play'
import FullscreenComponent from './fullscreen'

export default () => (
    <div
        style={{
            flex: '1 auto',
            height: '50px',
            maxHeight: '50px',
            minHeight: '50px',
            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
            display: 'flex',
            justifyContent: 'center',
        }}
    >
        <FullscreenComponent />
    </div>
)
