import React from 'react'
import { state } from 'lape'
import { WIDTH_DRAGGED } from '../../events'

import StateComponent from './state/state-tab'
import ViewComponent from './view/view-tab'
import EventComponent from './events/event-tab'
import RightTabsComponent from './tabs'

const DragComponentRight = () => (
    <div
        onMouseDown={e => WIDTH_DRAGGED('editorRightWidth', e)}
        onTouchStart={e => WIDTH_DRAGGED('editorRightWidth', e)}
        style={{
            position: 'absolute',
            left: '0',
            transform: 'translateX(-100%)',
            top: '0',
            width: '10px',
            height: '100%',
            textAlign: 'center',
            opacity: '0',
            cursor: 'col-resize',
        }}
    />
)

export default () => (
    <div
        style={{
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
        }}
    >
        <DragComponentRight />
        <RightTabsComponent />
        {state.selectedMenu === 'view' ? <ViewComponent /> : state.selectedMenu === 'state' ? <StateComponent /> : <EventComponent />}
    </div>
)
