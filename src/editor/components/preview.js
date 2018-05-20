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

export default () => {
    return (
        <Ugnis
            definition={state.definitionList[state.currentDefinitionId]}
            state={state.componentState}
            frozen={true}
            selectedNode={state.selectedViewNode}
            frozenClick={onFrozenClick}
            onEvent={onEvent}
        />
    )
}
