import * as React from 'react'
import { state } from 'lape'
import { UNSELECT_VIEW_NODE } from '../../../../events'
import { ListIcon, IfIcon, InputIcon, TextIcon, BoxIcon, ClearIcon, ImageIcon, AppIcon } from '../../../icons'
import PropsMenu from './props-tab'
import StylesMenu from './style-tab'
import EventsMenu from './event-tab'
import Tabs from './tabs'
export default function generateEditNodeComponent() {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
    const fullVNode = ['vNodeBox', 'vNodeText', 'vNodeImage', 'vNodeInput'].includes(state.selectedViewNode.ref)
    return (
        <div
            style={{
                color: 'white',
                height: '50%',
                display: 'flex',
                zIndex: 3000,
            }}
        >
            <div
                style={{
                    flex: '1',
                    display: 'flex',
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
                {state.selectedViewSubMenu === 'props' || !fullVNode ? (
                    <PropsMenu />
                ) : state.selectedViewSubMenu === 'style' ? (
                    <StylesMenu />
                ) : state.selectedViewSubMenu === 'events' ? (
                    <EventsMenu />
                ) : (
                    <span />
                )}
            </div>
        </div>
    )
}
