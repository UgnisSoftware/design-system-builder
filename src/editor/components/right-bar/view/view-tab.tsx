import * as React from 'react'
import Component from './nodes/component'
import LastNode from './nodes/last-invisible-node'
export default () => {
    return (
        <div
            key="view"
            className="better-scrollbar"
            style={{
                overflow: 'overlay',
                position: 'relative',
                flex: '1',
                padding: '0 20px',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    fontSize: '18px',
                    fontWeight: 300,
                }}
            >
                <Component nodeRef={{ ref: 'vNodeBox', id: '_rootNode' }} parentRef={{}} depth={0} />
                <LastNode />
            </div>
        </div>
    )
}
