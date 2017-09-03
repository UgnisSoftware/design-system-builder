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
            background: '#f8f8f8',
            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
            display: 'flex',
            justifyContent: 'center',
        }}
    >
        <div
            style={{
                fontSize: '20px',
                fontWeight: '300',
                color: '#8e8e8e',
                position: 'absolute',
                top: '17px',
                left: '20px',
                cursor: 'default',
                userSelect: 'none',
            }}
        >
            Components
        </div>
        <a
            href="/"
            style={{
                flex: '0 auto',
                padding: '0 50px',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'inherit',
                userSelect: 'none',
            }}
        >
            <img src="/images/logo_new256x256.png" height="37" />
        </a>
        <FullscreenComponent />
        <StopPlayComponent />
    </div>
)
