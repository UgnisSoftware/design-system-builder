import h from 'snabbdom/h'
import {state} from '../state'
import {COMPONENT_HOVERED, COMPONENT_UNHOVERED, SELECT_COMPONENT, ADD_NEW_COMPONENT} from '../events'

// const componentMockList = ['App bar', 'Avatar', 'Breadcrumbs', 'Button - flat', 'Button - raised', 'Button - round', 'Card', 'Dialog', 'Drawer', 'Input - auto complete', 'Input - text', 'Input - multiline', 'Input - number',
//     'Input - checkbox', 'Input - radio', 'Input - toggle', 'Input - slider', 'Input - datepicker', 'List', 'Menu', 'Progress - linear', 'Progress - circular', 'Snackbar', 'Table', 'Tabs', 'Time picker']

export default ()=> h(
    'div',
    {
        style: {
            position: 'fixed',
            top: '50px',
            left: '0',
            overflow: 'auto',
            height: 'calc(100% - 50px)',
            width: state.editorLeftWidth + 'px',
            background: '#f8f8f8',
            boxSizing: 'border-box',
            transition: '0.5s transform',
            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.12)',
            transform: state.leftOpen ? 'translateZ(0) translateX(0%)' : 'translateZ(0) translateX(-100%)',
            userSelect: 'none',
        },
        attrs: { class: 'better-scrollbar-light' },
    },
    [
        //dragComponentLeft,
        ...Object.keys(state.definitionList).map(name =>
            h(
                'div',
                {
                    key: name,
                    style: {
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: '300',
                        height: '30px',
                        background: state.currentDefinitionId === name ? '#ccc' : state.hoveredComponent === name ? '#e5e5e5' : 'none',
                        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                        paddingLeft: '20px',
                        paddingTop: '5px',
                        paddingBottom: '5px',
                        cursor: 'pointer',
                    },
                    on: {
                        mouseover: [COMPONENT_HOVERED, name],
                        mouseout: [COMPONENT_UNHOVERED],
                        click: [SELECT_COMPONENT, name],
                    },
                },
                state.definitionList[name]['vNodeBox']['_rootNode'].title
            )
        ),
        h(
            'div',
            {
                style: {
                    fontSize: '16px',
                    height: '30px',
                    paddingLeft: '20px',
                    paddingTop: '10px',
                    cursor: 'pointer',
                },
                on: { click: [ADD_NEW_COMPONENT] },
            },
            '+ create new'
        ),
    ]
)