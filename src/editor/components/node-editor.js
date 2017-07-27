import h from 'snabbdom/h'
import {state} from '../state'
import {WIDTH_DRAGGED, SELECT_VIEW_SUBMENU, CHANGE_COMPONENT_PATH, EVENT_HOVERED, EVENT_UNHOVERED, STATE_NODE_SELECTED, ADD_EVENT, COMPONENT_VIEW_DRAGGED, UNSELECT_VIEW_NODE} from '../events'
import {
    listIcon, ifIcon, inputIcon, textIcon, boxIcon, arrowIcon, clearIcon, imageIcon, appIcon
} from './icons'
import emberEditor from './ember'

const fields = {
    vNodeBox: ['style', 'children', 'mouseout', 'mouseover', 'dblclick', 'click'],
    vNodeText: ['style', 'value', 'mouseout', 'mouseover', 'dblclick', 'click'],
    vNodeInput: ['style', 'value', 'mouseout', 'mouseover', 'dblclick', 'click', 'input', 'focus', 'blur'],
    vNodeIf: ['value', 'children'],
    vNodeList: ['value', 'children'],
    vNodeImage: ['style', 'src', 'mouseout', 'mouseover', 'dblclick', 'click'],
    add: ['value'],
    subtract: ['value'],
    multiply: ['value'],
    divide: ['value'],
    remainder: ['value'],
    join: ['value'],
    and: ['value'],
    or: ['value'],
    equal: ['value'],
    event: ['mutators'],
    mutator: ['mutation'],
    style: [
        'background',
        'border',
        'borderRadius',
        'outline',
        'cursor',
        'color',
        'transition',
        'display',
        'top',
        'bottom',
        'left',
        'flex',
        'justifyContent',
        'alignItems',
        'width',
        'height',
        'maxWidth',
        'maxHeight',
        'minWidth',
        'minHeight',
        'right',
        'position',
        'overflow',
        'font',
        'margin',
        'padding',
    ],
    state: [],
    length: [],
    toLowerCase: [],
    toUpperCase: [],
    pipe: ['value', 'transformations'],
}

const dragSubComponentLeft = h('div', {
    on: {
        mousedown: [WIDTH_DRAGGED, 'subEditorWidthLeft'],
        touchstart: [WIDTH_DRAGGED, 'subEditorWidthLeft'],
    },
    style: {
        position: 'absolute',
        left: '2px',
        transform: 'translateX(-100%)',
        top: '0',
        width: '10px',
        height: '100%',
        textAlign: 'center',
        opacity: 0,
        cursor: 'col-resize',
    },
})

const dragSubComponentRight = h('div', {
    on: {
        mousedown: [WIDTH_DRAGGED, 'subEditorWidth'],
        touchstart: [WIDTH_DRAGGED, 'subEditorWidth'],
    },
    style: {
        position: 'absolute',
        right: '2px',
        transform: 'translateX(100%)',
        top: '0',
        width: '10px',
        height: '100%',
        textAlign: 'center',
        opacity: 0,
        cursor: 'col-resize',
    },
})

export default function generateEditNodeComponent() {

    const styles = fields.style
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    const propsComponent = h(
        'div',
        {
            style: {
                background: '#1e1e1e',
                padding: '10px 0',
                flex: '1',
                cursor: 'pointer',
                letterSpacing: '1px',
                textAlign: 'center',
                color: state.selectedViewSubMenu === 'props' ? 'white' : '#acacac',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'props'],
            },
        },
        'Data'
    )
    const styleComponent = h(
        'div',
        {
            style: {
                background: '#1e1e1e',
                padding: '10px 0',
                flex: '1',
                borderRight: '1px solid #222',
                borderLeft: '1px solid #222',
                textAlign: 'center',
                letterSpacing: '1px',
                cursor: 'pointer',
                color: state.selectedViewSubMenu === 'style' ? 'white' : '#acacac',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'style'],
            },
        },
        'Style'
    )
    const eventsComponent = h(
        'div',
        {
            style: {
                background: '#1e1e1e',
                padding: '10px 0',
                flex: '1',
                textAlign: 'center',
                letterSpacing: '1px',
                cursor: 'pointer',
                color: state.selectedViewSubMenu === 'events' ? 'white' : '#acacac',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'events'],
            },
        },
        'Events'
    )

    const tagComponent = h('div', {
        style: {
            position: 'absolute',
            bottom: '0',
            transition: 'all 500ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
            left: state.selectedViewSubMenu === 'props' ? '0' : state.selectedViewSubMenu === 'style' ? '33.334%' : '66.667%',
            background: '#53d486',
            height: '3px',
            width: '33.33%',
        },
    })

    const genpropsSubmenuComponent = () =>
        h('div', [
            (() => {
                if (state.selectedViewNode.id === '_rootNode') {
                    const inputStyle = {
                        color: 'white',
                        background: 'none',
                        outline: 'none',
                        border: 'none',
                        boxShadow: 'inset 0 -2px 0 0 #ccc',
                    }
                    return h(
                        'div',
                        {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '10px 20px',
                            },
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        padding: '20px 20px 0 0',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        color: '#8e8e8e',
                                    },
                                },
                                'react path'
                            ),
                            h('input', {
                                style: inputStyle,
                                on: {
                                    input: [CHANGE_COMPONENT_PATH, 'reactPath'],
                                },
                                liveProps: {
                                    value: state.definitionList[state.currentDefinitionId]['reactPath'],
                                },
                            }),
                            h(
                                'div',
                                {
                                    style: {
                                        padding: '20px 20px 0 0',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        color: '#8e8e8e',
                                    },
                                },
                                'react native path'
                            ),
                            h('input', {
                                style: inputStyle,
                                on: {
                                    input: [CHANGE_COMPONENT_PATH, 'reactNativePath'],
                                },
                                liveProps: {
                                    value: state.definitionList[state.currentDefinitionId]['reactNativePath'],
                                },
                            }),
                        ]
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeBox') {
                    return h(
                        'div',
                        {
                            style: {
                                textAlign: 'center',
                                marginTop: '100px',
                                color: '#bdbdbd',
                            },
                        },
                        'no data required'
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeText') {
                    return h(
                        'div',
                        {
                            style: {overflow: 'auto'},
                            attrs: {class: 'better-scrollbar'},
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        padding: '20px 20px 5px 20px',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        color: '#8e8e8e',
                                    },
                                },
                                'text'
                            ),
                            h('div', {style: {padding: '0 20px'}}, [emberEditor(selectedNode.value, 'text')]),
                        ]
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeImage') {
                    return h(
                        'div',
                        {
                            style: {overflow: 'auto'},
                            attrs: {class: 'better-scrollbar'},
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#676767',
                                        padding: '5px 10px',
                                        marginBottom: '10px',
                                    },
                                },
                                [
                                    h('span', {style: {flex: '1'}}, 'source (url)'),
                                    h(
                                        'div',
                                        {
                                            style: {
                                                flex: '0',
                                                cursor: 'default',
                                                color: '#bdbdbd',
                                            },
                                        },
                                        'text'
                                    ),
                                ]
                            ),
                            h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.src, 'text')]),
                        ]
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeInput') {
                    return h(
                        'div',
                        {
                            style: {overflow: 'auto'},
                            attrs: {class: 'better-scrollbar'},
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#676767',
                                        padding: '5px 10px',
                                        marginBottom: '10px',
                                    },
                                },
                                [
                                    h('span', {style: {flex: '1'}}, 'input value'),
                                    h(
                                        'div',
                                        {
                                            style: {
                                                flex: '0',
                                                cursor: 'default',
                                                color: '#bdbdbd',
                                            },
                                        },
                                        'text'
                                    ),
                                ]
                            ),
                            h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'text')]),
                        ]
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeList') {
                    return h(
                        'div',
                        {
                            style: {overflow: 'auto'},
                            attrs: {class: 'better-scrollbar'},
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#676767',
                                        padding: '5px 10px',
                                        marginBottom: '10px',
                                    },
                                },
                                [
                                    h('span', {style: {flex: '1'}}, 'table'),
                                    h(
                                        'div',
                                        {
                                            style: {
                                                flex: '0',
                                                cursor: 'default',
                                                color: '#bdbdbd',
                                            },
                                        },
                                        'table'
                                    ),
                                ]
                            ),
                            h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'table')]),
                        ]
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeIf') {
                    return h(
                        'div',
                        {
                            style: {overflow: 'auto'},
                            attrs: {class: 'better-scrollbar'},
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#676767',
                                        padding: '5px 10px',
                                        marginBottom: '10px',
                                    },
                                },
                                [
                                    h('span', {style: {flex: '1'}}, 'predicate'),
                                    h(
                                        'div',
                                        {
                                            style: {
                                                flex: '0',
                                                cursor: 'default',
                                                color: '#bdbdbd',
                                            },
                                        },
                                        'true/false'
                                    ),
                                ]
                            ),
                            h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'boolean')]),
                        ]
                    )
                }
                if (state.selectedViewNode.ref === 'vNodeList') {
                    return h(
                        'div',
                        {
                            style: {overflow: 'auto'},
                            attrs: {class: 'better-scrollbar'},
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#676767',
                                        padding: '5px 10px',
                                        marginBottom: '10px',
                                    },
                                },
                                [
                                    h('span', {style: {flex: '1'}}, 'predicate'),
                                    h(
                                        'div',
                                        {
                                            style: {
                                                flex: '0',
                                                cursor: 'default',
                                                color: '#bdbdbd',
                                            },
                                        },
                                        'true/false'
                                    ),
                                ]
                            ),
                            h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'table')]),
                        ]
                    )
                }
            })(),
        ])
    const genstyleSubmenuComponent = () => {
        const selectedStyle = state.definitionList[state.currentDefinitionId].style[selectedNode.style.id]
        return h(
            'div',
            {
                attrs: {class: 'better-scrollbar'},
                style: {overflow: 'auto'},
            },
            [
                h(
                    'div',
                    {
                        style: {
                            padding: '10px 15px 5px',
                            borderBottom: '2px solid #888',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        on: {
                            //click: [SELECT_VIEW_SUBMENU, 'events']
                        },
                    },
                    [arrowIcon(), 'Layout']
                ),
                h(
                    'div',
                    {
                        style: {},
                    },
                    [
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Flex'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['flex'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Height'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [emberEditor(selectedStyle['height'], 'text'), emberEditor(selectedStyle['minHeight'], 'text'), emberEditor(selectedStyle['maxHeight'], 'text')]
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Width Min Max'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [emberEditor(selectedStyle['width'], 'text'), emberEditor(selectedStyle['minWidth'], 'text'), emberEditor(selectedStyle['maxWidth'], 'text')]
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Margin'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [emberEditor(selectedStyle['marginTop'], 'text'), emberEditor(selectedStyle['marginRight'], 'text'), emberEditor(selectedStyle['marginBottom'], 'text'), emberEditor(selectedStyle['marginLeft'], 'text')]
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Padding'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [
                                emberEditor(selectedStyle['paddingTop'], 'text'),
                                emberEditor(selectedStyle['paddingRight'], 'text'),
                                emberEditor(selectedStyle['paddingBottom'], 'text'),
                                emberEditor(selectedStyle['paddingLeft'], 'text'),
                            ]
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Position'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [emberEditor(selectedStyle['position'], 'text')]
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Top Right Bottom Left'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [emberEditor(selectedStyle['top'], 'text'), emberEditor(selectedStyle['right'], 'text'), emberEditor(selectedStyle['bottom'], 'text'), emberEditor(selectedStyle['left'], 'text')]
                        ),
                    ]
                ),
                h(
                    'div',
                    {
                        style: {
                            padding: '10px 15px 5px',
                            borderBottom: '2px solid #888',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        on: {
                            //click: [SELECT_VIEW_SUBMENU, 'events']
                        },
                    },
                    [arrowIcon(), 'Children Layout']
                ),
                h(
                    'div',
                    {
                        style: {},
                    },
                    [
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Horizontal Align'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['justifyContent'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Vertical Align'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['alignItems'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Direction'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['flexDirection'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Wrap'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['flexWrap'], 'text')]),
                    ]
                ),
                h(
                    'div',
                    {
                        style: {
                            padding: '10px 15px 5px',
                            borderBottom: '2px solid #888',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        on: {
                            //click: [SELECT_VIEW_SUBMENU, 'events']
                        },
                    },
                    [arrowIcon(), 'Design']
                ),
                h(
                    'div',
                    {
                        style: {},
                    },
                    [
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Background Color'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['background'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Opacity'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['opacity'], 'number')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Borders'
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '0px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                            },
                            [emberEditor(selectedStyle['borderTop'], 'text'), emberEditor(selectedStyle['borderRight'], 'text'), emberEditor(selectedStyle['borderBottom'], 'text'), emberEditor(selectedStyle['borderLeft'], 'text')]
                        ),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Border Radius'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['borderRadius'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Box Shadow'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['boxShadow'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Cursor'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['cursor'], 'text')]),
                    ]
                ),
                h(
                    'div',
                    {
                        style: {
                            padding: '10px 15px 5px',
                            borderBottom: '2px solid #888',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        on: {
                            //click: [SELECT_VIEW_SUBMENU, 'events']
                        },
                    },
                    [arrowIcon(), 'Text']
                ),
                state.selectedViewNode.ref === 'vNodeText' || state.selectedViewNode.ref === 'vNodeInput'
                    ? h(
                    'div',
                    {
                        style: {},
                    },
                    [
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Font Color'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['color'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Font size'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontSize'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Font Family'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontFamily'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Font Weight'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontWeight'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Font Style'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontStyle'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Line Height'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['lineHeight'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Text decoration line'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['textDecorationLine'], 'text')]),
                        h(
                            'div',
                            {
                                style: {
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                },
                            },
                            'Letter spacing'
                        ),
                        h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['letterSpacing'], 'text')]),
                    ]
                )
                    : h('div'),
            ]
        )
    }
    const geneventsSubmenuComponent = () => {
        let availableEvents = [
            {
                description: 'on click',
                propertyName: 'click',
            },
            {
                description: 'double clicked',
                propertyName: 'dblclick',
            },
            {
                description: 'mouse over',
                propertyName: 'mouseover',
            },
            {
                description: 'mouse out',
                propertyName: 'mouseout',
            },
        ]
        if (state.selectedViewNode.ref === 'vNodeInput') {
            availableEvents = availableEvents.concat([
                {
                    description: 'input',
                    propertyName: 'input',
                },
                {
                    description: 'focus',
                    propertyName: 'focus',
                },
                {
                    description: 'blur',
                    propertyName: 'blur',
                },
            ])
        }
        const currentEvents = availableEvents.filter(event => selectedNode[event.propertyName])
        const eventsLeft = availableEvents.filter(event => !selectedNode[event.propertyName])
        return h(
            'div',
            {
                attrs: {class: 'better-scrollbar'},
                style: {overflow: 'auto'},
            },
            [
                ...(currentEvents.length
                    ? currentEvents.map(eventDesc => {
                    const event = state.definitionList[state.currentDefinitionId][selectedNode[eventDesc.propertyName].ref][selectedNode[eventDesc.propertyName].id]
                    return h('div', [
                        h(
                            'div',
                            {
                                style: {
                                    background: '#676767',
                                    padding: '5px 10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                },
                                on: {
                                    mousemove: [EVENT_HOVERED, selectedNode[eventDesc.propertyName]],
                                    mouseout: [EVENT_UNHOVERED],
                                },
                            },
                            [
                                h('span', event.type),
                                h(
                                    'span',
                                    {
                                        style: {
                                            color: '#bdbdbd',
                                        },
                                    },
                                    '(drop state here)'
                                ),
                            ]
                        ),
                        eventDesc.description === 'input'
                            ? h(
                            'div',
                            {
                                style: {
                                    padding: '10px 10px 0 10px',
                                    color: '#bdbdbd',
                                },
                            },
                            'Hey, input is using event data, but we are currently working on this part. Some functionality might still be missing'
                        )
                            : h('span'),
                        event.mutators.length === 0
                            ? h(
                            'div',
                            {
                                style: {
                                    margin: '10px 0',
                                    padding: '5px 10px',
                                    color: '#bdbdbd',
                                },
                            },
                            ['No transformations. Drag state on event']
                        )
                            : h(
                            'div',
                            {
                                style: {
                                    color: 'white',
                                    transition: 'color 0.2s',
                                    cursor: 'pointer',
                                },
                            },
                            event.mutators.map(mutatorRef => {
                                const mutator = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]
                                const stateDef = state.definitionList[state.currentDefinitionId][mutator.state.ref][mutator.state.id]
                                return h(
                                    'div',
                                    {
                                        style: {
                                            padding: '15px 10px',
                                            borderBottom: '2px solid #929292',
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                    },
                                    [
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    flex: '0 0 auto',
                                                    display: 'inline-block',
                                                    position: 'relative',
                                                    transform: 'translateZ(0)',
                                                    boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === mutator.state.id ? '#eab65c' : '#828282'),
                                                    background: '#1e1e1e',
                                                    padding: '4px 7px',
                                                },
                                            },
                                            [
                                                h(
                                                    'span',
                                                    {
                                                        style: {
                                                            color: 'white',
                                                            display: 'inline-block',
                                                        },
                                                        on: {
                                                            click: [STATE_NODE_SELECTED, mutator.state.id],
                                                        },
                                                    },
                                                    stateDef.title
                                                ),
                                            ]
                                        ),
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    color: 'white',
                                                    fontSize: '1.8em',
                                                    padding: '10px',
                                                },
                                            },
                                            '='
                                        ),
                                        emberEditor(mutator.mutation, stateDef.type),
                                    ]
                                )
                            })
                        ),
                    ])
                })
                    : []),
                h(
                    'div',
                    {
                        style: {
                            marginTop: '10px',
                            padding: '5px 10px',
                            color: '#bdbdbd',
                        },
                    },
                    'add Event:'
                ),
                h('div', {style: {padding: '5px 0 5px 10px'}}, [
                    ...eventsLeft.map(event =>
                        h(
                            'div',
                            {
                                style: {
                                    border: '3px solid #5bcc5b',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    margin: '10px',
                                },
                                on: {
                                    click: [ADD_EVENT, event.propertyName, state.selectedViewNode],
                                },
                            },
                            '+ ' + event.description
                        )
                    ),
                ]),
            ]
        )
    }

    const fullVNode = ['vNodeBox', 'vNodeText', 'vNodeImage', 'vNodeInput'].includes(state.selectedViewNode.ref)

    return h(
        'div',
        {
            style: {
                position: 'fixed',
                color: 'white',
                left: state.componentEditorPosition.x + 'px',
                top: state.componentEditorPosition.y + 'px',
                height: '50%',
                display: 'flex',
                zIndex: '3000',
            },
        },
        [
            h(
                'div',
                {
                    style: {
                        flex: '1',
                        display: 'flex',
                        marginBottom: '10px',
                        flexDirection: 'column',
                        background: '#393939',
                        width: state.subEditorWidth + 'px',
                    },
                },
                [
                    h('div', {style: {flex: '0 0 auto'}}, [
                        h(
                            'div',
                            {
                                style: {
                                    display: 'flex',
                                    cursor: 'default',
                                    alignItems: 'center',
                                    background: '#1e1e1e',
                                    paddingTop: '2px',
                                    paddingBottom: '5px',
                                    color: '#53d486',
                                    fontSize: '18px',
                                    padding: '13px 10px',
                                },
                                on: {
                                    mousedown: [COMPONENT_VIEW_DRAGGED],
                                    touchstart: [COMPONENT_VIEW_DRAGGED],
                                },
                            },
                            [
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            margin: '0 2px 0 5px',
                                            display: 'inline-flex',
                                        },
                                    },
                                    [
                                        state.selectedViewNode.id === '_rootNode'
                                            ? appIcon()
                                            : state.selectedViewNode.ref === 'vNodeBox'
                                            ? boxIcon()
                                            : state.selectedViewNode.ref === 'vNodeList'
                                            ? listIcon()
                                            : state.selectedViewNode.ref === 'vNodeList'
                                            ? ifIcon()
                                            : state.selectedViewNode.ref === 'vNodeInput' ? inputIcon() : state.selectedViewNode.ref === 'vNodeImage' ? imageIcon() : textIcon(),
                                    ]
                                ),
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '5 5 auto',
                                            margin: '0 5px 0 0',
                                            minWidth: '0',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                        },
                                    },
                                    selectedNode.title
                                ),
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            marginLeft: 'auto',
                                            cursor: 'pointer',
                                            marginRight: '5px',
                                            color: 'white',
                                            display: 'inline-flex',
                                            fontSize: '24px',
                                        },
                                        on: {
                                            mousedown: [UNSELECT_VIEW_NODE, false, true],
                                            touchstart: [UNSELECT_VIEW_NODE, false, true],
                                        },
                                    },
                                    [clearIcon()]
                                ),
                            ]
                        ),
                    ]),
                    fullVNode
                        ? h(
                        'div',
                        {
                            style: {
                                display: 'flex',
                                flex: '0 0 auto',
                                position: 'relative',
                            },
                        },
                        [propsComponent, styleComponent, eventsComponent, tagComponent]
                    )
                        : h('span'),
                    dragSubComponentRight,
                    dragSubComponentLeft,
                    state.selectedViewSubMenu === 'props' || !fullVNode
                        ? genpropsSubmenuComponent()
                        : state.selectedViewSubMenu === 'style' ? genstyleSubmenuComponent() : state.selectedViewSubMenu === 'events' ? geneventsSubmenuComponent() : h('span', 'Error, no such menu'),
                ]
            ),
        ]
    )
}