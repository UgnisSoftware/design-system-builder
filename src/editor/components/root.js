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

function FakeState({ stateRef }) {
    const title =
        stateRef.ref === 'state' || stateRef.ref === 'table'
            ? state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id].title
            : stateRef.ref === 'eventData' ? stateRef.id : 'What are you dragging?'

    const styles = {
        wrapper: {
            flex: '0 0 auto',
            position: 'relative',
            transform: 'translateZ(0)',
            margin: '7px 7px 0 0',
            boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateRef.id ? '#eab65c' : '#828282'),
            background: '#1e1e1e',
            padding: '4px 7px',
        },
    }

    return (
        <span style={styles.wrapper}>
            <span style={{ color: 'white', display: 'inline-block' }}>{title}</span>
        </span>
    )
}

const root = () => {
    if (state.loading) {
        return <Loading isLoading={true} />
    }

    const selectedNode =
        state.selectedViewNode.ref && state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    const styles = {
        root: {
            background: '#ffffff',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
        },
        main: {
            display: 'flex',
            flex: '1',
            position: 'relative',
        },
        dragWrapper: {
            top: state.mousePosition.y + 'px',
            left: state.mousePosition.x + 'px',
            width: state.editorRightWidth + 'px',
            pointerEvents: 'none',
            position: 'fixed',
            zIndex: '99999',
        },
        circleWrapper: {
            color: '#5bcc5b',
            position: 'absolute',
            top: '0',
            left: '-20px',
        },
    }

    return (
        <div style={styles.root}>
            <Loading isLoading={false} />
            <TopBar />
            <div style={styles.main}>
                <Preview />
                <Left />
                <Right />
                {selectedNode ? <NodeEditor /> : ''}
            </div>
            {state.draggedComponentView ? (
                <div style={styles.dragWrapper}>
                    <Component nodeRef={state.draggedComponentView} parent={{}} depth={state.draggedComponentView.depth} />
                </div>
            ) : (
                ''
            )}
            {state.draggedComponentState.id ? (
                <div style={styles.dragWrapper}>
                    {state.hoveredEvent || state.hoveredPipe ? (
                        <span>
                            <span style={styles.circleWrapper}>
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

export default root
