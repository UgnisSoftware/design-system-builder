import h from 'snabbdom/h'
import {state} from '../../state'
import {
    WIDTH_DRAGGED
} from '../../events'

import stateComponent from './state-tab'
import viewComponent from './view-tab'
import eventComponent from './event-tab'
import rightTabsComponent from './tabs'

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