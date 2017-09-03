import React from 'react'
import { state } from 'lape'
import { WIDTH_DRAGGED, COMPONENT_VIEW_DRAGGED, UNSELECT_VIEW_NODE, STATE_DRAGGED, HOVER_MOBILE } from '../../events'
import { ListIcon, IfIcon, InputIcon, TextIcon, BoxIcon, ClearIcon, ImageIcon, AppIcon } from '../icons'
import PropsMenu from './props-tab'
import StylesMenu from './style-tab'
import EventsMenu from './event-tab'
import Tabs from './tabs'

function checkInheritedStates(ref, acc = []) {
    const node = state.definitionList[state.currentDefinitionId][ref.ref][ref.id]
    if (ref.id === '_rootNode' || node.parent.id === '_rootNode') {
        return acc
    }
    if (node.parent.ref === 'vNodeList') {
        const parent = state.definitionList[state.currentDefinitionId][node.parent.ref][node.parent.id]
        const tableRef = state.definitionList[state.currentDefinitionId][parent.value.ref][parent.value.id].value
        const table = state.definitionList[state.currentDefinitionId][tableRef.ref][tableRef.id]
        table.columns.forEach(columnRef => {
            acc.push({
                parent: node.parent,
                ...columnRef,
            })
        })
    }

    return checkInheritedStates(node.parent, acc)
}

const DragSubComponentLeft = () => (
    <div
        onMouseDown={e => WIDTH_DRAGGED('subEditorWidthLeft', e)}
        onTouchStart={e => WIDTH_DRAGGED('subEditorWidthLeft', e)}
        style={{
            position: 'absolute',
            left: '2px',
            transform: 'translateX(-100%)',
            top: '0',
            width: '10px',
            height: '100%',
            textAlign: 'center',
            opacity: 0,
            cursor: 'col-resize',
        }}
    />
)

const DragSubComponentRight = () => (
    <div
        onMouseDown={e => WIDTH_DRAGGED('subEditorWidth', e)}
        onTouchStart={e => WIDTH_DRAGGED('subEditorWidth', e)}
        style={{
            position: 'absolute',
            right: '2px',
            transform: 'translateX(100%)',
            top: '0',
            width: '10px',
            height: '100%',
            textAlign: 'center',
            opacity: 0,
            cursor: 'col-resize',
        }}
    />
)

export default function generateEditNodeComponent() {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    const fullVNode = ['vNodeBox', 'vNodeText', 'vNodeImage', 'vNodeInput'].includes(state.selectedViewNode.ref)
    const inheritedStates = checkInheritedStates(state.selectedViewNode)
    return (
        <div
            style={{
                position: 'fixed',
                color: 'white',
                left: state.componentEditorPosition.x + 'px',
                top: state.componentEditorPosition.y + 'px',
                height: '63%',
                display: 'flex',
                zIndex: '3000',
            }}
        >
            <div
                style={{
                    flex: '1',
                    display: 'flex',
                    marginBottom: '10px',
                    flexDirection: 'column',
                    background: '#393939',
                    width: state.subEditorWidth + 'px',
                }}
            >
                    <div style={{ flex: '0 0 auto' }}>
                    <div
                        style={{
                            display: 'flex',
                            cursor: 'default',
                            alignItems: 'center',
                            background: '#1e1e1e',
                            paddingTop: '2px',
                            paddingBottom: '5px',
                            color: '#53d486',
                            fontSize: '18px',
                            padding: '13px 10px',
                        }}
                        onMouseDown={COMPONENT_VIEW_DRAGGED}
                        onTouchStart={COMPONENT_VIEW_DRAGGED}
                    >
                        <span
                            style={{
                                flex: '0 0 auto',
                                margin: '0 2px 0 5px',
                                display: 'inline-flex',
                            }}
                        >
                            {state.selectedViewNode.id === '_rootNode' ? (
                                <AppIcon />
                            ) : state.selectedViewNode.ref === 'vNodeBox' ? (
                                <BoxIcon />
                            ) : state.selectedViewNode.ref === 'vNodeList' ? (
                                <ListIcon />
                            ) : state.selectedViewNode.ref === 'vNodeList' ? (
                                <IfIcon />
                            ) : state.selectedViewNode.ref === 'vNodeInput' ? (
                                <InputIcon />
                            ) : state.selectedViewNode.ref === 'vNodeImage' ? (
                                <ImageIcon />
                            ) : (
                                <TextIcon />
                            )}
                        </span>
                        <span
                            style={{
                                flex: '5 5 auto',
                                margin: '0 5px 0 0',
                                minWidth: '0',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {selectedNode.title}
                        </span>
                        <span
                            style={{
                                flex: '0 0 auto',
                                marginLeft: 'auto',
                                cursor: 'pointer',
                                marginRight: '5px',
                                color: 'white',
                                display: 'inline-flex',
                                fontSize: '24px',
                            }}
                            onMouseDown={e => UNSELECT_VIEW_NODE(false, true, e)}
                            onTouchStart={e => UNSELECT_VIEW_NODE(false, true, e)}
                        >
                            <ClearIcon />
                        </span>
                    </div>
                    </div>
                    {fullVNode ? <Tabs /> : ''}
                    <DragSubComponentRight />
                    <DragSubComponentLeft />
                    {state.selectedViewSubMenu === 'props' || !fullVNode ? (
                        <PropsMenu />
                    ) : state.selectedViewSubMenu === 'style' ? (
                        <StylesMenu />
                    ) : state.selectedViewSubMenu === 'events' ? (
                        <EventsMenu />
                    ) : (
                        <span />
                    )}
                    {inheritedStates.length ? (
                        <div style={{ padding: '20px', background: '#1e1e1e', marginTop: 'auto' }}>
                            {inheritedStates.map(stateRef => (
                                <span>
                                    <div>
                                        {state.definitionList[state.currentDefinitionId][stateRef.parent.ref][stateRef.parent.id].title}
                                    </div>
                                    <span
                                        style={{
                                            flex: '0 0 auto',
                                            position: 'relative',
                                            transform: 'translateZ(0)',
                                            margin: '0 auto 0 0',
                                            boxShadow:
                                                'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateRef.id ? '#eab65c' : '#828282'),
                                            background: '#1e1e1e',
                                            padding: '4px 7px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                opacity: state.editingTitleNodeId === stateRef.id ? '0' : '1',
                                                color: 'white',
                                                display: 'inline-block',
                                            }}
                                            onMouseDown={e => STATE_DRAGGED(stateRef, e)}
                                            onTouchStart={e => STATE_DRAGGED(stateRef, e)}
                                            onTouchMove={HOVER_MOBILE}
                                        >
                                            {state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id].title}
                                        </span>
                                    </span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        ''
                    )}
                </div>
        </div>
    )
}
