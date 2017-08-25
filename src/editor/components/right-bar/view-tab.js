import h from 'snabbdom/h'
import { state } from 'lape'
import { HOVER_MOBILE, EDIT_VIEW_NODE_TITLE, VIEW_NODE_SELECTED, CHANGE_VIEW_NODE_TITLE, VIEW_UNHOVERED, VIEW_HOVERED, ADD_NODE, VIEW_DRAGGED } from '../../events'
import { listIcon, ifIcon, inputIcon, textIcon, boxIcon, dotIcon, arrowIcon, clearIcon, imageIcon, repeatIcon, linkIcon } from '../icons'

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
            value: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id].title,
        },
        attrs: {
            autofocus: true,
            'data-istitleeditor': true,
        },
    })
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

function listRootNode(nodeRef) {
    const nodeId = nodeRef.id
    const node = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId]
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
    const node = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId]
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
    const node = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId]
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

const addViewNodeComponent = () =>
    h(
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
                'button',
                {
                    attrs: {
                        type: 'button',
                        title: 'Box',
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                    },
                    on: {
                        click: [ADD_NODE, state.selectedViewNode, 'box'],
                    },
                },
                [boxIcon()]
            ),
            h(
                'button',
                {
                    attrs: {
                        type: 'button',
                        title: 'Text',
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                    },
                    on: {
                        click: [ADD_NODE, state.selectedViewNode, 'text'],
                    },
                },
                [textIcon()]
            ),
            h(
                'button',
                {
                    attrs: {
                        type: 'button',
                        title: 'Image',
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                    },
                    on: {
                        click: [ADD_NODE, state.selectedViewNode, 'image'],
                    },
                },
                [imageIcon()]
            ),
            h(
                'button',
                {
                    attrs: {
                        type: 'button',
                        title: 'Text Input',
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                    },
                    on: {
                        click: [ADD_NODE, state.selectedViewNode, 'input'],
                    },
                },
                [inputIcon()]
            ),
            h(
                'button',
                {
                    attrs: {
                        type: 'button',
                        title: 'If',
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                    },
                    on: {
                        click: [ADD_NODE, state.selectedViewNode, 'if'],
                    },
                },
                [ifIcon()]
            ),
            h(
                'button',
                {
                    attrs: {
                        type: 'button',
                        title: 'List',
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                    },
                    on: {
                        click: [ADD_NODE, state.selectedViewNode, 'list'],
                    },
                },
                [listIcon()]
            ),
        ]
    )

export default () =>
    h(
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
            addViewNodeComponent(),
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
