import React from 'react'
import { state } from 'lape'
import StopPlayComponent from '../../../top-bar/stop-play'

export default () => (
    <div>
        <div style={{ color: '#ccc' }}>The component has not emitted any events yet...</div>
        {state.appIsFrozen ? (
            <div style={{ color: '#ccc', paddingTop: '10px' }}>
                No wonder, you are in the Design mode, click: ',
                <div style={{ position: 'relative' }}>
                    <StopPlayComponent />
                </div>
            </div>
        ) : (
            <div style={{ color: '#ccc', paddingTop: '10px' }}>
                Your component works the same as if it was exported. Try clicking on a component that has a state in its click event :)
            </div>
        )}
    </div>
)
