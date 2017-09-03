import React from 'react'
import {
    HOVER_MOBILE,
    EDIT_VIEW_NODE_TITLE,
    VIEW_NODE_SELECTED,
    VIEW_UNHOVERED,
    VIEW_HOVERED,
    VIEW_DRAGGED,
    CHANGE_VIEW_NODE_TITLE,
} from '../../../../events'
import { UgnisIcon, ListIcon, IfIcon, BoxIcon, ArrowIcon, ClearIcon, InputIcon, TextIcon, ImageIcon } from '../../../icons'
import { state } from 'lape'

function prevent_bubbling(e) {
    e.stopPropagation()
}

function EditingNode({ nodeRef }) {
    return (
        <input
            style={{
                border: 'none',
                background: 'none',
                color: '#53d486',
                outline: 'none',
                flex: '1',
                padding: '0',
                boxShadow: 'inset 0 -1px 0 0 #53d486',
                font: 'inherit',
                marginLeft: '5px',
            }}
            onMouseDown={prevent_bubbling}
            onInput={e => CHANGE_VIEW_NODE_TITLE(nodeRef, e)}
            value={state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id].title}
            autofocus={true}
            data-istitleeditor={true}
        />
    )
}

function SpacerComponent() {
    return (
        <div
            key="spacer"
            style={{
                cursor: 'pointer',
                height: '6px',
                boxShadow: 'inset 0 0 1px 1px #53d486',
            }}
        />
    )
}

export default function Component({ nodeRef, parentRef, depth }) {
    const nodeId = nodeRef.id
    const node = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId]

    const isBox = nodeRef.ref === 'vNodeBox' || nodeRef.ref === 'vNodeList' || nodeRef.ref === 'vNodeIf'

    return (
        <div
            style={{
                opacity: state.draggedComponentView && state.draggedComponentView.id === nodeId ? '0.5' : '1.0',
            }}
        >
            <div
                style={{
                    padding: '3px 0',
                    borderBottom: '3px solid #292929',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    marginLeft: depth * 20 + 'px',
                }}
                onMouseDown={e => VIEW_DRAGGED(nodeRef, parentRef, depth, e)}
                onTouchStart={e => VIEW_DRAGGED(nodeRef, parentRef, depth, e)}
                onMouseMove={e => VIEW_HOVERED(nodeRef, parentRef, depth, e)}
                onMouseOut={e => VIEW_UNHOVERED(e)}
                onTouchMove={HOVER_MOBILE}
            >
                <div
                    style={{
                        padding: '0 3px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                        background: state.selectedViewNode.id === nodeId || state.hoveredViewWithoutDrag === nodeId ? '#303030' : 'none',
                    }}
                    onClick={() => VIEW_NODE_SELECTED(nodeRef)}
                >
                    {nodeId !== '_rootNode' &&
                    isBox &&
                    (node.children.length > 0 || (state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId)) ? (
                        <span
                            style={{
                                display: 'inline-flex',
                                color: state.selectedViewNode.id === nodeId ? '#fff' : '#8e8e8e',
                            }}
                        >
                            <ArrowIcon
                                rotate={
                                    state.viewFoldersClosed[nodeId] ||
                                    (state.draggedComponentView && nodeId === state.draggedComponentView.id)
                                }
                            />
                        </span>
                    ) : (
                        ''
                    )}
                    <span
                        key={nodeId}
                        style={{
                            color: state.selectedViewNode.id === nodeId ? '#fff' : '#8e8e8e',
                            transition: 'color 0.2s',
                            display: 'inline-flex',
                        }}
                    >
                        {nodeRef.id === '_rootNode' ? (
                            <UgnisIcon />
                        ) : nodeRef.ref === 'vNodeBox' ? (
                            <BoxIcon />
                        ) : nodeRef.ref === 'vNodeList' ? (
                            <ListIcon />
                        ) : nodeRef.ref === 'vNodeIf' ? (
                            <IfIcon />
                        ) : nodeRef.ref === 'vNodeInput' ? (
                            <InputIcon />
                        ) : nodeRef.ref === 'vNodeImage' ? (
                            <ImageIcon />
                        ) : (
                            <TextIcon />
                        )}
                    </span>
                    {state.editingTitleNodeId === nodeId ? (
                        <EditingNode nodeRef={nodeRef} />
                    ) : (
                        <span
                            style={{
                                flex: '1',
                                cursor: 'pointer',
                                color: state.selectedViewNode.id === nodeId ? '#53d486' : 'white',
                                transition: 'color 0.2s',
                                paddingLeft: '5px',
                                textOverflow: 'ellipsis',
                            }}
                            onDoubleClick={() => EDIT_VIEW_NODE_TITLE(nodeId)}
                        >
                            {node.title}
                        </span>
                    )}
                    <div
                        style={{
                            color: '#53d486',
                            display: state.selectedViewNode.id === nodeId ? 'inline-flex' : 'none',
                            flex: '0 0 auto',
                        }}
                    >
                        <ClearIcon />
                    </div>
                </div>
            </div>
            {isBox &&
            !(
                state.viewFoldersClosed[nodeId] ||
                (state.draggedComponentView && state.draggedComponentView.id === nodeId)
            ) ? state.hoveredViewNode &&
            state.hoveredViewNode.parent.id === nodeId &&
            !(node.children.findIndex(ref => ref.id === state.draggedComponentView.id) === state.hoveredViewNode.position) ? (
                (() => {
                    const oldPosition = node.children.findIndex(ref => ref.id === state.draggedComponentView.id)
                    const newPosition =
                        oldPosition === -1 || state.hoveredViewNode.position < oldPosition
                            ? state.hoveredViewNode.position
                            : state.hoveredViewNode.position + 1
                    const children = node.children.map(ref => (
                        <Component key={ref.id} nodeRef={ref} parentRef={nodeRef} depth={depth + 1} />
                    ))
                    return children.slice(0, newPosition).concat(<SpacerComponent />, children.slice(newPosition))
                })()
            ) : (
                node.children.map(ref => <Component key={ref.id} nodeRef={ref} parentRef={nodeRef} depth={depth + 1} />)
            ) : (
                ''
            )}
        </div>
    )
}
