import h from 'snabbdom/h'
import {state} from '../state'
import {
    WIDTH_DRAGGED, CHANGE_STATE_NODE_TITLE, STATE_DRAGGED, HOVER_MOBILE, EDIT_VIEW_NODE_TITLE, DELETE_STATE, CHANGE_CURRENT_STATE_BOOLEAN_VALUE, STATE_NODE_SELECTED,
    CHANGE_CURRENT_STATE_TEXT_VALUE, CHANGE_CURRENT_STATE_NUMBER_VALUE, SAVE_DEFAULT, VIEW_NODE_SELECTED, UNSELECT_STATE_NODE, ADD_STATE, CHANGE_VIEW_NODE_TITLE,
    VIEW_UNHOVERED, VIEW_HOVERED, ADD_NODE, VIEW_DRAGGED, CHANGE_MENU,
} from '../events'
import {
    deleteIcon, listIcon, saveIcon, ifIcon, inputIcon, textIcon, boxIcon, numberIcon, dotIcon, arrowIcon, clearIcon, imageIcon, repeatIcon, linkIcon, historyIcon
} from './icons'
import app from '../live-app'

const dragComponentRight = ()=> h('div', {
    on: {
        mousedown: [WIDTH_DRAGGED, 'editorRightWidth'],
        touchstart: [WIDTH_DRAGGED, 'editorRightWidth'],
    },
    style: {
        position: 'absolute',
        left: '0',
        transform: 'translateX(-100%)',
        top: '0',
        width: '10px',
        height: '100%',
        textAlign: 'center',
        opacity: '0',
        cursor: 'col-resize',
    },
})


// STATE


function listState(stateId) {
    const currentState = state.definition.state[stateId]
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
                        flexWrap: 'wrap',
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
                                margin: '0 7px 0 0',
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
                    state.selectedStateNodeId === stateId
                        ? h(
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
                    )
                        : h('span'),
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
                    'CURRENT VALUE'
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
                            if (state.selectedStateNodeId !== stateId) {
                                return h(
                                    'div',
                                    {
                                        key: 'icon',
                                        on: {
                                            click: [STATE_NODE_SELECTED, stateId],
                                        },
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginTop: '7px',
                                        },
                                    },
                                    [listIcon()]
                                )
                            }
                            const table = app.getCurrentState()[stateId]
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
                                        Object.keys(currentState.definition).map(key =>
                                            h(
                                                'div',
                                                {
                                                    style: {
                                                        flex: '1',
                                                        padding: '2px 5px',
                                                        borderBottom: '2px solid white',
                                                    },
                                                },
                                                key
                                            )
                                        )
                                    ),
                                    ...Object.keys(table).map(id =>
                                        h(
                                            'div',
                                            {
                                                style: {
                                                    display: 'flex',
                                                },
                                            },
                                            Object.keys(table[id]).map(key =>
                                                h(
                                                    'div',
                                                    {
                                                        style: {
                                                            flex: '1',
                                                            padding: '2px 5px',
                                                        },
                                                    },
                                                    table[id][key]
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
                            color: app.getCurrentState()[stateId] !== state.definition.state[stateId].defaultValue ? 'white' : '#aaa',
                            display: 'inline-flex',
                            alignSelf: 'center',
                        },
                        on: { click: [SAVE_DEFAULT, stateId] },
                    },
                    [saveIcon()]
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
                    'CHANGED BY'
                ),
                h(
                    'span',
                    currentState.mutators.map(mutatorRef => {
                        const mutator = state.definition[mutatorRef.ref][mutatorRef.id]
                        const event = state.definition[mutator.event.ref][mutator.event.id]
                        const emitter = state.definition[event.emitter.ref][event.emitter.id]
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

const stateComponent = ()=> h(
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
                },
            },
            'GLOBAL STATE'
        ),
        ...state.definition.nameSpace['_rootNameSpace'].children.map(ref => listState(ref.id)),
    ]
)

// VIEW

function listNode(nodeRef, parentRef, depth) {
    if (nodeRef.id === '_rootNode') return listRootNode(nodeRef)
    if (nodeRef.ref === 'vNodeText') return simpleNode(nodeRef, parentRef, depth)
    if (nodeRef.ref === 'vNodeImage') return simpleNode(nodeRef, parentRef, depth)
    if (nodeRef.ref === 'vNodeBox' || nodeRef.ref === 'vNodeList' || nodeRef.ref === 'vNodeIf') return listBoxNode(nodeRef, parentRef, depth)
    if (nodeRef.ref === 'vNodeInput') return simpleNode(nodeRef, parentRef, depth)
}

function prevent_bubbling(e) {
    e.stopPropagation()
}
function editingNode(nodeRef) {
    return h('input', {
        style: {
            border: 'none',
            background: 'none',
            color: '#53d486',
            outline: 'none',
            flex: '1',
            padding: '0',
            boxShadow: 'inset 0 -1px 0 0 #53d486',
            font: 'inherit',
            marginLeft: '5px',
        },
        on: {
            mousedown: prevent_bubbling,
            input: [CHANGE_VIEW_NODE_TITLE, nodeRef],
        },
        liveProps: {
            value: state.definition[nodeRef.ref][nodeRef.id].title,
        },
        attrs: {
            autofocus: true,
            'data-istitleeditor': true,
        },
    })
}


function listRootNode(nodeRef) {
    const nodeId = nodeRef.id
    const node = state.definition[nodeRef.ref][nodeId]
    return h(
        'div',
        {
            style: {
                position: 'relative',
                fontSize: '18px',
                fontWeight: '300',
            },
        },
        [
            h(
                'div',
                {
                    style: {
                        padding: '3px 0',
                        borderBottom: '3px solid #292929',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                    },
                    on: {
                        mousemove: [VIEW_HOVERED, nodeRef, {}, 1],
                        mouseout: [VIEW_UNHOVERED],
                        touchmove: [HOVER_MOBILE],
                    },
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                padding: '0 3px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '3px',
                                background: state.selectedViewNode.id === nodeId || state.hoveredViewWithoutDrag === nodeId ? '#303030' : 'none',
                            },
                            on: {
                                click: [VIEW_NODE_SELECTED, nodeRef],
                            },
                        },
                        [
                            h(
                                'span',
                                {
                                    key: nodeId,
                                    style: {
                                        color: '#53d486',
                                        display: 'inline-flex',
                                    },
                                },
                                [dotIcon()]
                            ),
                            state.editingTitleNodeId === nodeId
                                ? editingNode(nodeRef)
                                : h(
                                'span',
                                {
                                    style: {
                                        flex: '1',
                                        cursor: 'pointer',
                                        color: state.selectedViewNode.id === nodeId ? '#53d486' : 'white',
                                        transition: 'color 0.2s',
                                        paddingLeft: '5px',
                                    },
                                    on: {
                                        dblclick: [EDIT_VIEW_NODE_TITLE, nodeId],
                                    },
                                },
                                node.title
                            ),
                        ]
                    ),
                ]
            ),
            h(
                'div',
                state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId && !(node.children.findIndex(ref => ref.id === state.draggedComponentView.id) === state.hoveredViewNode.position)
                    ? (() => {
                    // copy pasted from listBoxNode
                    const oldPosition = node.children.findIndex(ref => ref.id === state.draggedComponentView.id)
                    const newPosition = oldPosition === -1 || state.hoveredViewNode.position < oldPosition ? state.hoveredViewNode.position : state.hoveredViewNode.position + 1
                    const children = node.children.map(ref => listNode(ref, nodeRef, 1))
                    return children.slice(0, newPosition).concat(spacerComponent(), children.slice(newPosition))
                })()
                    : node.children.map(ref => listNode(ref, nodeRef, 1))
            ),
            h('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    height: '15px',
                },
                on: {
                    mousemove: [VIEW_HOVERED, { id: '_lastNode' }, {}, 1],
                    touchmove: [HOVER_MOBILE],
                },
            }),
        ]
    )
}

function listBoxNode(nodeRef, parentRef, depth) {
    const nodeId = nodeRef.id
    const node = state.definition[nodeRef.ref][nodeId]
    return h(
        'div',
        {
            style: {
                opacity: state.draggedComponentView && state.draggedComponentView.id === nodeId ? '0.5' : '1.0',
            },
        },
        [
            h(
                'div',
                {
                    style: {
                        borderBottom: '3px solid #292929',
                        padding: '3px 0',
                        cursor: 'pointer',
                        marginLeft: depth * 20 + 'px',
                    },
                    on: {
                        mousedown: [VIEW_DRAGGED, nodeRef, parentRef, depth],
                        touchstart: [VIEW_DRAGGED, nodeRef, parentRef, depth],
                        mousemove: [VIEW_HOVERED, nodeRef, parentRef, depth],
                        mouseout: [VIEW_UNHOVERED],
                        touchmove: [HOVER_MOBILE],
                    },
                },
                [
                    h(
                        'div',
                        {
                            key: nodeId,
                            style: {
                                display: 'flex',
                                height: '30px',
                                borderRadius: '3px',
                                padding: '0 3px',
                                position: 'relative',
                                alignItems: 'center',
                                whiteSpace: 'nowrap',
                                background: state.selectedViewNode.id === nodeId || state.hoveredViewWithoutDrag === nodeId ? '#303030' : 'none',
                                color: state.selectedViewNode.id === nodeId ? '#53d486' : 'white',
                            },
                        },
                        [
                            node.children.length > 0 || (state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId)
                                ? h(
                                'span',
                                {
                                    style: {
                                        display: 'inline-flex',
                                        color: state.selectedViewNode.id === nodeId ? '#fff' : '#8e8e8e',
                                    },
                                },
                                [arrowIcon(state.viewFoldersClosed[nodeId] || (state.draggedComponentView && nodeId === state.draggedComponentView.id))]
                            )
                                : h('span'),
                            h(
                                'span',
                                {
                                    key: nodeId,
                                    style: {
                                        display: 'inline-flex',
                                        color: state.selectedViewNode.id === nodeId ? '#fff' : '#8e8e8e',
                                        transition: 'color 0.2s',
                                    },
                                },
                                [nodeRef.ref === 'vNodeBox' ? boxIcon() : nodeRef.ref === 'vNodeList' ? listIcon() : ifIcon()]
                            ),
                            state.editingTitleNodeId === nodeId
                                ? editingNode(nodeRef)
                                : h(
                                'span',
                                {
                                    style: {
                                        flex: '1',
                                        color: state.selectedViewNode.id === nodeId ? '#53d486' : 'white',
                                        transition: 'color 0.2s',
                                        paddingLeft: '5px',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                    },
                                    on: {
                                        dblclick: [EDIT_VIEW_NODE_TITLE, nodeId],
                                    },
                                },
                                node.title
                            ),
                            h(
                                'div',
                                {
                                    style: {
                                        color: '#53d486',
                                        display: state.selectedViewNode.id === nodeId ? 'inline-flex' : 'none',
                                        flex: '0 0 auto',
                                    },
                                },
                                [clearIcon()]
                            ),
                        ]
                    ),
                ]
            ),
            h(
                'div',
                {
                    style: {
                        display: state.viewFoldersClosed[nodeId] || (state.draggedComponentView && nodeId === state.draggedComponentView.id) ? 'none' : 'block',
                    },
                },
                state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId && !(node.children.findIndex(ref => ref.id === state.draggedComponentView.id) === state.hoveredViewNode.position)
                    ? (() => {
                    // adds a fake component
                    const oldPosition = node.children.findIndex(ref => ref.id === state.draggedComponentView.id) // this is needed because we still show the old node
                    const newPosition = oldPosition === -1 || state.hoveredViewNode.position < oldPosition ? state.hoveredViewNode.position : state.hoveredViewNode.position + 1
                    const children = node.children.map(ref => listNode(ref, nodeRef, depth + 1))
                    return children.slice(0, newPosition).concat(spacerComponent(), children.slice(newPosition))
                })()
                    : node.children.map(ref => listNode(ref, nodeRef, depth + 1))
            ),
        ]
    )
}
function simpleNode(nodeRef, parentRef, depth) {
    const nodeId = nodeRef.id
    const node = state.definition[nodeRef.ref][nodeId]
    return h(
        'div',
        {
            style: {
                borderBottom: '3px solid #292929',
                padding: '3px 0',
                cursor: 'pointer',
                marginLeft: depth * 20 + 'px',
                opacity: state.draggedComponentView && state.draggedComponentView.id === nodeId ? '0.5' : '1.0',
            },
            on: {
                mousedown: [VIEW_DRAGGED, nodeRef, parentRef, depth],
                touchstart: [VIEW_DRAGGED, nodeRef, parentRef, depth],
                dblclick: [EDIT_VIEW_NODE_TITLE, nodeId],
                mousemove: [VIEW_HOVERED, nodeRef, parentRef, depth],
                mouseout: [VIEW_UNHOVERED],
                touchmove: [HOVER_MOBILE],
            },
        },
        [
            h(
                'div',
                {
                    key: nodeId,
                    style: {
                        position: 'relative',
                        background: state.selectedViewNode.id === nodeId || state.hoveredViewWithoutDrag === nodeId ? '#303030' : 'none',
                        height: '30px',
                        padding: '0 3px',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                    },
                },
                [
                    h(
                        'span',
                        {
                            style: {
                                display: 'inline-flex',
                                color: state.selectedViewNode.id === nodeId ? '#fff' : '#8e8e8e',
                            },
                        },
                        [nodeRef.ref === 'vNodeInput' ? inputIcon() : nodeRef.ref === 'vNodeImage' ? imageIcon() : textIcon()]
                    ),
                    state.editingTitleNodeId === nodeId
                        ? editingNode(nodeRef)
                        : h(
                        'span',
                        {
                            style: {
                                flex: '1',
                                color: state.selectedViewNode.id === nodeId ? '#53d486' : 'white',
                                transition: 'color 0.2s',
                                paddingLeft: '5px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            },
                        },
                        node.title
                    ),
                    h(
                        'div',
                        {
                            style: {
                                color: '#53d486',
                                cursor: 'pointer',
                                display: state.selectedViewNode.id === nodeId ? 'inline-flex' : 'none',
                                flex: '0 0 auto',
                            },
                        },
                        [clearIcon()]
                    ),
                ]
            ),
        ]
    )
}

function spacerComponent() {
    return h('div', {
        key: 'spacer',
        style: {
            cursor: 'pointer',
            height: '6px',
            boxShadow: 'inset 0 0 1px 1px #53d486',
        },
    })
}

const addViewNodeComponent = h(
    'div',
    {
        style: {
            fontSize: '32px',
            maxWidth: '385px',
            flex: '0 auto',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            padding: '15px 0px 10px 0px',
            justifyContent: 'space-between',
        },
    },
    [
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'box'],
                },
            },
            [boxIcon()]
        ),
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'text'],
                },
            },
            [textIcon()]
        ),
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'image'],
                },
            },
            [imageIcon()]
        ),
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'input'],
                },
            },
            [inputIcon()]
        ),
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'link'],
                },
            },
            [linkIcon()]
        ),
        h('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'if'] } }, [ifIcon()]),
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'list'],
                },
            },
            [listIcon()]
        ),
        h(
            'span',
            {
                on: {
                    click: [ADD_NODE, state.selectedViewNode, 'repeat'],
                },
            },
            [repeatIcon()]
        ),
    ]
)

const viewComponent = ()=> h(
    'div',
    {
        key: 'view',
        attrs: { class: 'better-scrollbar' },
        style: {
            overflow: 'auto',
            position: 'relative',
            flex: '1',
            padding: '20px',
        },
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
        addViewNodeComponent,
        h(
            'div',
            {
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    color: '#8e8e8e',
                    marginBottom: '10px',
                },
            },
            'NAVIGATOR'
        ),
        listNode({ ref: 'vNodeBox', id: '_rootNode' }, {}, 0),
    ]
)

const eventComponent = ()=> h(
    'div',
    {
        key: 'event',
        attrs: { class: 'better-scrollbar' },
        style: {
            overflow: 'auto',
            position: 'relative',
            flex: '1',
            padding: '20px',
        },
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
                    paddingBottom: '15px',
                },
            },
            'PAST EVENTS'
        ),
        state.eventStack.length === 0
            ? h('span', { style: { color: '#ccc' } }, 'The component has not emitted any events yet')
            : h(
            'div',
            {
                attrs: { class: 'better-scrollbar' },
                style: {
                    flex: '1 auto',
                    overflow: 'auto',
                },
            },
            state.eventStack
                .filter(eventData => state.definition.event[eventData.eventId] !== undefined)
                .reverse() // mutates the array, but it was already copied with filter
                .slice(0, 21)
                .map((eventData, index) => {
                    const event = state.definition.event[eventData.eventId]
                    const emitter = state.definition[event.emitter.ref][event.emitter.id]
                    // no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
                    return h(
                        'div',
                        {
                            key: event.emitter.id + index,
                            style: { marginBottom: '10px' },
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
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
                                                margin: '0 0 0 5px',
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
                                                flex: '5 5 auto',
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
                                                color: '#5bcc5b',
                                            },
                                        },
                                        event.type
                                    ),
                                ]
                            ),
                            Object.keys(eventData.mutations).filter(stateId => state.definition.state[stateId] !== undefined).length === 0
                                ? h(
                                'div',
                                {
                                    style: {
                                        padding: '5px 10px',
                                        color: '#bdbdbd',
                                    },
                                },
                                'nothing has changed'
                            )
                                : h(
                                'div',
                                {
                                    style: {
                                        paddingLeft: '10px',
                                        whiteSpace: 'nowrap',
                                    },
                                },
                                Object.keys(eventData.mutations).filter(stateId => state.definition.state[stateId] !== undefined).map(stateId =>
                                    h('div', [
                                        h(
                                            'span',
                                            {
                                                on: {
                                                    click: [STATE_NODE_SELECTED, stateId],
                                                },
                                                style: {
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                    boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#828282'),
                                                    background: '#1e1e1e',
                                                    padding: '2px 5px',
                                                    marginRight: '5px',
                                                    display: 'inline-block',
                                                    transition: 'all 0.2s',
                                                },
                                            },
                                            state.definition.state[stateId].title
                                        ),
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    color: '#8e8e8e',
                                                },
                                            },
                                            eventData.previousState[stateId].toString() + ' → '
                                        ),
                                        h('span', eventData.mutations[stateId].toString()),
                                    ])
                                )
                            ),
                        ]
                    )
                })
        ),
    ]
)

const rightTabsComponent = ()=> h(
    'div',
    {
        style: {
            height: '50px',
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            letterSpacing: '1px',
            fontKerning: 'none',
        },
    },
    [
        h(
            'div',
            {
                style: {
                    cursor: 'pointer',
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: state.selectedMenu === 'view' ? 'inherit' : '#303030',
                    color: state.selectedMenu === 'view' ? '#53d486' : '#d4d4d4',
                },
                on: { click: [CHANGE_MENU, 'view'] },
            },
            [h('span', 'VIEW')]
        ),
        h(
            'div',
            {
                style: {
                    cursor: 'pointer',
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: state.selectedMenu === 'state' ? 'inherit' : '#303030',
                    color: state.selectedMenu === 'state' ? '#53d486' : '#d4d4d4',
                },
                on: { click: [CHANGE_MENU, 'state'] },
            },
            [h('span', 'STATE')]
        ),
        h(
            'div',
            {
                style: {
                    cursor: 'pointer',
                    flex: '0 0 60px',
                    fontSize: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: state.selectedMenu === 'events' ? 'inherit' : '#303030',
                    color: state.selectedMenu === 'events' ? '#53d486' : '#d4d4d4',
                },
                on: { click: [CHANGE_MENU, 'events'] },
            },
            [historyIcon()]
        ),
    ]
)

export default ()=> h(
    'div',
    {
        style: {
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '50px',
            right: '0',
            color: 'white',
            height: 'calc(100% - 50px)',
            width: state.editorRightWidth + 'px',
            background: '#1e1e1e',
            boxSizing: 'border-box',
            boxShadow: 'inset 3px 0 0 #161616',
            transition: '0.5s transform',
            transform: state.rightOpen ? 'translateZ(0) translateX(0%)' : 'translateZ(0) translateX(100%)',
            userSelect: 'none',
        },
    },
    [dragComponentRight(), rightTabsComponent(), state.selectedMenu === 'view' ? viewComponent() : state.selectedMenu === 'state' ? stateComponent() : eventComponent()]
)