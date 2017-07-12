import h from 'snabbdom/h'
import {state} from '../state'
import {CHANGE_TRANSFORMATION, SELECT_PIPE, PIPE_HOVERED, RESET_PIPE, PIPE_UNHOVERED, CHANGE_STATIC_VALUE, STATE_NODE_SELECTED, ADD_DEFAULT_TRANSFORMATION} from '../events'
import {
    addCircleIcon, deleteIcon
} from './icons'

export default function emberEditor(ref) {
    const pipe = state.definition[ref.ref][ref.id]

    function listTransformations(transformations) {
        return transformations.map((transRef, index) => {
            const transformer = state.definition[transRef.ref][transRef.id]
            if (transRef.ref === 'equal') {
                return h('div', { style: { paddingTop: '5px' } }, [
                    h(
                        'span',
                        {
                            style: {
                                color: '#bdbdbd',
                                cursor: 'default',
                                display: 'inline-block',
                            },
                        },
                        [h('span', { style: { flex: '1' } }, transRef.ref)]
                    ),
                    h('span', { style: { display: 'inline-block' } }, [emberEditor(transformer.value)]),
                ])
            }
            if (transRef.ref === 'join') {
                return h('span', {}, [emberEditor(transformer.value)])
            }
            if (transRef.ref === 'length') {
                return h('div', { style: { paddingTop: '5px' } }, [h('div', { style: { cursor: 'default' } }, [h('span', { style: { color: '#bdbdbd' } }, transRef.ref)])])
            }

            const numberTransf = [{ title: 'add', sign: '+' }, { title: 'subtract', sign: '-' }, { title: 'multiply', sign: '*' }, { title: 'divide', sign: '/' }, { title: 'remainder', sign: '%' }]
            const textTransf = [{ title: 'toUpperCase', sign: 'to upper case' }, { title: 'toLowerCase', sign: 'to lower case' }]
            const boolTransf = [{ title: 'and', sign: 'and' }, { title: 'or', sign: 'or' }, { title: 'not', sign: 'not' }]

            if (transRef.ref === 'add' || transRef.ref === 'subtract' || transRef.ref === 'multiply' || transRef.ref === 'divide' || transRef.ref === 'remainder') {
                return h(
                    'div',
                    {
                        style: {
                            paddingTop: '5px',
                            display: 'flex',
                            alignItems: 'stretch',
                        },
                    },
                    [
                        h(
                            'select',
                            {
                                key: transRef.id,
                                liveProps: { value: transRef.ref },
                                style: {
                                    color: 'white',
                                    background: 'none',
                                    outline: 'none',
                                    display: 'inline',
                                    border: 'none',
                                },
                                on: {
                                    input: [CHANGE_TRANSFORMATION, ref, transRef, index],
                                },
                            },
                            numberTransf.map(description =>
                                h(
                                    'option',
                                    {
                                        attrs: {
                                            value: description.title,
                                        },
                                        style: { color: 'black' },
                                    },
                                    description.sign
                                )
                            )
                        ),
                        h(
                            'span',
                            {
                                style: {
                                    color: '#bdbdbd',
                                    display: 'flex',
                                    cursor: 'default',
                                    paddingRight: '5px',
                                    borderRight: '2px solid #bdbdbd',
                                    marginRight: '5px',
                                },
                            },
                            [h('span', { style: { flex: '1' } })]
                        ),
                        h('span', { style: { display: 'inline-block' } }, [emberEditor(transformer.value)]),
                    ]
                )
            }
            if (transRef.ref === 'toUpperCase' || transRef.ref === 'toLowerCase') {
                return h(
                    'div',
                    {
                        style: {
                            paddingTop: '5px',
                            display: 'flex',
                            alignItems: 'stretch',
                        },
                    },
                    [
                        h(
                            'select',
                            {
                                key: transRef.id,
                                liveProps: { value: transRef.ref },
                                style: {
                                    color: 'white',
                                    background: 'none',
                                    outline: 'none',
                                    display: 'inline',
                                    border: 'none',
                                },
                                on: {
                                    input: [CHANGE_TRANSFORMATION, ref, transRef, index],
                                },
                            },
                            textTransf.map(description =>
                                h(
                                    'option',
                                    {
                                        attrs: {
                                            value: description.title,
                                        },
                                        style: { color: 'black' },
                                    },
                                    description.sign
                                )
                            )
                        ),
                        h(
                            'span',
                            {
                                style: {
                                    color: '#bdbdbd',
                                    display: 'flex',
                                    cursor: 'default',
                                    paddingRight: '5px',
                                    marginRight: '5px',
                                },
                            },
                            [h('span', { style: { flex: '1' } })]
                        ),
                    ]
                )
            }
            if (transRef.ref === 'and' || transRef.ref === 'or' || transRef.ref === 'not') {
                return h(
                    'div',
                    {
                        style: {
                            paddingTop: '5px',
                            display: 'flex',
                            alignItems: 'stretch',
                        },
                    },
                    [
                        h(
                            'select',
                            {
                                key: transRef.id,
                                liveProps: { value: transRef.ref },
                                style: {
                                    color: 'white',
                                    background: 'none',
                                    outline: 'none',
                                    display: 'inline',
                                    border: 'none',
                                },
                                on: {
                                    input: [CHANGE_TRANSFORMATION, ref, transRef, index],
                                },
                            },
                            boolTransf.map(description =>
                                h(
                                    'option',
                                    {
                                        attrs: {
                                            value: description.title,
                                        },
                                        style: { color: 'black' },
                                    },
                                    description.sign
                                )
                            )
                        ),
                        h(
                            'span',
                            {
                                style: {
                                    color: '#bdbdbd',
                                    display: 'flex',
                                    cursor: 'default',
                                    paddingRight: '5px',
                                    borderRight: '2px solid #bdbdbd',
                                    marginRight: '5px',
                                },
                            },
                            [h('span', { style: { flex: '1' } })]
                        ),
                        transRef.ref === 'not'
                            ? h('span')
                            : h(
                            'span',
                            {
                                style: {
                                    display: 'inline-block',
                                },
                            },
                            [emberEditor(transformer.value)]
                        ),
                    ]
                )
            }
        })
    }

    if (typeof pipe.value === 'string') {
        return h(
            'div',
            {
                style: { display: 'flex', alignItems: 'baseline' },
                on: { click: [SELECT_PIPE, ref.id] },
            },
            [
                h(
                    'span',
                    {
                        style: {
                            flex: '0 0 auto',
                            minWidth: '50px',
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
                                    display: 'inline-block',
                                    whiteSpace: 'pre',
                                    borderBottom: '2px solid white',
                                },
                            },
                            pipe.value
                        ),
                        h('input', {
                            attrs: {
                                type: 'text',
                            },
                            style: {
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
                            },
                            on: {
                                input: [CHANGE_STATIC_VALUE, ref, 'value', 'text'],
                                mousemove: [PIPE_HOVERED, ref],
                                mouseout: [PIPE_UNHOVERED],
                            },
                            liveProps: {
                                value: pipe.value,
                            },
                        }),
                    ]
                ),
                ...listTransformations(pipe.transformations, pipe.type),
            ]
        )
    }

    if (pipe.value === true || pipe.value === false) {
        return h(
            'select',
            {
                liveProps: { value: pipe.value.toString() },
                style: {
                    background: 'none',
                    outline: 'none',
                    display: 'inline',
                    flex: '1',
                    minWidth: '50px',
                    border: 'none',
                    color: 'white',
                    boxShadow: 'inset 0 -2px 0 0 #828282',
                },
                on: {
                    click: [SELECT_PIPE, ref.id],
                    input: [CHANGE_STATIC_VALUE, ref, 'value', 'boolean'],
                    mousemove: [PIPE_HOVERED, ref],
                    mouseout: [PIPE_UNHOVERED],
                },
            },
            [
                h(
                    'option',
                    {
                        attrs: { value: 'true' },
                        style: { color: 'black' },
                    },
                    ['true']
                ),
                h(
                    'option',
                    {
                        attrs: { value: 'false' },
                        style: { color: 'black' },
                    },
                    ['false']
                ),
            ]
        )
    }

    if (!isNaN(parseFloat(Number(pipe.value))) && isFinite(Number(pipe.value))) {
        return h(
            'div',
            {
                style: { display: 'flex', alignItems: 'baseline' },
                on: { click: [SELECT_PIPE, ref.id] },
            },
            [
                h(
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
                                    display: 'inline-block',
                                    whiteSpace: 'pre',
                                    borderBottom: '2px solid white',
                                },
                            },
                            Number(pipe.value)
                        ),
                        h('input', {
                            attrs: { type: 'number' },
                            style: {
                                color: 'white',
                                outline: 'none',
                                boxShadow: 'none',
                                textAlign: 'center',
                                display: 'inline',
                                border: 'none',
                                borderBottom: '2px solid white',
                                background: 'none',
                                font: 'inherit',
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                flex: '0 0 auto',
                                padding: '0px',
                            },
                            on: {
                                input: [CHANGE_STATIC_VALUE, ref, 'value', 'number'],
                                mousemove: [PIPE_HOVERED, ref],
                                mouseout: [PIPE_UNHOVERED],
                            },
                            liveProps: {
                                value: Number(pipe.value),
                            },
                        }),
                    ]
                ),
                ...listTransformations(pipe.transformations, pipe.type),
            ]
        )
    }

    if (pipe.value.ref === 'state') {
        const displState = state.definition[pipe.value.ref][pipe.value.id]
        return h(
            'div',
            { style: { flex: '1' } },
            [
                h(
                    'div',
                    {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                        },
                        on: {
                            click: [SELECT_PIPE, ref.id],
                            mousemove: [PIPE_HOVERED, ref],
                            mouseout: [PIPE_UNHOVERED],
                        },
                    },
                    [
                        h(
                            'span',
                            {
                                style: {
                                    color: state.selectedStateNodeId === pipe.value.id ? '#53d486' : '#eab65c',
                                    transition: '200ms all',
                                    cursor: 'pointer',
                                    padding: '2px 0 0 0',
                                    borderBottom: '2px solid ' + (pipe.transformations.length > 0 ? (state.selectedStateNodeId === pipe.value.id ? '#53d486' : '#eab65c') : '#ccc'),
                                },
                                on: {
                                    click: [STATE_NODE_SELECTED, pipe.value.id],
                                    mousemove: [PIPE_HOVERED, ref],
                                    mouseout: [PIPE_UNHOVERED],
                                },
                            },
                            displState.title
                        ),
                        state.selectedPipeId === ref.id
                            ? h(
                            'span',
                            {
                                style: {
                                    flex: '0 0 auto',
                                    marginLeft: 'auto',
                                },
                                on: {
                                    click: [ADD_DEFAULT_TRANSFORMATION, state.selectedPipeId],
                                },
                            },
                            [addCircleIcon()]
                        )
                            : h('span'),
                        state.selectedPipeId === ref.id
                            ? h(
                            'span',
                            {
                                style: { flex: '0 0 auto' },
                                on: {
                                    click: [RESET_PIPE, ref.id],
                                },
                            },
                            [deleteIcon()]
                        )
                            : h('span'),
                    ]
                ),
            ].concat(state.selectedPipeId === ref.id ? listTransformations(pipe.transformations, pipe.type) : [])
        )
    }

    if (pipe.value.ref === 'eventData') {
        const eventData = state.definition[pipe.value.ref][pipe.value.id]
        return h('div', [
            h(
                'div',
                {
                    style: { display: 'flex', alignItems: 'center' },
                    on: { click: [SELECT_PIPE, ref.id] },
                },
                [
                    h('div', { style: { flex: '1' } }, [
                        h(
                            'div',
                            {
                                style: {
                                    cursor: 'pointer',
                                    color: state.selectedStateNodeId === pipe.value.id ? '#eab65c' : 'white',
                                    padding: '2px 5px',
                                    margin: '3px 3px 0 0',
                                    border: '2px solid ' + (state.selectedStateNodeId === pipe.value.id ? '#eab65c' : 'white'),
                                    display: 'inline-block',
                                },
                                on: {
                                    click: [STATE_NODE_SELECTED, pipe.value.id],
                                },
                            },
                            [eventData.title]
                        ),
                    ]),
                ]
            ),
            h('div', { style: { paddingLeft: '15px' } }, listTransformations(pipe.transformations, pipe.type)),
        ])
    }
}