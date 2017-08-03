import h from 'snabbdom/h'
import {state} from '../../state'
import {
    EVENT_HOVERED, EVENT_UNHOVERED, STATE_NODE_SELECTED, ADD_EVENT
} from '../../events'
import emberEditor from '../ember'

export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]

    let availableEvents = [
        {
            description: 'on click',
            propertyName: 'click',
        },
        {
            description: 'double clicked',
            propertyName: 'dblclick',
        },
        {
            description: 'mouse over',
            propertyName: 'mouseover',
        },
        {
            description: 'mouse out',
            propertyName: 'mouseout',
        },
    ]
    if (state.selectedViewNode.ref === 'vNodeInput') {
        availableEvents = availableEvents.concat([
            {
                description: 'input',
                propertyName: 'input',
            },
            {
                description: 'focus',
                propertyName: 'focus',
            },
            {
                description: 'blur',
                propertyName: 'blur',
            },
        ])
    }
    const currentEvents = availableEvents.filter(event => selectedNode[event.propertyName])
    const eventsLeft = availableEvents.filter(event => !selectedNode[event.propertyName])
    return h(
        'div',
        {
            attrs: {class: 'better-scrollbar'},
            style: {overflow: 'auto'},
        },
        [
            ...(currentEvents.length
                ? currentEvents.map(eventDesc => {
                const event = state.definitionList[state.currentDefinitionId][selectedNode[eventDesc.propertyName].ref][selectedNode[eventDesc.propertyName].id]
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
                            on: {
                                mousemove: [EVENT_HOVERED, selectedNode[eventDesc.propertyName]],
                                mouseout: [EVENT_UNHOVERED],
                            },
                        },
                        [
                            h('span', event.type),
                            h(
                                'span',
                                {
                                    style: {
                                        color: '#bdbdbd',
                                    },
                                },
                                '(drop state here)'
                            ),
                        ]
                    ),
                    eventDesc.description === 'input'
                        ? h(
                        'div',
                        {
                            style: {
                                padding: '10px 10px 0 10px',
                                color: '#bdbdbd',
                            },
                        },
                        'Hey, input is using event data, but we are currently working on this part. Some functionality might still be missing'
                    )
                        : h('span'),
                    event.mutators.length === 0
                        ? h(
                        'div',
                        {
                            style: {
                                margin: '10px 0',
                                padding: '5px 10px',
                                color: '#bdbdbd',
                            },
                        },
                        ['No transformations. Drag state on event']
                    )
                        : h(
                        'div',
                        {
                            style: {
                                color: 'white',
                                transition: 'color 0.2s',
                                cursor: 'pointer',
                            },
                        },
                        event.mutators.map(mutatorRef => {
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
                ])
            })
                : []),
            h(
                'div',
                {
                    style: {
                        marginTop: '10px',
                        padding: '5px 10px',
                        color: '#bdbdbd',
                    },
                },
                'add Event:'
            ),
            h('div', {style: {padding: '5px 0 5px 10px'}}, [
                ...eventsLeft.map(event =>
                    h(
                        'div',
                        {
                            style: {
                                border: '3px solid #5bcc5b',
                                cursor: 'pointer',
                                padding: '5px',
                                margin: '10px',
                            },
                            on: {
                                click: [ADD_EVENT, event.propertyName, state.selectedViewNode],
                            },
                        },
                        '+ ' + event.description
                    )
                ),
            ]),
        ]
    )
}