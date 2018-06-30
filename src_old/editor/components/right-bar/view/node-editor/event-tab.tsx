import * as React from 'react'
import { state } from 'lape'
import { EVENT_HOVERED, EVENT_UNHOVERED, STATE_NODE_SELECTED, REMOVE_MUTATOR } from '../../../../events'
import { ArrowIcon, DeleteIcon } from '../../../icons'
import emberEditor from './ember/ember'
import BranchButton from './branch-button'
export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
    const rootEvents = [
        {
            title: 'Key Down',
            type: 'keydown',
        },
        {
            title: 'Key Up',
            type: 'keyup',
        },
        {
            title: 'Move',
            type: 'mousemove',
        },
        {
            title: 'Down',
            type: 'mousedown',
        },
        {
            title: 'Up',
            type: 'mouseup',
        },
    ]
    const pointerEvents = [
        {
            title: 'Click',
            type: 'click',
        },
        {
            title: 'Double Click',
            type: 'dblclick',
        },
        {
            title: 'Over',
            type: 'mouseover',
        },
        {
            title: 'Out',
            type: 'mouseout',
        },
        {
            title: 'Move',
            type: 'mousemove',
        },
        {
            title: 'Down',
            type: 'mousedown',
        },
        {
            title: 'Up',
            type: 'mouseup',
        },
    ]
    const inputEvents = [
        {
            title: 'Input',
            type: 'input',
        },
        {
            title: 'Key Down',
            type: 'keydown',
        },
        {
            title: 'Key Up',
            type: 'keyup',
        },
        {
            title: 'Focus',
            type: 'focus',
        },
        {
            title: 'Blur',
            type: 'blur',
        },
    ]
    const events =
        state.selectedViewNode.id === '_rootNode'
            ? rootEvents
            : state.selectedViewNode.ref === 'vNodeInput'
                ? pointerEvents.concat(inputEvents)
                : pointerEvents
    return (
        <div
            style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
            }}
        >
            <div className="better-scrollbar" style={{ overflow: 'auto', flex: '1' }}>
                <div
                    style={{
                        padding: '15px 15px 5px',
                        borderBottom: '2px solid #888',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ArrowIcon /> Mouse Events
                </div>
                {events.map(eventDesc => {
                    const eventRef = selectedNode.events.find(
                        eventRef => state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].type === eventDesc.type,
                    )
                    return (
                        <div>
                            <div
                                style={{
                                    background: '#676767',
                                    padding: '5px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {eventDesc.title}
                            </div>
                            {!eventRef ||
                            state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].mutators.length === 0 ? (
                                ''
                            ) : (
                                <div
                                    style={{
                                        color: 'white',
                                        transition: 'color 0.2s',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].mutators.map(mutatorRef => {
                                        const mutator = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]
                                        const stateDef =
                                            state.definitionList[state.currentDefinitionId][mutator.state.ref][mutator.state.id]
                                        return (
                                            <div
                                                style={{
                                                    padding: '15px 20px',
                                                    borderBottom: '2px solid #929292',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        flex: '0 0 auto',
                                                        display: 'inline-block',
                                                        position: 'relative',
                                                        transform: 'translateZ(0)',
                                                        boxShadow:
                                                            'inset 0 0 0 2px ' +
                                                            (state.selectedStateNode.id === mutator.state.id ? '#eab65c' : '#828282'),
                                                        background: '#1e1e1e',
                                                        padding: '4px 7px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: 'white',
                                                            display: 'inline-block',
                                                        }}
                                                        onClick={_ => STATE_NODE_SELECTED(mutator.state.id)}
                                                    >
                                                        {stateDef.title}
                                                    </span>
                                                </span>
                                                <span
                                                    style={{
                                                        color: 'white',
                                                        fontSize: '1.8em',
                                                        padding: '10px',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    =
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            position: 'absolute',
                                                            bottom: '0',
                                                            left: '6px',
                                                        }}
                                                    >
                                                        <BranchButton reference={mutatorRef} propertyName={'mutation'} />
                                                    </span>
                                                </span>
                                                {emberEditor(mutator.mutation, stateDef.type)}
                                                <div onClick={() => REMOVE_MUTATOR(mutatorRef)}>
                                                    <DeleteIcon />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <div
                                style={{
                                    padding: '20px 20px',
                                    display: 'flex',
                                    color: '#bdbdbd',
                                    justifyContent: 'center',
                                    border: '3px dashed #bdbdbd',
                                    borderRadius: '10px',
                                    margin: '20px',
                                    userSelect: 'none',
                                    cursor: 'default',
                                }}
                                onMouseMove={() => {
                                    if (
                                        state.draggedComponentState &&
                                        (state.draggedComponentState.ref === 'state' || state.draggedComponentState.ref === 'table')
                                    ) {
                                        EVENT_HOVERED({ type: eventDesc.type })
                                    }
                                }}
                                onMouseOut={EVENT_UNHOVERED}
                            >
                                drop state here
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
