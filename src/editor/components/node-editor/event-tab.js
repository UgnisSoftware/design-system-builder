import h from 'snabbdom/h'
import {state} from '../../state'
import {
    EVENT_HOVERED, EVENT_UNHOVERED, STATE_NODE_SELECTED
} from '../../events'
import {
    arrowIcon
} from '../icons'
import emberEditor from './ember/ember'
import fakeState from './fake-state'

export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    const pointerEvents = [
        {
            title: 'Click',
            type: 'click',
        },
        {
            title: 'Double Click',
            type: 'dblclick',
        },
        {
            title: 'Over',
            type: 'mouseover',
        },
        {
            title: 'Out',
            type: 'mouseout',
        },
        {
            title: 'Move',
            type: 'mousemove',
        },
        {
            title: 'Down',
            type: 'mousedown',
        },
        {
            title: 'Up',
            type: 'mouseup',
        },
    ]
    const inputEvents = [
        {
            title: 'Input',
            type: 'input',
        },
        {
            title: 'Key Down',
            type: 'keydown',
        },
        {
            title: 'Key Up',
            type: 'keyup',
        },
        {
            title: 'Focus',
            type: 'focus',
        },
        {
            title: 'Blur',
            type: 'blur',
        },
    ]

    return h('div', {
        style: {
            display: 'inline-flex',
            flexDirection: 'column'
        }
    },
        [
            h(
                'div',
                {
                    attrs: {class: 'better-scrollbar'},
                    style: {overflow: 'auto'},
                },
                [

                    h(
                        'div',
                        {
                            style: {
                                padding: '15px 15px 5px',
                                borderBottom: '2px solid #888',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                            },
                            on: {
                                //click: [SELECT_VIEW_SUBMENU, 'events']
                            },
                        },
                        [arrowIcon(), 'Mouse events']
                    ),
                    ...pointerEvents.concat(state.selectedViewNode.ref === 'vNodeInput' ? inputEvents : []).map(eventDesc => {

                        const eventRef = selectedNode.events.find(eventRef => state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].type === eventDesc.type)
                        return h('div', [
                            h(
                                'div',
                                {
                                    style: {
                                        background: '#676767',
                                        padding: '5px 20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    },
                                },
                                [
                                    h('span', eventDesc.title),
                                ]
                            ),
                            !eventRef || state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].mutators.length === 0
                                ? h('div')
                                : h(
                                'div',
                                {
                                    style: {
                                        color: 'white',
                                        transition: 'color 0.2s',
                                        cursor: 'pointer',
                                    },
                                },
                                state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].mutators.map(mutatorRef => {
                                    const mutator = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]
                                    const stateDef = state.definitionList[state.currentDefinitionId][mutator.state.ref][mutator.state.id]
                                    return h(
                                        'div',
                                        {
                                            style: {
                                                padding: '15px 20px',
                                                borderBottom: '2px solid #929292',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                        },
                                        [
                                            h(
                                                'span',
                                                {
                                                    style: {
                                                        flex: '0 0 auto',
                                                        display: 'inline-block',
                                                        position: 'relative',
                                                        transform: 'translateZ(0)',
                                                        boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === mutator.state.id ? '#eab65c' : '#828282'),
                                                        background: '#1e1e1e',
                                                        padding: '4px 7px',
                                                    },
                                                },
                                                [
                                                    h(
                                                        'span',
                                                        {
                                                            style: {
                                                                color: 'white',
                                                                display: 'inline-block',
                                                            },
                                                            on: {
                                                                click: [STATE_NODE_SELECTED, mutator.state.id],
                                                            },
                                                        },
                                                        stateDef.title
                                                    ),
                                                ]
                                            ),
                                            h(
                                                'span',
                                                {
                                                    style: {
                                                        color: 'white',
                                                        fontSize: '1.8em',
                                                        padding: '10px',
                                                    },
                                                },
                                                '='
                                            ),
                                            emberEditor(mutator.mutation, stateDef.type),
                                        ]
                                    )
                                })
                            ),
                            h(
                                'div',
                                {
                                    style: {
                                        padding: '20px 20px',
                                        display: 'flex',
                                        color: '#bdbdbd',
                                        justifyContent: 'center',
                                        border: '3px dashed #bdbdbd',
                                        borderRadius: '10px',
                                        margin: '20px',
                                        userSelect: 'none',
                                        cursor: 'default'
                                    },
                                    on: {
                                        mousemove: state.draggedComponentState && (state.draggedComponentState.ref === 'state' || state.draggedComponentState.ref === 'table') ? [EVENT_HOVERED, {type: eventDesc.type} ]: undefined,
                                        mouseout: [EVENT_UNHOVERED],
                                    },
                                },
                                'drop state here'
                            ),
                        ])
                    }),
                ]
            ),
            h('div',{
                style: {
                    background: '#1e1e1e',
                    flex: '0 0 100%',
                    padding: '10px 20px',
                    display: 'flex',
                    flexWrap: 'nowrap',
                    justifyContent: 'stace-between'
                }
            }, [
                fakeState('Mouse X position from left', {ref: 'eventData', id: 'screenX'}),
                fakeState('Mouse Y position from top', {ref: 'eventData', id: 'screenY'}),
                fakeState('Mouse X position from layer left', {ref: 'eventData', id: 'layerX'}),
                fakeState('Mouse Y position from layer top', {ref: 'eventData', id: 'layerY'}),
            ]),
            state.selectedViewNode.ref === 'vNodeInput' ? h('div',{
                style: {
                    background: '#1e1e1e',
                    flex: '0 0 100%',
                    padding: '10px 20px',
                    display: 'flex',
                    flexWrap: 'nowrap',
                    justifyContent: 'stace-between'
                }
            }, [
                fakeState('current value', {ref: 'eventData', id: 'value'}),
                fakeState('key pressed', {ref: 'eventData', id: 'keyPressed'}),
                fakeState('key pressed code', {ref: 'eventData', id: 'keyPressedCode'}),
            ]) : h('div'),
        ]
    )
}