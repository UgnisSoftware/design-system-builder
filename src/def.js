export default {
    // this is the view tree, it represents what will be shown on the screen, emits actions after user events (clicks)
    view: {
        type: 'box',
        style: {width: '550px', margin: 'auto', position: 'relative'},
        children: {
            type: 'nodeArray',
            value: [
                {
                    type: 'object',
                    value: {
                        type: 'text',
                        style: {color: 'rgba(175, 47, 47, 0.15)', margin: '10px 0 5px 0', fontSize: '100px', fontWeight: '100', textAlign: 'center', width: '100%', display: 'block'},
                        value: {
                            type: 'string',
                            value: 'todos',
                        },
                    }},
                {
                    type: 'object',
                    value: {
                        type: 'box',
                        style: {
                            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1)',
                            background: '#ffffff',
                            position: 'relative'
                        },
                        children: {
                            type: 'nodeArray',
                            value: [
                                {
                                    type: 'object',
                                    value: {
                                        type: 'input',
                                        placeholder: 'What needs to be done?',
                                        style: {
                                            border: 'none',
                                            width: '100%',
                                            padding: '16px 16px 16px 60px',
                                            background: 'rgba(0, 0, 0, 0.003)',
                                            boxShadow: 'inset 0 -2px 1px rgba(0,0,0,0.03)',
                                            boxSizing: 'border-box',
                                            fontSize: '24px',
                                            lineHeight: '1.4em',
                                            fontWeight: '300',
                                            outline: 'none'
                                        },
                                        value: {
                                            type: 'state',
                                            value: 'input',
                                        },
                                        onInput: 'UPDATE_INPUT',
                                    },
                                },
                                {
                                    type: 'conditional',
                                    statement: {
                                        type: 'boolean',
                                        value: true,
                                    },
                                    then: {
                                        type: 'object',
                                        value: {
                                            type: 'text',
                                            style: {
                                                fontSize: '24px',
                                                color: '#e6e6e6',
                                                padding: '27px 16px',
                                                writingMode: 'vertical-lr',
                                                cursor: 'default',
                                                textAlign: 'center',
                                                WebkitUserSelect: 'none',
                                                userSelect: 'none',
                                                position: 'absolute',
                                                top: '0',
                                                left: '0'
                                            },
                                            value: {
                                                type: 'string',
                                                value: '❯',
                                            },
                                            onInput: 'MARK_ALL',
                                        },
                                    },
                                    else: {
                                        type: 'noop',
                                    }
                                },
                                {
                                    type: 'object',
                                    value: {
                                        type: 'box',
                                        children: {
                                            type: 'list',
                                            data: {
                                                type: 'state',
                                                value: 'todos',
                                            },
                                            identifier: 'mapValueId1',
                                            node: {
                                                type: 'box',
                                                style: {borderTop: '1px solid #e6e6e6', lineHeight: '1.2', fontSize: '24px'},
                                                children: {
                                                    type: 'nodeArray',
                                                    value: [
                                                        {
                                                            type: 'object',
                                                            value: {
                                                                type: 'text',
                                                                style: {padding: '15px', display: 'block'},
                                                                value: {
                                                                    type: 'objectValue',
                                                                    object: {
                                                                        type: 'mapValue',
                                                                        value: 'mapValueId1'
                                                                    },
                                                                    value: {
                                                                        type: 'string',
                                                                        value: 'text'
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
                {
                    type: 'object',
                    value: {
                        type: 'text',
                        style: {
                            height: '50px',
                            width: '100%',
                            position: 'absolute',
                            bottom: '0',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 0 -3px #f6f6f6, 0 9px 1px -3px rgba(0, 0, 0, 0.2), 0 16px 0 -6px #f6f6f6, 0 17px 2px -6px rgba(0, 0, 0, 0.2)'
                        },
                        value: {
                            type: 'string',
                            value: '',
                        },
                    },
                }
            ],
        },
    },
    // Views can depend on state, state definition has initial state and action/mutator pairs. To change itself state listens to actions and applies mutators
    state: {
        input: {
            type: 'string',
            defaultValue: '',
            mutators: {
                UPDATE_INPUT: 'UPDATE_INPUT',
                EMPTY_INPUT: 'EMPTY_INPUT',
            },
        },
        todos: {
            type: 'array',
            defaultValue: [
                {
                    text: 'do the laundry',
                    completed: false,
                    showDestroy: false,
                    editing: false,
                },
                {
                    text: 'wash the dishes',
                    completed: true,
                    showDestroy: false,
                    editing: false,
                },
                {
                    text: 'take the trash out',
                    completed: false,
                    showDestroy: false,
                    editing: false,
                },
            ],
        }
    },
    // define mutations that state can apply to itself after an action
    mutators: {
        UPDATE_INPUT: {
            type: 'eventValue',
        },
        EMPTY_INPUT: {
            type: 'string',
            value: '',
        },
    },
    // connects mutators with state, it is actually just a cache so I wouldn't have to search through state on every action
    actions: {
        MARK_ALL: 'TODO', // TODO
        UPDATE_INPUT: ['input'],
        EMPTY_INPUT: ['input'],
    },
}


/*
 
 {
 type: 'box',
 children: {
 type: 'conditional',
 statement: {
 type: 'equals',
 first: {
 type: 'state',
 value: 'Count', // TODO change to active count > 0
 },
 second: {
 type: 'number',
 value: 0,
 },
 },
 then: {
 type: 'array',
 value: [],
 },
 else: {
 type: 'array',
 value: [
 {
 type: 'text',
 value: {
 type: 'state',
 value: 'Count',
 
 },
 onClick: 'MARK_ALL',
 },
 ],
 },
 
 },
 },
 */