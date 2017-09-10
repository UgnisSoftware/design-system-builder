import React from 'react'
import { state } from 'lape'
import {
    CHANGE_CURRENT_STATE_BOOLEAN_VALUE_TABLE,
    CHANGE_CURRENT_STATE_TEXT_VALUE_TABLE,
    CHANGE_CURRENT_STATE_NUMBER_VALUE_TABLE,
    UPDATE_TABLE_DEFAULT_RECORD,
    UPDATE_TABLE_ADD_COLUMN,
    DELETE_TABLE_ROW,
    EDIT_VIEW_NODE_TITLE,
    DELETE_STATE,
} from '../../../../events'
import { DeleteIcon, TextIcon, NumberIcon, IfIcon } from '../../../icons'

import editingNode from './editing-node'

function liveEditorTable(stateRef, tableId, rowId, rowIndex) {
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
                    {state.componentState[tableId][rowIndex][stateId].toString()}
                </span>
                <input
                    type="text"
                    value={state.componentState[tableId][rowIndex][stateId]}
                    style={noStyleInput}
                    onInput={e => CHANGE_CURRENT_STATE_TEXT_VALUE_TABLE(stateId, tableId, rowId, e)}
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
                    {state.componentState[tableId][rowIndex][stateId].toString()}
                </span>
                <input
                    type="number"
                    value={state.componentState[tableId][rowIndex][stateId]}
                    style={noStyleInput}
                    onInput={e => CHANGE_CURRENT_STATE_NUMBER_VALUE_TABLE(stateId, tableId, rowId, e)}
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
                    value={state.componentState[tableId][rowIndex][stateId].toString()}
                    style={{
                        color: 'white',
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'inset 0 -2px 0 0 #ccc',
                    }}
                    onInput={e => CHANGE_CURRENT_STATE_BOOLEAN_VALUE_TABLE(stateId, tableId, rowId, e)}
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
}

export default ({ stateRef }) => {
    const stateId = stateRef.id
    const currentState = state.definitionList[state.currentDefinitionId][stateRef.ref][stateId]
    return (
        <div
            key="table"
            style={{
                marginLeft: '20px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                }}
            >
                <div
                    style={{
                        flex: '1',
                        padding: '2px 5px',
                        borderBottom: '2px solid white',
                        maxWidth: '50px',
                    }}
                >
                    id
                </div>
                {currentState.columns.map(childRef => (
                    <div
                        style={{
                            flex: '1',
                            padding: '2px 5px',
                            borderBottom: '2px solid white',
                            maxWidth: '120px',
                            minWidth: '120px',
                            position: 'relative',
                        }}
                    >
                        <span
                            style={{
                                opacity: state.editingTitleNodeId === childRef.id ? '0' : '1',
                                color: 'white',
                                display: 'inline-block',
                                padding: '2px 2px',
                            }}
                            onDoubleClick={() => EDIT_VIEW_NODE_TITLE(childRef.id)}
                        >
                            {state.definitionList[state.currentDefinitionId][childRef.ref][childRef.id].title}
                        </span>
                        {state.editingTitleNodeId === childRef.id ? editingNode(childRef) : ''}
                        <div
                            style={{
                                color: '#eab65c',
                                display: 'inline-flex',
                                alignSelf: 'center',
                            }}
                            onClick={() => DELETE_STATE(childRef)}
                        >
                            <DeleteIcon />
                        </div>
                    </div>
                ))}
            </div>
            {state.componentState[stateId].map((row, index) => (
                <div
                    style={{
                            display: 'flex',
                        }}
                >
                    <div
                        style={{
                                color: '#eab65c',
                                display: 'inline-flex',
                                alignSelf: 'center',
                            }}
                        onClick={() => DELETE_TABLE_ROW(stateId, row.id)}
                    >
                        <DeleteIcon />
                    </div>
                    <div
                        style={{
                                flex: '1',
                                padding: '2px 5px',
                                maxWidth: '50px',
                            }}
                    >
                        ref
                    </div>
                    {currentState.columns.map(childRef => (
                        <div
                            style={{
                                    flex: '1',
                                    padding: '2px 5px',
                                    maxWidth: '120px',
                                    minWidth: '120px',
                                    position: 'relative',
                                }}
                        >
                            {liveEditorTable(childRef, stateId, row.id, index)}
                        </div>
                    ))}
                </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ paddingTop: '3px', paddingLeft: '8px' }}>Add column</div>
                <div
                    style={{
                            border: '3px solid #5bcc5b',
                            cursor: 'pointer',
                            padding: '5px',
                            marginTop: '5px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    onClick={() => UPDATE_TABLE_ADD_COLUMN(stateId, 'text')}
                >
                    <TextIcon/> Text
                </div>
                <div
                    style={{
                            border: '3px solid #5bcc5b',
                            cursor: 'pointer',
                            padding: '5px',
                            marginTop: '5px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    onClick={() => UPDATE_TABLE_ADD_COLUMN(stateId, 'number')}
                >
                    <NumberIcon/> Number
                </div>
                <div
                    style={{
                            border: '3px solid #5bcc5b',
                            cursor: 'pointer',
                            padding: '5px',
                            marginTop: '5px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    onClick={() => UPDATE_TABLE_ADD_COLUMN(stateId, 'boolean')}
                >
                    <IfIcon/> Boolean
                </div>
            </div>
            <div
                style={{
                        border: '3px solid #5bcc5b',
                        cursor: 'pointer',
                        padding: '5px',
                        marginTop: '5px',
                    }}
                onClick={() => UPDATE_TABLE_DEFAULT_RECORD(stateId)}
            >
                Add record
            </div>
        </div>
    )
}
