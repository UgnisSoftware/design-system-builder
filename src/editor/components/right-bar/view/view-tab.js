import React from 'react'
import ComponentButtons from './nodes/component-buttons'
import Component from './nodes/component'
import LastNode from './nodes/last-invisible-node'

export default () => (
    <div
        key="view"
        className="better-scrollbar"
        style={{
            overflow: 'auto',
            position: 'relative',
            flex: '1',
            padding: '20px',
        }}
    >
        <div
            style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#8e8e8e',
            }}
        >
            ADD NEW
        </div>
        <ComponentButtons />
        <div
            style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#8e8e8e',
                marginBottom: '10px',
            }}
        >
            NAVIGATOR
        </div>
        <div
            style={{
                position: 'relative',
                fontSize: '18px',
                fontWeight: '300',
            }}
        >
            <Component nodeRef={{ ref: 'vNodeBox', id: '_rootNode' }} parentRef={{}} depth={0} />
            <LastNode />
        </div>
    </div>
)
