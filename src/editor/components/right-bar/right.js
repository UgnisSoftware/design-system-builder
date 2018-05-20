import React from 'react'
import { state } from 'lape'
import { WIDTH_DRAGGED } from '../../events'
import NodeEditor from './view/node-editor/node-editor'
import ComponentButtons from './view/nodes/component-buttons'
import ViewComponent from './view/view-tab'

const DragComponentRight = () => (
    <div
        onMouseDown={e => WIDTH_DRAGGED('editorRightWidth', e)}
        onTouchStart={e => WIDTH_DRAGGED('editorRightWidth', e)}
        style={{
            position: 'absolute',
            left: '0',
            transform: 'translateX(-100%)',
            top: '0',
            width: '10px',
            height: '100%',
            textAlign: 'center',
            opacity: '0',
            cursor: 'col-resize',
        }}
    />
)

export default () => {
    const selectedNode =
        state.selectedViewNode.ref && state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '0',
                right: '0',
                color: 'white',
                height: '100%',
                width: state.editorRightWidth + 'px',
                background: '#1e1e1e',
                boxSizing: 'border-box',
                boxShadow: 'inset 3px 0 0 #161616',
                transition: '0.5s transform',
                transform: state.rightOpen ? 'translateZ(0) translateX(0%)' : 'translateZ(0) translateX(100%)',
                userSelect: 'none',
            }}
        >
            <div
                style={{
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
                    }}
                >
                    NAVIGATOR
                </div>
            </div>
            <DragComponentRight />
            <ViewComponent />
            {selectedNode ? <NodeEditor /> : ''}
        </div>
    )
}
