import React from 'react'
import { state } from 'lape'
import { AddCircleIcon } from './icons'
import TopBar from './top-bar/top-bar'
import Preview from './preview'
import Left from './left'
import Right from './right-bar/right'
import NodeEditor from './node-editor/node-editor'
import Loading from './loading'

import Component from './right-bar/view/nodes/component'

function FakeState({stateRef}) {
    const title =
        stateRef.ref === 'state' || stateRef.ref === 'table'
            ? state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id].title
            : stateRef.ref === 'eventData' ? stateRef.id : 'What are you dragging?'
    return <span
            style={{
                flex: '0 0 auto',
                position: 'relative',
                transform: 'translateZ(0)',
                margin: '7px 7px 0 0',
                boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateRef.id ? '#eab65c' : '#828282'),
                background: '#1e1e1e',
                padding: '4px 7px',
            }}>
        <span style={{ color: 'white', display: 'inline-block' } }>
            {title}
        </span>
        </span>
}

export default () => {
    if (state.loading) {
        return <Loading isLoading={true} />
    }

    const selectedNode =
        state.selectedViewNode.ref && state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    return (
        <div
            style={{
                background: '#ffffff',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <Loading isLoading={false} />
            <TopBar />
            <div
                style={{
                    display: 'flex',
                    flex: '1',
                    position: 'relative',
                }}
            >
                <Preview />
                <Left />
                <Right />
                {selectedNode ? <NodeEditor /> : ''}
            </div>
            {state.draggedComponentView ? (
                <div
                    style={{
                        pointerEvents: 'none',
                        position: 'fixed',
                        top: state.mousePosition.y + 'px',
                        left: state.mousePosition.x + 'px',
                        zIndex: '99999',
                        width: state.editorRightWidth + 'px',
                    }}
                >
                    <div
                        style={{
                            overflow: 'auto',
                            position: 'relative',
                            flex: '1',
                            fontSize: '18px',
                            fontWeight: '300',
                        }}
                    >
                        <Component nodeRef={state.draggedComponentView} parent={{}} depth={state.draggedComponentView.depth} />
                    </div>
                </div>
            ) : (
                ''
            )}

            {state.draggedComponentState.id ? (
                <div
                    style={{
                        pointerEvents: 'none',
                        position: 'fixed',
                        top: state.mousePosition.y + 'px',
                        left: state.mousePosition.x + 'px',
                        zIndex: '99999',
                        width: state.editorRightWidth + 'px',
                    }}
                >
                    {state.hoveredEvent || state.hoveredPipe ? (
                        <span>
                            <span
                                style={{
                                    color: '#5bcc5b',
                                    position: 'absolute',
                                    top: '0',
                                    left: '-20px',
                                }}
                            >
                                <AddCircleIcon />
                            </span>
                            <FakeState stateRef={state.draggedComponentState} />
                        </span>
                    ) : (
                        <FakeState stateRef={state.draggedComponentState} />
                    )}
                </div>
            ) : (
                ''
            )}
        </div>
    )
}
