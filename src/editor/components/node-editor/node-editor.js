import React from 'react'
import { state } from 'lape'
import { WIDTH_DRAGGED, COMPONENT_VIEW_DRAGGED, UNSELECT_VIEW_NODE } from '../../events'
import { ListIcon, IfIcon, InputIcon, TextIcon, BoxIcon, ClearIcon, ImageIcon, AppIcon } from '../icons'
import PropsMenu from './props-tab'
import StylesMenu from './style-tab'
import EventsMenu from './event-tab'
import Tabs from './tabs'
import DataMenu from './inherited-data'

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
    return (
        <div
            style={{
                position: 'fixed',
                color: 'white',
                left: state.componentEditorPosition.x + 'px',
                top: state.componentEditorPosition.y + 'px',
                height: '80%',
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

                <DataMenu />
            </div>
        </div>
    )
}
