import React from 'react'
import { state } from 'lape'
import { CHANGE_CURRENT_STATE_BOOLEAN_VALUE, CHANGE_CURRENT_STATE_TEXT_VALUE, CHANGE_CURRENT_STATE_NUMBER_VALUE } from '../../../../events'

export default function({ stateRef }) {
    const stateId = stateRef.id
    const currentState = state.definitionList[state.currentDefinitionId][stateRef.ref][stateId]
    const noStyleInput = {
        color: 'white',
        background: 'none',
        outline: 'none',
        display: 'inline',
        border: 'none',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        flex: '0 0 auto',
        textAlign: 'right',
        boxShadow: 'inset 0 -2px 0 0 #ccc',
    }
    if (currentState.type === 'text') {
        return (
            <span
                style={{
                    flex: '0 0 auto',
                    position: 'relative',
                    transform: 'translateZ(0)',
                }}
            >
                <span
                    style={{
                        opacity: '0',
                        minWidth: '50px',
                        display: 'inline-block',
                    }}
                >
                    {state.componentState[stateId].toString()}
                </span>
                <input
                    type="text"
                    value={state.componentState[stateId]}
                    style={noStyleInput}
                    onInput={e => CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e)}
                />
            </span>
        )
    }
    if (currentState.type === 'number') {
        return (
            <span
                style={{
                    flex: '0 0 auto',
                    position: 'relative',
                    transform: 'translateZ(0)',
                }}
            >
                <span
                    style={{
                        opacity: '0',
                        minWidth: '50px',
                        display: 'inline-block',
                    }}
                >
                    {state.componentState[stateId].toString()}
                </span>
                <input
                    type="number"
                    value={state.componentState[stateId]}
                    style={noStyleInput}
                    onInput={e => CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId, e)}
                />
            </span>
        )
    }
    if (currentState.type === 'boolean') {
        return (
            <span
                style={{
                    flex: '0 0 auto',
                    position: 'relative',
                    transform: 'translateZ(0)',
                }}
            >
                <select
                    value={state.componentState[stateId].toString()}
                    style={{
                        color: 'white',
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'inset 0 -2px 0 0 #ccc',
                    }}
                    onInput={e => CHANGE_CURRENT_STATE_BOOLEAN_VALUE(stateId, e)}
                >
                    <option
                        value="true"
                        style={{
                            color: 'black',
                        }}
                    >
                        true
                    </option>
                    <option
                        value="false"
                        style={{
                            color: 'black',
                        }}
                    >
                        false
                    </option>
                </select>
            </span>
        )
    }
    return <span />
}
