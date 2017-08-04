import h from 'snabbdom/h'
import {state} from '../../state'
import {
    EVENT_HOVERED, EVENT_UNHOVERED, STATE_NODE_SELECTED
} from '../../events'
import {
    arrowIcon
} from '../icons'
import emberEditor from '../ember'

export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    const pointerEvents = [
        {
            title: 'on click',
            type: 'click',
        },
        {
            title: 'double clicked',
            type: 'dblclick',
        },
        {
            title: 'mouse over',
            type: 'mouseover',
        },
        {
            title: 'mouse out',
            type: 'mouseout',
        },
        {
            title: 'mouse move',
            type: 'mousemove',
        },
        {
            title: 'mouse down',
            type: 'mousedown',
        },
        {
            title: 'mouse up',
            type: 'mouseup',
        },
    ]
    const inputEvents = [
        {
            title: 'input',
            type: 'input',
        },
        {
            title: 'key down',
            type: 'keydown',
        },
        {
            title: 'key up',
            type: 'keyup',
        },
        {
            title: 'focus',
            type: 'focus',
        },
        {
            title: 'blur',
            type: 'blur',
        },
    ]

    return h(
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
                [arrowIcon(), 'Pointer events']
            ),
            ...pointerEvents.map(eventDesc => {

                const eventRef = selectedNode.events.find(eventRef => state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].type === eventDesc.type)
                return h('div', [
                    h(
                        'div',
                        {
                            style: {
                                background: '#676767',
                                padding: '5px 10px',
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
                                        padding: '15px 10px',
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
                                mousemove: [EVENT_HOVERED, {type: eventDesc.type} ],
                                mouseout: [EVENT_UNHOVERED],
                            },
                        },
                        'drop state here'
                    ),
                ])
            }),
        ]
    )
}