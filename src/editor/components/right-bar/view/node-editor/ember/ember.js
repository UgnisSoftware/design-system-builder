import React from 'react'
import { state } from 'lape'
import {
    SELECT_PIPE,
    PIPE_HOVERED,
    RESET_PIPE,
    PIPE_UNHOVERED,
    CHANGE_STATIC_VALUE,
    STATE_NODE_SELECTED,
    ADD_DEFAULT_TRANSFORMATION,
} from '../../../../../events'
import { AddCircleIcon, DeleteIcon } from '../../../../icons'
import listTransformations from './list-transformations'

export default function emberEditor(ref, type) {
    const pipe = state.definitionList[state.currentDefinitionId][ref.ref][ref.id]

    if (ref.ref === 'split') {
        return (
            <div>
                <div>{emberEditor(pipe.defaultValue, type)} </div>
                {pipe.branches.map(branchRef => {
                    const branch = state.definitionList[state.currentDefinitionId][branchRef.ref][branchRef.id]

                    return (
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{ padding: '0 5px 0 0 ' }}>if</span> {emberEditor(branch.test)}{' '}
                                <span style={{ padding: '0 5px' }}>then</span>
                                {emberEditor(branch.value, type)}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    if (type && type.type === 'variant') {
        return (
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                }}
            >
                {type.values.map((value, index) => (
                    <div
                        style={{
                            background: pipe.value === value ? '#1e1e1e' : '#2b2b2b',
                            color: pipe.value === value ? '#53d486' : '#969696',
                            display: 'inline-block',
                            padding: '15px 10px',
                            whiteSpace: 'nowrap',
                            borderRadius: index === 0 ? '5px 0 0 5px' : index === type.values.length - 1 ? '0 5px 5px 0' : undefined,
                            userSelect: 'none',
                            cursor: 'pointer',
                        }}
                        onClick={e => CHANGE_STATIC_VALUE(ref, 'value', 'text', { target: { value } }, e)}
                    >
                        {value}
                    </div>
                ))}
            </div>
        )
    }
    if (typeof pipe.value === 'string') {
        return (
            <div style={{ display: 'flex', alignItems: 'baseline' }} onClick={e => SELECT_PIPE(ref.id, e)}>
                <span
                    style={{
                        flex: '0 0 auto',
                        minWidth: '50px',
                        position: 'relative',
                        transform: 'translateZ(0)',
                    }}
                >
                    <span
                        style={{
                            opacity: '0',
                            display: 'inline-block',
                            whiteSpace: 'pre',
                            borderBottom: '2px solid white',
                        }}
                    >
                        {pipe.value}
                    </span>
                    <input
                        type="text"
                        style={{
                            color: '#ffffff',
                            outline: 'none',
                            boxShadow: 'none',
                            textAlign: 'left',
                            display: 'inline',
                            border: 'none',
                            borderBottom: '2px solid #ccc',
                            background: 'none',
                            font: 'inherit',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            flex: '0 0 auto',
                            padding: '0px',
                        }}
                        onInput={e => CHANGE_STATIC_VALUE(ref, 'value', 'text', e)}
                        onMouseMove={e => PIPE_HOVERED(ref, e)}
                        onMouseOut={PIPE_UNHOVERED}
                        value={pipe.value}
                    />
                </span>
                {listTransformations(pipe.transformations, ref)}
            </div>
        )
    }

    if (pipe.value === true || pipe.value === false) {
        return (
            <select
                value={pipe.value.toString()}
                style={{
                    background: 'none',
                    outline: 'none',
                    display: 'inline',
                    flex: '1',
                    minWidth: '50px',
                    border: 'none',
                    color: 'white',
                    boxShadow: 'inset 0 -2px 0 0 #828282',
                }}
                onClick={e => SELECT_PIPE(ref.id, e)}
                onInput={e => CHANGE_STATIC_VALUE(ref, 'value', 'boolean', e)}
                onMouseMove={e => PIPE_HOVERED(ref, e)}
                onMouseOut={PIPE_UNHOVERED}
            >
                <option value="true" style={{ color: 'black' }}>
                    true
                </option>
                <option value="false" style={{ color: 'black' }}>
                    false
                </option>
            </select>
        )
    }

    if (!isNaN(parseFloat(Number(pipe.value))) && isFinite(Number(pipe.value))) {
        return (
            <div style={{ display: 'flex', alignItems: 'baseline' }} onClick={e => SELECT_PIPE(ref.id, e)}>
                <span
                    style={{
                        flex: '0 0 auto',
                        minWidth: '50px',
                        position: 'relative',
                        transform: 'translateZ(0)',
                    }}
                >
                    <span
                        style={{
                            opacity: '0',
                            display: 'inline-block',
                            whiteSpace: 'pre',
                            borderBottom: '2px solid white',
                        }}
                    >
                        {Number(pipe.value)}
                    </span>
                    <input
                        type="text"
                        style={{
                            color: '#ffffff',
                            outline: 'none',
                            boxShadow: 'none',
                            textAlign: 'left',
                            display: 'inline',
                            border: 'none',
                            borderBottom: '2px solid #ccc',
                            background: 'none',
                            font: 'inherit',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            flex: '0 0 auto',
                            padding: '0px',
                        }}
                        onInput={e => CHANGE_STATIC_VALUE(ref, 'value', 'number', e)}
                        onMouseMove={e => PIPE_HOVERED(ref, e)}
                        onMouseOut={PIPE_UNHOVERED}
                        value={Number(pipe.value)}
                    />
                </span>
            </div>
        )
    }
    if (pipe.value.ref === 'state' || pipe.value.ref === 'table') {
        const displState = state.definitionList[state.currentDefinitionId][pipe.value.ref][pipe.value.id]
        return (
            <div style={{ flex: '1' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                    onClick={e => SELECT_PIPE(ref.id, e)}
                    onMouseMove={e => PIPE_HOVERED(ref, e)}
                    onMouseOut={PIPE_UNHOVERED}
                >
                    <span
                        style={{
                            color: state.selectedStateNode.id === pipe.value.id ? '#53d486' : '#eab65c',
                            transition: '200ms all',
                            cursor: 'pointer',
                            padding: '2px 0 0 0',
                            borderBottom:
                                '2px solid ' +
                                (pipe.transformations.length > 0
                                    ? state.selectedStateNode.id === pipe.value.id ? '#53d486' : '#eab65c'
                                    : '#ccc'),
                        }}
                        onClick={e => STATE_NODE_SELECTED(pipe.value, e)}
                    >
                        {displState.title}
                    </span>
                    {state.selectedPipeId === ref.id ? (
                        <span
                            style={{
                                flex: '0 0 auto',
                                marginLeft: 'auto',
                            }}
                            onClick={e => ADD_DEFAULT_TRANSFORMATION(state.selectedPipeId, e)}
                        >
                            <AddCircleIcon />
                        </span>
                    ) : (
                        ''
                    )}
                    {state.selectedPipeId === ref.id && pipe.value.ref === 'state' ? (
                        <span style={{ flex: '0 0 auto' }} onClick={e => RESET_PIPE(ref.id, e)}>
                            <DeleteIcon />
                        </span>
                    ) : (
                        ''
                    )}
                </div>
                {listTransformations(pipe.transformations, ref)}
            </div>
        )
    }

    if (pipe.value.ref === 'eventData') {
        return (
            <div>
                <div onClick={e => SELECT_PIPE(ref.id, e)} onMouseMove={e => PIPE_HOVERED(ref, e)} onMouseOut={PIPE_UNHOVERED}>
                    <div style={{ flex: '1' }}>
                        <div
                            style={{
                                cursor: 'pointer',
                                color: state.selectedStateNode.id === pipe.value.id ? '#eab65c' : 'white',
                                padding: '2px 5px',
                                margin: '3px 3px 0 0',
                                border: '2px solid ' + (state.selectedStateNode.id === pipe.value.id ? '#eab65c' : 'white'),
                                display: 'inline-block',
                            }}
                            onClick={e => STATE_NODE_SELECTED(pipe.value, e)}
                        >
                            {pipe.value.id}
                        </div>
                        {state.selectedPipeId === ref.id ? (
                            <span
                                style={{
                                    flex: '0 0 auto',
                                    marginLeft: 'auto',
                                }}
                                onClick={e => ADD_DEFAULT_TRANSFORMATION(state.selectedPipeId, e)}
                            >
                                <AddCircleIcon />
                            </span>
                        ) : (
                            ''
                        )}
                        {state.selectedPipeId === ref.id ? (
                            <span style={{ flex: '0 0 auto' }} onClick={e => RESET_PIPE(ref.id, e)}>
                                <DeleteIcon />
                            </span>
                        ) : (
                            ''
                        )}
                    </div>
                    <div style={{ paddingLeft: '15px' }}>{listTransformations(pipe.transformations, ref)}</div>
                </div>
            </div>
        )
    }
}
