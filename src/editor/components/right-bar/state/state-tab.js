import React from 'react'
import { state } from 'lape'
import {
    STATE_DRAGGED,
    HOVER_MOBILE,
    EDIT_VIEW_NODE_TITLE,
    DELETE_STATE,
    SAVE_DEFAULT,
    VIEW_NODE_SELECTED,
    UNSELECT_STATE_NODE,
} from '../../../events'
import { DeleteIcon, SaveIcon } from '../../icons'

import StateButtons from './state-buttons'
import SimpleEditor from './editors/simple-editor'
import TableEditor from './editors/table-editor'
import EditingNode from './editors/editing-node'
import SelectedInfo from './selected-info'

export default () => (
    <div key="state" className="better-scrollbar" style={{ overflow: 'auto', flex: '1', padding: '20px' }} onClick={UNSELECT_STATE_NODE}>
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
        <StateButtons />
        <div
            style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#8e8e8e',
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <span>COMPONENT STATE</span>
            <span>CURRENT VALUE</span>
        </div>
        {state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'].children.map(stateRef => {
            const stateId = stateRef.id
            const currentState = state.definitionList[state.currentDefinitionId][stateRef.ref][stateId]
            return (
                <div
                    key={stateRef.id}
                    style={{
                        position: 'relative',
                        marginBottom: '10px',
                    }}
                >
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <span
                            style={{
                                flex: '0 0 auto',
                                position: 'relative',
                                transform: 'translateZ(0)',
                                margin: '0 auto 0 0',
                                boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateId ? '#eab65c' : '#828282'),
                                background: '#1e1e1e',
                                padding: '4px 7px',
                            }}
                        >
                            <span
                                style={{
                                    opacity: state.editingTitleNodeId === stateId ? '0' : '1',
                                    color: 'white',
                                    display: 'inline-block',
                                }}
                                onMouseDown={e => STATE_DRAGGED(stateRef, e)}
                                onTouchStart={e => STATE_DRAGGED(stateRef, e)}
                                onTouchMove={HOVER_MOBILE}
                                onDoubleClick={e => EDIT_VIEW_NODE_TITLE(stateId, e)}
                            >
                                {currentState.title}
                            </span>
                            {state.editingTitleNodeId === stateId ? <EditingNode stateRef={stateRef}/> : ''}
                        </span>
                        <div style={{ display: 'inline-flex' }}>
                            <SimpleEditor stateRef={stateRef} />
                        </div>
                        <div
                            style={{
                                color:
                                    state.componentState[stateId] !==
                                    state.definitionList[state.currentDefinitionId][stateRef.ref][stateId].defaultValue
                                        ? 'white'
                                        : '#aaa',
                                display: 'inline-flex',
                                alignSelf: 'center',
                                padding: '0 2px 0 5px',
                            }}
                            onClick={() => SAVE_DEFAULT(stateRef)}
                        >
                            <SaveIcon />
                        </div>
                        <div
                            style={{
                                color: '#eab65c',
                                display: 'inline-flex',
                                alignSelf: 'center',
                            }}
                            onClick={() => DELETE_STATE(stateRef)}
                        >
                            <DeleteIcon />
                        </div>
                    </span>
                    {currentState.type === 'table' ? <TableEditor stateRef={stateRef} /> : ''}
                    {state.selectedStateNode.id === stateId ? <SelectedInfo currentState={currentState} /> : ''}
                </div>
            )
        })}
    </div>
)
