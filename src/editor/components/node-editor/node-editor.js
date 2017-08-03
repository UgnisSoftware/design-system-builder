import h from 'snabbdom/h'
import {state} from '../../state'
import {
    WIDTH_DRAGGED, COMPONENT_VIEW_DRAGGED, UNSELECT_VIEW_NODE, STATE_DRAGGED, HOVER_MOBILE
} from '../../events'
import {
    listIcon, ifIcon, inputIcon, textIcon, boxIcon, clearIcon, imageIcon, appIcon
} from '../icons'
import propsSubmenuComponent from './props-tab'
import styleSubmenuComponent from './style-tab'
import eventsSubmenuComponent from './event-tab'
import tabs from './tabs'

function checkInheritedStates(ref, acc = []){
    const node = state.definitionList[state.currentDefinitionId][ref.ref][ref.id]
    if(ref.id === '_rootNode' || node.parent.id === '_rootNode'){
        return acc
    }
    if(node.parent.ref === 'vNodeList'){
        const parent = state.definitionList[state.currentDefinitionId][node.parent.ref][node.parent.id]
        const tableRef = state.definitionList[state.currentDefinitionId][parent.value.ref][parent.value.id].value
        const table = state.definitionList[state.currentDefinitionId][tableRef.ref][tableRef.id]
        table.columns.forEach(columnRef => {
            acc.push({
                parent: node.parent,
                ...columnRef
            })
        })
    }

    return checkInheritedStates(node.parent, acc)
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

    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    const fullVNode = ['vNodeBox', 'vNodeText', 'vNodeImage', 'vNodeInput'].includes(state.selectedViewNode.ref)
    const inheritedStates = checkInheritedStates(state.selectedViewNode)
    return h(
        'div',
        {
            style: {
                position: 'fixed',
                color: 'white',
                left: state.componentEditorPosition.x + 'px',
                top: state.componentEditorPosition.y + 'px',
                height: '63%',
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
                        ? tabs()
                        : h('span'),
                    dragSubComponentRight,
                    dragSubComponentLeft,
                    state.selectedViewSubMenu === 'props' || !fullVNode ? propsSubmenuComponent()
                        : state.selectedViewSubMenu === 'style' ? styleSubmenuComponent()
                        : state.selectedViewSubMenu === 'events' ? eventsSubmenuComponent()
                        : h('span', 'Error, no such menu'),
                    h('div', {style: {padding: '20px', background: '#1e1e1e', marginTop: 'auto'}},  inheritedStates
                        .map((stateRef)=>
                            h('span', {}, [
                                h('div', {}, state.definitionList[state.currentDefinitionId][stateRef.parent.ref][stateRef.parent.id].title),
                                h(
                                    'span',
                                    {
                                        style: {
                                            flex: '0 0 auto',
                                            position: 'relative',
                                            transform: 'translateZ(0)',
                                            margin: '0 auto 0 0',
                                            boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateRef.id ? '#eab65c' : '#828282'),
                                            background: '#1e1e1e',
                                            padding: '4px 7px',
                                        },
                                    },
                                    [
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    opacity: state.editingTitleNodeId === stateRef.id ? '0' : '1',
                                                    color: 'white',
                                                    display: 'inline-block',
                                                },
                                                on: {
                                                    mousedown: [STATE_DRAGGED, stateRef],
                                                    touchstart: [STATE_DRAGGED, stateRef],
                                                    touchmove: [HOVER_MOBILE],
                                                },
                                            },
                                            state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id].title
                                        ),
                                    ]
                                )
                            ]
                            )
                        )),
                ]
            ),
        ]
    )
}