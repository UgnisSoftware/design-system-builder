import h from 'snabbdom/h'
import {state} from '../../state'
import {
    STATE_NODE_SELECTED, VIEW_NODE_SELECTED,
} from '../../events'
import {
    listIcon, ifIcon, inputIcon, textIcon, boxIcon
} from '../icons'

export default ()=> h(
    'div',
    {
        key: 'event',
        attrs: { class: 'better-scrollbar' },
        style: {
            overflow: 'auto',
            position: 'relative',
            flex: '1',
            padding: '20px',
        },
    },
    [
        h(
            'div',
            {
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    color: '#8e8e8e',
                    paddingBottom: '15px',
                },
            },
            'PAST EVENTS'
        ),
        state.eventStack.length === 0
            ? h('span', { style: { color: '#ccc' } }, 'The component has not emitted any events yet')
            : h(
            'div',
            {
                attrs: { class: 'better-scrollbar' },
                style: {
                    flex: '1 auto',
                    overflow: 'auto',
                },
            },
            state.eventStack
                .filter(eventData => state.definitionList[state.currentDefinitionId].event[eventData.eventId] !== undefined)
                .reverse() // mutates the array, but it was already copied with filter
                .slice(0, 21)
                .map((eventData, index) => {
                    const event = state.definitionList[state.currentDefinitionId].event[eventData.eventId]
                    const emitter = state.definitionList[state.currentDefinitionId][event.emitter.ref][event.emitter.id]
                    // no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
                    return h(
                        'div',
                        {
                            key: event.emitter.id + index,
                            style: {
                                marginBottom: '6px',
                                paddingBottom: '10px',
                                borderBottom: '2px solid #555',
                            },
                        },
                        [
                            h(
                                'div',
                                {
                                    style: {
                                        display: 'flex',
                                        marginBottom: '10px',
                                        cursor: 'pointer',
                                        alignItems: 'center',
                                        background: '#1e1e1e',
                                        paddingTop: '3px',
                                        paddingBottom: '3px',
                                        color: state.selectedViewNode.id === event.emitter.id ? '#53d486' : 'white',
                                        transition: '0.2s all',
                                        minWidth: '100%',
                                    },
                                    on: {
                                        click: [VIEW_NODE_SELECTED, event.emitter],
                                    },
                                },
                                [
                                    h(
                                        'span',
                                        {
                                            style: {
                                                flex: '0 0 auto',
                                                margin: '0 0 0 5px',
                                                display: 'inline-flex',
                                            },
                                        },
                                        [
                                            event.emitter.ref === 'vNodeBox'
                                                ? boxIcon()
                                                : event.emitter.ref === 'vNodeList' ? listIcon() : event.emitter.ref === 'vNodeList' ? ifIcon() : event.emitter.ref === 'vNodeInput' ? inputIcon() : textIcon(),
                                        ]
                                    ),
                                    h(
                                        'span',
                                        {
                                            style: {
                                                flex: '5 5 auto',
                                                margin: '0 5px 0 0',
                                                minWidth: '0',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis',
                                            },
                                        },
                                        emitter.title
                                    ),
                                    h(
                                        'span',
                                        {
                                            style: {
                                                flex: '0 0 auto',
                                                marginLeft: 'auto',
                                                marginRight: '5px',
                                                color: '#5bcc5b',
                                            },
                                        },
                                        event.type
                                    ),
                                ]
                            ),
                            Object.keys(eventData.mutations).filter(stateId => state.definitionList[state.currentDefinitionId].state[stateId] !== undefined).length === 0
                                ? h(
                                'div',
                                {
                                    style: {
                                        padding: '5px 10px',
                                        color: '#bdbdbd',
                                    },
                                },
                                'nothing has changed'
                            )
                                : h(
                                'div',
                                {
                                    style: {
                                        paddingLeft: '10px',
                                        whiteSpace: 'nowrap',
                                    },
                                },
                                Object.keys(eventData.mutations).filter(stateId => state.definitionList[state.currentDefinitionId].state[stateId] !== undefined).map(stateId =>
                                    h('div', [
                                        h(
                                            'span',
                                            {
                                                on: {
                                                    click: [STATE_NODE_SELECTED, stateId],
                                                },
                                                style: {
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                    boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#828282'),
                                                    background: '#1e1e1e',
                                                    padding: '2px 5px',
                                                    marginRight: '5px',
                                                    display: 'inline-block',
                                                    transition: 'all 0.2s',
                                                },
                                            },
                                            state.definitionList[state.currentDefinitionId].state[stateId].title
                                        ),
                                        h(
                                            'span',
                                            {
                                                style: {
                                                    color: '#8e8e8e',
                                                },
                                            },
                                            eventData.previousState[stateId].toString() + ' → '
                                        ),
                                        h('span', eventData.mutations[stateId].toString()),
                                    ])
                                )
                            ),
                        ]
                    )
                })
        ),
    ]
)
