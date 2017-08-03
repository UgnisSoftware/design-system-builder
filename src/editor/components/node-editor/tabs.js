import h from 'snabbdom/h'
import {state} from '../../state'
import {
    SELECT_VIEW_SUBMENU
} from '../../events'

export default ()=> {
    const propsComponent = h(
        'div',
        {
            style: {
                background: '#1e1e1e',
                padding: '10px 0',
                flex: '1',
                cursor: 'pointer',
                letterSpacing: '1px',
                textAlign: 'center',
                color: state.selectedViewSubMenu === 'props' ? 'white' : '#acacac',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'props'],
            },
        },
        'Data'
    )
    const styleComponent = h(
        'div',
        {
            style: {
                background: '#1e1e1e',
                padding: '10px 0',
                flex: '1',
                borderRight: '1px solid #222',
                borderLeft: '1px solid #222',
                textAlign: 'center',
                letterSpacing: '1px',
                cursor: 'pointer',
                color: state.selectedViewSubMenu === 'style' ? 'white' : '#acacac',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'style'],
            },
        },
        'Style'
    )
    const eventsComponent = h(
        'div',
        {
            style: {
                background: '#1e1e1e',
                padding: '10px 0',
                flex: '1',
                textAlign: 'center',
                letterSpacing: '1px',
                cursor: 'pointer',
                color: state.selectedViewSubMenu === 'events' ? 'white' : '#acacac',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'events'],
            },
        },
        'Events'
    )

    const tagComponent = h('div', {
        style: {
            position: 'absolute',
            bottom: '0',
            transition: 'all 500ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
            left: state.selectedViewSubMenu === 'props' ? '0' : state.selectedViewSubMenu === 'style' ? '33.334%' : '66.667%',
            background: '#53d486',
            height: '3px',
            width: '33.33%',
        },
    })


    return h(
        'div',
        {
            style: {
                display: 'flex',
                flex: '0 0 auto',
                position: 'relative',
            },
        },
        [propsComponent, styleComponent, eventsComponent, tagComponent]
    )
}