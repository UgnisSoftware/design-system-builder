import h from 'snabbdom/h'
import {state} from '../state'
import {boxIcon, arrowIcon, listIcon, ifIcon, inputIcon, imageIcon, textIcon, addCircleIcon} from './icons'
import topBar from './top-bar'
import preview from './preview'
import left from './left'
import right from './right-bar/right'
import nodeEditor from './node-editor/node-editor'
import loading from './loading'

function fakeComponent(nodeRef, depth) {
    const nodeId = nodeRef.id
    const node = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId]
    return h(
        'div',
        {
            key: '_fake' + nodeId,
            style: {
                cursor: 'pointer',
                transition: 'padding-left 0.2s',
                height: '36px',
                fontSize: '18px',
                fontWeight: '400',
                paddingLeft: '0px',
                paddingRight: '8px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                color: state.selectedViewNode.id === nodeId ? '#53d486' : '#bdbdbd',
            },
        },
        [
            (nodeRef.ref === 'vNodeBox' || nodeRef.ref === 'vNodeList' || nodeRef.ref === 'vNodeIf') && node.children.length > 0 ? arrowIcon(true) : h('span', { key: '_fakeSpan' + nodeId }),
            nodeRef.ref === 'vNodeBox'
                ? boxIcon()
                : nodeRef.ref === 'vNodeList' ? listIcon() : nodeRef.ref === 'vNodeIf' ? ifIcon() : nodeRef.ref === 'vNodeInput' ? inputIcon() : nodeRef.ref === 'vNodeImage' ? imageIcon() : textIcon(),
            h(
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
        ]
    )
}


function fakeState(ref) {
    const title =
        ref.ref === 'state' || ref.ref === 'table' ?
            state.definitionList[state.currentDefinitionId][ref.ref][ref.id].title :
        ref.ref === 'eventData' ?
            ref.id :
            'What are you dragging?'
    return h(
        'span',
        {
            style: {
                flex: '0 0 auto',
                position: 'relative',
                transform: 'translateZ(0)',
                margin: '7px 7px 0 0',
                boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === ref.id ? '#eab65c' : '#828282'),
                background: '#1e1e1e',
                padding: '4px 7px',
            },
        },
        [h('span', { style: { color: 'white', display: 'inline-block' } }, title)]
    )
}

export default ()=> {
    // loading
    if(state.loading){
        return h('div', [loading(true)])
    }

    const selectedNode = state.selectedViewNode.ref && state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
    return h(
        'div',
        {
            style: {
                background: '#ffffff',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            },
        },
        [
            loading(false),
            topBar(),
            h(
                'div',
                {
                    style: {
                        display: 'flex',
                        flex: '1',
                        position: 'relative',
                    },
                },
                [preview(), left(), right(), selectedNode ? nodeEditor() : h('span')]
            ),
            state.draggedComponentView
                ? h(
                'div',
                {
                    style: {
                        pointerEvents: 'none',
                        position: 'fixed',
                        top: state.mousePosition.y + 'px',
                        left: state.mousePosition.x + 'px',
                        zIndex: '99999',
                        width: state.editorRightWidth + 'px',
                    },
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                overflow: 'auto',
                                position: 'relative',
                                flex: '1',
                            },
                        },
                        [fakeComponent(state.draggedComponentView, state.draggedComponentView.depth)]
                    ),
                ]
            )
                : h('span'),
            state.draggedComponentState.id
                ? h(
                'div',
                {
                    style: {
                        pointerEvents: 'none',
                        position: 'fixed',
                        top: state.mousePosition.y + 'px',
                        left: state.mousePosition.x + 'px',
                        zIndex: '99999',
                        width: state.editorRightWidth + 'px',
                    },
                },
                state.hoveredEvent || state.hoveredPipe
                    ? [
                    h(
                        'span',
                        {
                            style: {
                                color: '#5bcc5b',
                                position: 'absolute',
                                top: '0',
                                left: '-20px',
                            },
                        },
                        [addCircleIcon()]
                    ),
                    fakeState(state.draggedComponentState),
                ]
                    : [fakeState(state.draggedComponentState)]
            )
                : h('span'),
        ]
    )
}