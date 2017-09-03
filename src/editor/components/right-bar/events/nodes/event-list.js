import React from 'react'
import { state } from 'lape'
import { VIEW_NODE_SELECTED } from '../../../../events'
import { InputIcon, TextIcon, BoxIcon } from '../../../icons'

import Mutations from './event/mutations'

export default () => (
    <div
        className="better-scrollbar"
        style={{
            flex: '1 auto',
            overflow: 'auto',
        }}
    >
        {state.eventStack[state.currentDefinitionId]
            .filter(eventData => state.definitionList[state.currentDefinitionId].event[eventData.eventId] !== undefined)
            .reverse() // mutates the array, but it was already copied with filter
            .slice(0, 21)
            .map((eventData, index) => {
                const event = state.definitionList[state.currentDefinitionId].event[eventData.eventId]
                const emitter = state.definitionList[state.currentDefinitionId][event.emitter.ref][event.emitter.id]
                return (
                    <div
                        key={event.emitter.id + index}
                        style={{
                            marginBottom: '6px',
                            paddingBottom: '10px',
                            borderBottom: '2px solid #555',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                marginBottom: '10px',
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
                                    margin: '0 0 0 5px',
                                    display: 'inline-flex',
                                }}
                            >
                                {event.emitter.ref === 'vNodeBox' ? (
                                    <BoxIcon />
                                ) : event.emitter.ref === 'vNodeInput' ? (
                                    <InputIcon />
                                ) : (
                                    <TextIcon />
                                )}
                            </span>
                            <span
                                style={{
                                    flex: '5 5 auto',
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
                                    color: '#5bcc5b',
                                }}
                            >
                                {event.type}
                            </span>
                        </div>

                        <Mutations eventData={eventData} />
                    </div>
                )
            })}
    </div>
)
