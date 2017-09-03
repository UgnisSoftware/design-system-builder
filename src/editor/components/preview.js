import React from 'react'
import { state, setState } from 'lape'
import Ugnis from '../../ugnis'

function onEvent(eventId, data, e, previousState, currentState, mutations) {
    setState({
        ...state,
        componentState: currentState,
        eventStack: {
            ...state.eventStack,
            [state.currentDefinitionId]: state.eventStack[state.currentDefinitionId].concat({
                eventId,
                data,
                e,
                previousState,
                currentState,
                mutations,
            }),
        },
    })
}

function onFrozenClick(ref, e) {
    setState({
        ...state,
        selectedViewNode: ref,
    })
}

class Preview extends React.Component {
    render() {
        const topMenuHeight = 50
        const widthLeft =
            window.innerWidth - ((state.leftOpen ? state.editorLeftWidth : 0) + (state.rightOpen ? state.editorRightWidth : 0))
        const heightLeft = window.innerHeight - topMenuHeight

        return (
            <div
                style={{
                    width: state.fullScreen ? '100vw' : widthLeft - 30 + 'px',
                    height: state.fullScreen ? '100vh' : heightLeft - 30 + 'px',
                    background: '#ffffff',
                    transform: 'translateZ(0)',
                    zIndex: state.fullScreen ? '2000' : '100',
                    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
                    position: 'fixed',
                    transition: state.fullScreen || (state.editorRightWidth === 425 && state.editorLeftWidth === 200) ? 'all 0.5s' : 'none', // messes up the closing of full screen, but works in 99% of cases
                    top: state.fullScreen ? '0px' : 15 + topMenuHeight + 'px',
                    left: state.fullScreen ? '0px' : (state.leftOpen ? state.editorLeftWidth : 0) + 15 + 'px',
                }}
            >
                <div
                    style={{
                        overflow: 'auto',
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Ugnis
                        definition={state.definitionList[state.currentDefinitionId]}
                        state={state.componentState}
                        frozen={state.appIsFrozen}
                        selectedNode={state.selectedViewNode}
                        frozenClick={onFrozenClick}
                        onEvent={onEvent}
                    />
                </div>
            </div>
        )
    }
}

export default Preview
