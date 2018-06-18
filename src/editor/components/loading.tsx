import * as React from 'react'
export default props => (
    <div
        style={{
            background:
                'linear-gradient(150deg, rgba(255, 255, 255, 0.1) 10%, rgba(255, 255, 255, 0)), linear-gradient(to bottom, #dd6406, #821f13)',
            userSelect: 'none',
            opacity: props.isLoading ? 1 : 0,
            zIndex: 99999,
            transition: 'visibility 0s linear 0.3s, opacity 0.3s linear',
            visibility: props.isLoading ? 'visible' : 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: '0',
            left: '0',
            bottom: '0',
            right: '0',
        }}
    >
        <span
            style={{
                fontFamily: "'Comfortaa', sans-serif",
                color: 'white',
                position: 'absolute',
                right: '100px',
                bottom: '62px',
                textAlign: 'center',
                fontSize: '7vh',
            }}
        >
            ugnis
        </span>
        <div className="spinner">
            <div className="cube1" />
            <div className="cube2" />
        </div>
    </div>
)
