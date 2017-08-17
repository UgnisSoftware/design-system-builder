import h from 'snabbdom/h'
import { state } from '../state'
import { COMPONENT_HOVERED, COMPONENT_UNHOVERED, SELECT_COMPONENT, ADD_NEW_COMPONENT } from '../events'

export default () =>
    h(
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
                            fontWeight: state.currentDefinitionId === name ? '400' : '300',
                            height: '30px',
                            background: state.currentDefinitionId === name ? '#dbdbdb' : state.hoveredComponent === name ? '#e8e8e8' : 'none',
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
                    state.currentDefinitionId === name ? state.definitionList[state.currentDefinitionId]['vNodeBox']['_rootNode'].title : state.definitionList[name]['vNodeBox']['_rootNode'].title
                )
            ),
            h('div', {
                style: {
                    position: 'absolute',
                    //transition: 'all 500ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                    top: 40 * Object.keys(state.definitionList).indexOf(state.currentDefinitionId) + 'px',
                    right: '0px',
                    width: '3px',
                    backgroundColor: '#53d486',
                    height: '40px',
                    display: 'inline-flex',
                },
            }),
            h(
                'div',
                {
                    style: {
                        fontSize: '16px',
                        height: '30px',
                        margin: '5px 10px',
                        padding: '7px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#fff',
                        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
                    },
                    on: { click: [ADD_NEW_COMPONENT] },
                },
                'create new'
            ),
        ]
    )
