import React from 'react'
import { state } from 'lape'
import { STATE_NODE_SELECTED } from '../../../../../events'

export default ({ eventData }) => (
    <div
        style={{
            paddingLeft: '10px',
            whiteSpace: 'nowrap',
        }}
    >
        {Object.keys(eventData.mutations)
            .filter(stateId => state.definitionList[state.currentDefinitionId].state[stateId] !== undefined)
            .map(stateId => (
                <div>
                    <span
                        onClick={() => STATE_NODE_SELECTED({ ref: 'state', id: stateId })}
                        style={{
                            cursor: 'pointer',
                            color: 'white',
                            boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateId ? '#eab65c' : '#828282'),
                            background: '#1e1e1e',
                            padding: '2px 5px',
                            marginRight: '5px',
                            display: 'inline-block',
                            transition: 'all 0.2s',
                        }}
                    >
                        {state.definitionList[state.currentDefinitionId].state[stateId].title}
                    </span>
                    <span
                        style={{
                            color: '#8e8e8e',
                        }}
                    >
                        {eventData.previousState[stateId].toString()} →
                    </span>
                    {eventData.mutations[stateId].toString()}
                </div>
            ))}
    </div>
)
