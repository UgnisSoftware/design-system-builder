import React from 'react'
import { state } from 'lape'
import { CHANGE_TRANSFORMATION, DELETE_TRANSFORMATION } from '../../../events'
import { DeleteIcon } from '../../icons'
import emberEditor from './ember'

export default function listTransformations(transformations, ref) {
    return transformations.map((transRef, index) => {
        const transformer = state.definitionList[state.currentDefinitionId][transRef.ref][transRef.id]
        const deleteTransformationIcon = (
            <span style={{ flex: '0 0 auto' }} onClick={() => DELETE_TRANSFORMATION(ref, transRef)}>
                <DeleteIcon />
            </span>
        )
        if (transRef.ref === 'push') {
            const row = state.definitionList[state.currentDefinitionId][transformer.row.ref][transformer.row.id]

            return (
                <div style={{ paddingTop: '5px' }}>
                    {row.columns.map(columnRef => {
                        const column = state.definitionList[state.currentDefinitionId][columnRef.ref][columnRef.id]
                        const columnState = state.definitionList[state.currentDefinitionId][column.state.ref][column.state.id]

                        return (
                            <span>
                                <span
                                    style={{
                                        color: '#bdbdbd',
                                        cursor: 'default',
                                        display: 'inline-block',
                                    }}
                                >
                                    {columnState.title}
                                </span>
                                <span style={{ display: 'inline-block' }}>{emberEditor(column.value)}</span>
                            </span>
                        )
                    })}
                </div>
            )
        }
        if (transRef.ref === 'equal') {
            return (
                <div style={{ paddingTop: '5px' }}>
                    <span
                        style={{
                            color: '#bdbdbd',
                            cursor: 'default',
                            display: 'inline-block',
                        }}
                    >
                        <span style={{ flex: '1' }}>{transRef.ref}</span>
                    </span>
                    <span style={{ display: 'inline-block' }}>{emberEditor(transformer.value)}</span>
                </div>
            )
        }
        if (transRef.ref === 'join') {
            return <span>{emberEditor(transformer.value)}</span>
        }
        if (transRef.ref === 'length') {
            return <div style={{ cursor: 'default', color: '#bdbdbd', paddingTop: '5px' }}>{transRef.ref}</div>
        }

        const numberTransf = [
            { title: 'add', sign: '+' },
            { title: 'subtract', sign: '-' },
            { title: 'multiply', sign: '*' },
            { title: 'divide', sign: '/' },
            { title: 'remainder', sign: '%' },
        ]
        const textTransf = [{ title: 'toUpperCase', sign: 'to upper case' }, { title: 'toLowerCase', sign: 'to lower case' }]
        const boolTransf = [{ title: 'and', sign: 'and' }, { title: 'or', sign: 'or' }, { title: 'not', sign: 'not' }]

        if (
            transRef.ref === 'add' ||
            transRef.ref === 'subtract' ||
            transRef.ref === 'multiply' ||
            transRef.ref === 'divide' ||
            transRef.ref === 'remainder'
        ) {
            return (
                <div
                    style={{
                        paddingTop: '5px',
                        display: 'flex',
                        alignItems: 'stretch',
                    }}
                >
                    <select
                        key={transRef.id}
                        value={transRef.ref}
                        style={{
                            color: 'white',
                            background: 'none',
                            outline: 'none',
                            display: 'inline',
                            border: 'none',
                        }}
                        onInput={e => CHANGE_TRANSFORMATION(ref, transRef, index, e)}
                    >
                        {numberTransf.map(description => (
                            <option value={description.title} style={{ color: 'black' }}>
                                {description.sign}
                            </option>
                        ))}
                    </select>
                    <span
                        style={{
                            color: '#bdbdbd',
                            display: 'flex',
                            cursor: 'default',
                            paddingRight: '5px',
                            borderRight: '2px solid #bdbdbd',
                            marginRight: '5px',
                        }}
                    />
                    <span style={{ display: 'inline-block' }}>{emberEditor(transformer.value)}</span>
                    {deleteTransformationIcon}
                </div>
            )
        }
        if (transRef.ref === 'toUpperCase' || transRef.ref === 'toLowerCase') {
            return (
                <div
                    style={{
                        paddingTop: '5px',
                        display: 'flex',
                        alignItems: 'stretch',
                    }}
                >
                    <select
                        key={transRef.id}
                        value={transRef.ref}
                        style={{
                            color: 'white',
                            background: 'none',
                            outline: 'none',
                            display: 'inline',
                            border: 'none',
                        }}
                        onInput={e => CHANGE_TRANSFORMATION(ref, transRef, index, e)}
                    >
                        {textTransf.map(description => (
                            <option value={description.title} style={{ color: 'black' }}>
                                {description.sign}
                            </option>
                        ))}
                    </select>
                    <span
                        style={{
                            color: '#bdbdbd',
                            display: 'flex',
                            cursor: 'default',
                            paddingRight: '5px',
                            marginRight: '5px',
                        }}
                    />
                    {deleteTransformationIcon}
                </div>
            )
        }
        if (transRef.ref === 'and' || transRef.ref === 'or' || transRef.ref === 'not') {
            return (
                <div
                    style={{
                        paddingTop: '5px',
                        display: 'flex',
                        alignItems: 'stretch',
                    }}
                >
                    <select
                        key={transRef.id}
                        value={transRef.ref}
                        style={{
                            color: 'white',
                            background: 'none',
                            outline: 'none',
                            display: 'inline',
                            border: 'none',
                        }}
                        onInput={e => CHANGE_TRANSFORMATION(ref, transRef, index, e)}
                    >
                        {boolTransf.map(description => (
                            <option value={description.title} style={{ color: 'black' }}>
                                {description.sign}
                            </option>
                        ))}
                        <span
                            style={{
                                color: '#bdbdbd',
                                display: 'flex',
                                cursor: 'default',
                                paddingRight: '5px',
                                borderRight: '2px solid #bdbdbd',
                                marginRight: '5px',
                            }}
                        />
                        {transRef.ref !== 'not' ? (
                            <span
                                style={{
                                    display: 'inline-block',
                                }}
                            >
                                {emberEditor(transformer.value)}
                            </span>
                        ) : (
                            ''
                        )}
                    </select>
                    {deleteTransformationIcon}
                </div>
            )
        }
    })
}
