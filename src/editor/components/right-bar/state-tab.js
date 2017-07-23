import h from 'snabbdom/h'
import {state} from '../../state'
import {
    CHANGE_STATE_NODE_TITLE, STATE_DRAGGED, HOVER_MOBILE, EDIT_VIEW_NODE_TITLE, DELETE_STATE, CHANGE_CURRENT_STATE_BOOLEAN_VALUE, STATE_NODE_SELECTED,
    CHANGE_CURRENT_STATE_TEXT_VALUE, CHANGE_CURRENT_STATE_NUMBER_VALUE, SAVE_DEFAULT, VIEW_NODE_SELECTED, UNSELECT_STATE_NODE, ADD_STATE
} from '../../events'
import {
    deleteIcon, listIcon, saveIcon, ifIcon, inputIcon, textIcon, boxIcon, numberIcon
} from '../icons'
import app from '../../live-app'

const addStateComponent = ()=> h(
    'div',
    {
        style: {
            fontSize: '32px',
            flex: '0 auto',
            height: '40px',
            maxWidth: '175px',
            display: 'flex',
            alignItems: 'center',
            padding: '15px 0px 10px 0px',
            justifyContent: 'space-between',
        },
    },
    [
        h('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'text'] } }, [textIcon()]),
        h('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'number'] } }, [numberIcon()]),
        h('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'boolean'] } }, [ifIcon()]),
        h('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'table'] } }, [listIcon()]),
    ]
)

function listState(stateRef) {
    const stateId = stateRef.id
    const currentState = state.definitionList[state.currentDefinitionId][stateRef.ref][stateId]
    function editingNode() {
        return h('input', {
            style: {
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
            },
            on: {
                input: [CHANGE_STATE_NODE_TITLE, stateId],
            },
            liveProps: {
                value: currentState.title,
            },
            attrs: {
                'data-istitleeditor': true,
            },
        })
    }
    return h(
        'div',
        {
            style: {
                position: 'relative',
                marginBottom: '10px',
            },
        },
        [
            h(
                'span',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '5px',
                        cursor: 'pointer',
                    },
                },
                [
                    h(
                        'span',
                        {
                            style: {
                                flex: '0 0 auto',
                                position: 'relative',
                                transform: 'translateZ(0)',
                                margin: '0 auto 0 0',
                                boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#828282'),
                                background: '#1e1e1e',
                                padding: '4px 7px',
                            },
                        },
                        [
                            h(
                                'span',
                                {
                                    style: {
                                        opacity: state.editingTitleNodeId === stateId ? '0' : '1',
                                        color: 'white',
                                        display: 'inline-block',
                                    },
                                    on: {
                                        mousedown: [STATE_DRAGGED, stateId],
                                        touchstart: [STATE_DRAGGED, stateId],
                                        touchmove: [HOVER_MOBILE],
                                        dblclick: [EDIT_VIEW_NODE_TITLE, stateId],
                                    },
                                },
                                currentState.title
                            ),
                            state.editingTitleNodeId === stateId ? editingNode() : h('span'),
                        ]
                    ),
                    h('div', { style: { display: 'inline-flex' } }, [
                        (() => {
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
                                return h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            position: 'relative',
                                            transform: 'translateZ(0)',
                                        },
                                    },
                                    [
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    opacity: '0',
                                                    minWidth: '50px',
                                                    display: 'inline-block',
                                                },
                                            },
                                            app.getCurrentState()[stateId].toString()
                                        ),
                                        h('input', {
                                            attrs: { type: 'text' },
                                            liveProps: {
                                                value: app.getCurrentState()[stateId],
                                            },
                                            style: noStyleInput,
                                            on: {
                                                input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId],
                                            },
                                        }),
                                    ]
                                )
                            }
                            if (currentState.type === 'number') {
                                return h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            position: 'relative',
                                            transform: 'translateZ(0)',
                                        },
                                    },
                                    [
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    opacity: '0',
                                                    minWidth: '50px',
                                                    display: 'inline-block',
                                                },
                                            },
                                            app.getCurrentState()[stateId].toString()
                                        ),
                                        h('input', {
                                            attrs: { type: 'number' },
                                            liveProps: {
                                                value: app.getCurrentState()[stateId],
                                            },
                                            style: noStyleInput,
                                            on: {
                                                input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId],
                                            },
                                        }),
                                    ]
                                )
                            }
                            if (currentState.type === 'boolean') {
                                return h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            position: 'relative',
                                            transform: 'translateZ(0)',
                                        },
                                    },
                                    [
                                        h(
                                            'select',
                                            {
                                                liveProps: {
                                                    value: app.getCurrentState()[stateId].toString(),
                                                },
                                                style: {
                                                    color: 'white',
                                                    background: 'none',
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'inset 0 -2px 0 0 #ccc',
                                                },
                                                on: {
                                                    input: [CHANGE_CURRENT_STATE_BOOLEAN_VALUE, stateId],
                                                },
                                            },
                                            [
                                                h(
                                                    'option',
                                                    {
                                                        attrs: {
                                                            value: 'true',
                                                        },
                                                        style: {
                                                            color: 'black',
                                                        },
                                                    },
                                                    ['true']
                                                ),
                                                h(
                                                    'option',
                                                    {
                                                        attrs: {
                                                            value: 'false',
                                                        },
                                                        style: {
                                                            color: 'black',
                                                        },
                                                    },
                                                    ['false']
                                                ),
                                            ]
                                        ),
                                    ]
                                )
                            }
                            if (currentState.type === 'table') {
                                // if (state.selectedStateNodeId !== stateId) {
                                //     return h(
                                //         'div',
                                //         {
                                //             key: 'icon',
                                //             on: {
                                //                 click: [STATE_NODE_SELECTED, stateId],
                                //             },
                                //             style: {
                                //                 display: 'flex',
                                //                 alignItems: 'center',
                                //                 marginTop: '7px',
                                //             },
                                //         },
                                //         [listIcon()]
                                //     )
                                // }
                                const table = app.getCurrentState()[stateId]
                                const columns = currentState.columns.map(childRef => state.definitionList[state.currentDefinitionId][childRef.ref][childRef.id].title)
                                return h(
                                    'div',
                                    {
                                        key: 'table',
                                        style: {
                                            background: '#828183',
                                            width: '100%',
                                            flex: '0 0 100%',
                                        },
                                    },
                                    [
                                        h(
                                            'div',
                                            {
                                                style: {
                                                    display: 'flex',
                                                },
                                            },
                                            columns.map( name =>
                                                h(
                                                    'div',
                                                    {
                                                        style: {
                                                            flex: '1',
                                                            padding: '2px 5px',
                                                            borderBottom: '2px solid white',
                                                        },
                                                    },
                                                    name
                                                )
                                            )
                                        ),
                                        h('div', {},
                                            table.map(row =>
                                                h('div', {},
                                                    currentState.columns.map(childRef =>
                                                        h(
                                                            'div',
                                                            {
                                                                style: {
                                                                    flex: '1',
                                                                    padding: '2px 5px',
                                                                },
                                                            },
                                                            row[childRef.id]
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                    ]
                                )
                            }
                        })(),
                    ]),
                    h(
                        'div',
                        {
                            style: {
                                color: app.getCurrentState()[stateId] !== state.definitionList[state.currentDefinitionId][stateRef.ref][stateId].defaultValue ? 'white' : '#aaa',
                                display: 'inline-flex',
                                alignSelf: 'center',
                                padding: '0 2px 0 5px'
                            },
                            on: { click: [SAVE_DEFAULT, stateId] },
                        },
                        [saveIcon()]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                color: '#eab65c',
                                display: 'inline-flex',
                                alignSelf: 'center',
                            },
                            on: {
                                click: [DELETE_STATE, stateId],
                            },
                        },
                        [deleteIcon()]
                    ),
                ]
            ),
            state.selectedStateNodeId === stateId
                ? h('div', { style: { paddingLeft: '10px' } }, [
                h(
                    'div',
                    {
                        style: {
                            fontSize: '12px',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                            marginBottom: '0',
                            marginTop: '10px',
                        },
                    },
                    'CHANGED BY'
                ),
                h(
                    'span',
                    currentState.mutators.map(mutatorRef => {
                        const mutator = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]
                        const event = state.definitionList[state.currentDefinitionId][mutator.event.ref][mutator.event.id]
                        const emitter = state.definitionList[state.currentDefinitionId][event.emitter.ref][event.emitter.id]
                        return h(
                            'div',
                            {
                                style: {
                                    display: 'flex',
                                    cursor: 'pointer',
                                    alignItems: 'center',
                                    background: '#1e1e1e',
                                    paddingTop: '3px',
                                    paddingBottom: '3px',
                                    color: state.selectedViewNode.id === event.emitter.id ? '#53d486' : 'white',
                                    transition: '0.2s all',
                                    minWidth: '100%',
                                },
                                on: {
                                    click: [VIEW_NODE_SELECTED, event.emitter],
                                },
                            },
                            [
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            margin: '0 3px 0 5px',
                                            display: 'inline-flex',
                                        },
                                    },
                                    [
                                        event.emitter.ref === 'vNodeBox'
                                            ? boxIcon()
                                            : event.emitter.ref === 'vNodeList' ? listIcon() : event.emitter.ref === 'vNodeList' ? ifIcon() : event.emitter.ref === 'vNodeInput' ? inputIcon() : textIcon(),
                                    ]
                                ),
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            margin: '0 5px 0 0',
                                            minWidth: '0',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                        },
                                    },
                                    emitter.title
                                ),
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            marginLeft: 'auto',
                                            marginRight: '5px',
                                        },
                                    },
                                    event.type
                                ),
                            ]
                        )
                    })
                ),
                h(
                    'div',
                    {
                        style: {
                            fontSize: '12px',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                            marginBottom: '0',
                            marginTop: '10px',
                        },
                    },
                    'USED IN (TODO)'
                ),
            ])
                : h('span'),
        ]
    )
}

export default ()=> h(
    'div',
    {
        key: 'state',
        attrs: { class: 'better-scrollbar' },
        style: { overflow: 'auto', flex: '1', padding: '20px' },
        on: { click: [UNSELECT_STATE_NODE] },
    },
    [
        h(
            'div',
            {
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    color: '#8e8e8e',
                },
            },
            'ADD NEW'
        ),
        addStateComponent(),
        h(
            'div',
            {
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    color: '#8e8e8e',
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                },
            },
            [
                h('span', 'COMPONENTS STATE '),
                h('span', 'CURRENT VALUE'),
            ]
        ),
        ...state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'].children.map(ref => listState(ref)),
    ]
)