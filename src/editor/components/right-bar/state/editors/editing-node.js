import React from 'react'
import { state } from 'lape'
import { CHANGE_STATE_NODE_TITLE } from '../../../../events'

export default function(stateRef) {
    const stateId = stateRef.id
    const currentState = state.definitionList[state.currentDefinitionId][stateRef.ref][stateId]
    return (
        <input
            style={{
                color: 'white',
                outline: 'none',
                padding: '4px 7px',
                boxShadow: 'none',
                display: 'inline',
                border: 'none',
                background: 'none',
                font: 'inherit',
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                flex: '0 0 auto',
            }}
            onInput={e => CHANGE_STATE_NODE_TITLE(stateRef, e)}
            value={currentState.title}
            autofocus={true}
            data-istitleeditor={true}
        />
    )
}
