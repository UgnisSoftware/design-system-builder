import React from 'react'
import { state } from 'lape'
import { VIEW_NODE_SELECTED } from '../../../events'
import { BoxIcon, TextIcon, ImageIcon, InputIcon } from '../../icons'

export default ({ currentState }) => (
    <div style={{ paddingLeft: '10px' }}>
        <div
            style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#8e8e8e',
                marginBottom: '0',
                marginTop: '10px',
            }}
        >
            'CHANGED BY'
        </div>
        <span>
            {currentState.mutators.map(mutatorRef => {
                const mutator = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]
                const event = state.definitionList[state.currentDefinitionId][mutator.event.ref][mutator.event.id]
                const emitter = state.definitionList[state.currentDefinitionId][event.emitter.ref][event.emitter.id]
                return (
                    <div
                        style={{
                            display: 'flex',
                            cursor: 'pointer',
                            alignItems: 'center',
                            background: '#1e1e1e',
                            paddingTop: '3px',
                            paddingBottom: '3px',
                            color: state.selectedViewNode.id === event.emitter.id ? '#53d486' : 'white',
                            transition: '0.2s all',
                            minWidth: '100%',
                        }}
                        onClick={() => VIEW_NODE_SELECTED(event.emitter)}
                    >
                        <span
                            style={{
                                flex: '0 0 auto',
                                margin: '0 3px 0 5px',
                                display: 'inline-flex',
                            }}
                        >
                            {event.emitter.ref === 'vNodeBox' ? (
                                <BoxIcon />
                            ) : event.emitter.ref === 'vNodeInput' ? (
                                <InputIcon />
                            ) : event.emitter.ref === 'vNodeImage' ? (
                                <ImageIcon />
                            ) : (
                                <TextIcon />
                            )}
                        </span>
                        <span
                            style={{
                                flex: '0 0 auto',
                                margin: '0 5px 0 0',
                                minWidth: '0',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {emitter.title}
                        </span>
                        <span
                            style={{
                                flex: '0 0 auto',
                                marginLeft: 'auto',
                                marginRight: '5px',
                            }}
                        >
                            {event.type}
                        </span>
                    </div>
                )
            })}
        </span>
        <div
            style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#8e8e8e',
                marginBottom: '0',
                marginTop: '10px',
            }}
        >
            USED IN (TODO)
        </div>
    </div>
)
