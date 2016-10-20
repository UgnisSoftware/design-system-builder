// objects with _type will be resolved at runtime on every change
// types with vNode will be used to construct html
export default {
    // this is the view tree, it represents what will be shown on the screen, emits actions after user events (clicks)
    view: {
        _type: 'vNode',
        nodeType: 'box',
        style: {
            background: '#f5f5f5',
            color: '#4d4d4d',
            fontWeight: '300',
            fontSize: '14px',
            minHeight: '100vh',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        },
        children:[{
            _type: 'vNode',
            nodeType: 'box',
            style: {
                width: '550px',
                margin: '0 50px',
                position: 'relative',
            },
            children: [
                {
                    _type: 'vNode',
                    nodeType: 'text',
                    style: {
                        color: 'rgba(175, 47, 47, 0.15)',
                        margin: '10px 0 5px 0',
                        fontSize: '100px',
                        fontWeight: '100',
                        textAlign: 'center',
                        width: '100%',
                        display: 'block'
                    },
                    value: 'todos',
                },
                {
                    _type: 'vNode',
                    nodeType: 'box',
                    style: {
                        background: '#ffffff',
                        position: 'relative',
                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1)',
                    },
                    children: [
                        {
                            _type: 'vNode',
                            nodeType: 'box',
                            style: {
                                boxShadow: 'inset 0 -2px 1px rgba(0,0,0,0.03)',
                                boxSizing: 'border-box',
                                display: 'flex',
                            },
                            children: [
                                {
                                    _type: 'vNode',
                                    nodeType: 'text',
                                    style: {
                                        fontSize: '24px',
                                        color: '#e6e6e6',
                                        padding: '27px 11px',
                                        writingMode: 'vertical-lr',
                                        cursor: 'default',
                                        textAlign: 'center',
                                        WebkitUserSelect: 'none',
                                        userSelect: 'none',
                                        flex: '1',
                                        maxWidth: '38px',
                                    },
                                    value: '❯',
                                    onClick: {
                                        actionName: 'MARK_ALL_AS_COMPLETED',
                                    },
                                },
                                {
                                    _type: 'vNode',
                                    nodeType: 'input',
                                    placeholder: 'What needs to be done?',
                                    style: {
                                        border: 'none',
                                        flex: '1',
                                        padding: '16px 16px 16px 0',
                                        background: 'rgba(0, 0, 0, 0.003)',
                                        fontSize: '24px',
                                        lineHeight: '1.4em',
                                        fontWeight: '300',
                                        outline: 'none',
                                        color: 'inherit',
                                    },
                                    value: {
                                        _type: 'state',
                                        value: 'input',
                                    },
                                    onInput: {
                                        actionName: 'UPDATE_INPUT',
                                    },
                                    onEnter: {
                                        actionName: 'ADD_TODO',
                                    }
                                },
                            ],
                        },
                        {
                            _type: 'map',
                            data: {
                                _type: 'conditional',
                                statement: {
                                    _type: 'equals',
                                    first: {
                                        _type: 'state',
                                        value: 'flag',
                                    },
                                    second: {
                                        _type: 'string',
                                        value: 'ALL',
                                    },
                                },
                                then: {
                                    _type: 'state',
                                    value: 'todos',
                                },
                                else: {
                                    _type: 'filter',
                                    data: {
                                        _type: 'state',
                                        value: 'todos',
                                    },
                                    identifier: 'filterId0',
                                    filter: {
                                        _type: 'equals',
                                        first: {
                                            _type: 'objectValue',
                                            object: {
                                                _type: 'mapValue',
                                                value: 'filterId0'
                                            },
                                            value: {
                                                _type: 'string',
                                                value: 'completed'
                                            },
                                        },
                                        second: {
                                            _type: 'conditional',
                                            statement: {
                                                _type: 'equals',
                                                first: {
                                                    _type: 'state',
                                                    value: 'flag',
                                                },
                                                second: {
                                                    _type: 'string',
                                                    value: 'COMPLETED',
                                                },
                                            },
                                            then: {
                                                _type: 'boolean',
                                                value: true
                                            },
                                            else: {
                                                _type: 'boolean',
                                                value: false
                                            },
                                        },
                                    },
                                },
                            },
                            identifier: 'mapId1',
                            map: {
                                _type: 'vNode',
                                nodeType: 'box',
                                style: {
                                    borderTop: '1px solid #e6e6e6',
                                    lineHeight: '1.2',
                                    fontSize: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '58px'
                                },
                                children: [
                                    {
                                        _type: 'vNode',
                                        nodeType: 'box',
                                        style: {
                                            _type: 'conditional',
                                            statement: {
                                                _type: 'equals',
                                                first: {
                                                    _type: 'objectValue',
                                                    object: {
                                                        _type: 'mapValue',
                                                        value: 'mapId1'
                                                    },
                                                    value: {
                                                        _type: 'string',
                                                        value: 'completed'
                                                    },
                                                },
                                                second: {
                                                    _type: 'boolean',
                                                    value: false
                                                }
                                            },
                                            then: {
                                                height: '40px',
                                                width: '40px',
                                                display: 'inline-block',
                                                background: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#ededed" stroke-width="3"/></svg>\')'
                                            },
                                            else: {
                                                height: '40px',
                                                width: '40px',
                                                display: 'inline-block',
                                                background: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#bddad5" stroke-width="3"/><path fill="#5dc2af" d="M72 25L42 71 27 56l-4 4 20 20 34-52z"/></svg>\')'
                                            },
                                        },
                                        onClick: {
                                            actionName: 'CHANGE_ITEM_STATUS',
                                            data: {
                                                _type: 'object',
                                                value: {
                                                    itemId: {
                                                        _type: 'mapIndex',
                                                        value: 'mapId1',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    {
                                        _type: 'vNode',
                                        nodeType: 'text',
                                        style: {padding: '15px 0 15px 20px', display: 'inline-block'},
                                        value: {
                                            _type: 'objectValue',
                                            object: {
                                                _type: 'mapValue',
                                                value: 'mapId1'
                                            },
                                            value: {
                                                _type: 'string',
                                                value: 'text'
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            _type: 'vNode',
                            nodeType: 'box',
                            style: {
                                background: '#ffffff',
                                borderTop: '1px solid #e6e6e6',
                                color: '#777',
                                padding: '10px 15px',
                                height: '20px',
                                textAlign: 'center',
                                position: 'relative',
                                boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 0 -3px #f6f6f6, 0 9px 1px -3px rgba(0, 0, 0, 0.2), 0 16px 0 -6px #f6f6f6, 0 17px 2px -6px rgba(0, 0, 0, 0.2)'
                                
                            },
                            children: [
                                {
                                    _type: 'vNode',
                                    nodeType: 'text',
                                    style: {
                                        float: 'left',
                                    },
                                    value: {
                                        _type: 'sum',
                                        first: {
                                            _type: 'length',
                                            value: {
                                                _type: 'filter',
                                                data: {
                                                    _type: 'state',
                                                    value: 'todos'
                                                },
                                                identifier: 'filterId1',
                                                filter: {
                                                    _type: 'equals',
                                                    first: {
                                                        _type: 'objectValue',
                                                        object: {
                                                            _type: 'mapValue',
                                                            value: 'filterId1'
                                                        },
                                                        value: {
                                                            _type: 'string',
                                                            value: 'completed'
                                                        },
                                                    },
                                                    second: {
                                                        _type: 'boolean',
                                                        value: false
                                                    },
                                                },
                                            },
                                        },
                                        second: {
                                            _type: 'string',
                                            value: ' items left'
                                        }
                                    }
                                },
                                {
                                    _type: 'vNode',
                                    nodeType: 'box',
                                    style: {
                                        display: 'inline-block',
                                        margin: 'auto',
                                    },
                                    children: [
                                        {
                                            _type: 'vNode',
                                            nodeType: 'text',
                                            style: {
                                                margin: '3px',
                                                padding: '3px 7px',
                                                border: '1px solid transparent',
                                                borderRadius: '3px',
                                            },
                                            value: {
                                                _type: 'string',
                                                value: 'All'
                                            },
                                            onClick: {
                                                actionName: 'CHANGE_FLAG_ALL'
                                            },
                                        },
                                        {
                                            _type: 'vNode',
                                            nodeType: 'text',
                                            style: {
                                                margin: '3px',
                                                padding: '3px 7px',
                                                border: '1px solid transparent',
                                                borderRadius: '3px',
                                            },
                                            value: {
                                                _type: 'string',
                                                value: 'Active'
                                            },
                                            onClick: {
                                                actionName: 'CHANGE_FLAG_ACTIVE'
                                            },
                                        },
                                        {
                                            _type: 'vNode',
                                            nodeType: 'text',
                                            style: {
                                                margin: '3px',
                                                padding: '3px 7px',
                                                border: '1px solid transparent',
                                                borderRadius: '3px',
                                            },
                                            value: {
                                                _type: 'string',
                                                value: 'Completed'
                                            },
                                            onClick: {
                                                actionName: 'CHANGE_FLAG_COMPLETED',
                                            },
                                        },
                                    ],
                                },
                                {
                                    _type: 'vNode',
                                    nodeType: 'text',
                                    style: {
                                        float: 'right',
                                        textAlign: 'right',
                                        position: 'relative',
                                    },
                                    value: {
                                        _type: 'string',
                                        value: 'Clear completed'
                                    },
                                    onClick: {
                                        actionName: 'CLEAR_COMPLETED'
                                    }
                                },
                            ],
                        },
                    ],
                },
            ],
        }],
    },
    // Views can depend on state, state definition has initial state and action/mutator pairs. To change itself state listens to actions and applies mutators
    state: {
        input: {
            stateType: 'string',
            defaultValue: '',
            mutators: {
                UPDATE_INPUT: 'UPDATE_INPUT',
                ADD_TODO: 'EMPTY_INPUT',
            },
        },
        flag: {
            stateType: 'string',
            defaultValue: 'ALL',
            mutators: {
                CHANGE_FLAG_ALL: 'CHANGE_FLAG_ALL',
                CHANGE_FLAG_ACTIVE: 'CHANGE_FLAG_ACTIVE',
                CHANGE_FLAG_COMPLETED: 'CHANGE_FLAG_COMPLETED',
            },
        },
        todos: {
            stateType: 'array',
            definition: {
                text: 'string',
                completed: 'boolean',
                showDestroy: 'boolean',
                editing: 'boolean',
            },
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
            mutators: {
                MARK_ALL_AS_COMPLETED: 'MARK_ALL_AS_COMPLETED',
                CHANGE_ITEM_STATUS: 'CHANGE_ITEM_STATUS',
                CLEAR_COMPLETED: 'CLEAR_COMPLETED',
                ADD_TODO: 'ADD_TODO',
            }
        }
    },
    // define mutations that state can apply to itself after an action
    mutators: {
        UPDATE_INPUT: {
            _type: 'eventValue',
        },
        EMPTY_INPUT: {
            _type: 'string',
            value: '',
        },
        CHANGE_FLAG_ALL: {
            _type: 'string',
            value: 'ALL',
        },
        CHANGE_FLAG_ACTIVE: {
            _type: 'string',
            value: 'ACTIVE',
        },
        CHANGE_FLAG_COMPLETED: {
            _type: 'string',
            value: 'COMPLETED',
        },
        MARK_ALL_AS_COMPLETED: {
            _type: 'map',
            data: {
                _type: 'state',
                value: 'todos',
            },
            identifier: 'mutatorMapId0',
            map: {
                _type: 'set',
                data: {
                    _type: 'mapValue',
                    value: 'mutatorMapId0',
                },
                name: 'completed',
                value: true
            },
        },
        CHANGE_ITEM_STATUS: {
            _type: 'map',
            data: {
                _type: 'state',
                value: 'todos',
            },
            identifier: 'mutatorMapId1',
            map: {
                _type: 'conditional',
                statement: {
                    _type: 'equals',
                    first: {
                        _type: 'objectValue',
                        object: {
                            _type: 'actionData',
                        },
                        value: 'itemId'
                    },
                    second: {
                        _type: 'mapIndex',
                        value: 'mutatorMapId1'
                    },
                },
                then: {
                    _type: 'set',
                    data: {
                        _type: 'mapValue',
                        value: 'mutatorMapId1',
                    },
                    name: 'completed',
                    value: {
                        _type: 'not',
                        value: {
                            _type: 'objectValue',
                            object: {
                                _type: 'mapValue',
                                value: 'mutatorMapId1',
                            },
                            value: 'completed'
                        }
                    }
                },
                else: {
                    _type: 'mapValue',
                    value: 'mutatorMapId1',
                }
            },
        },
        CLEAR_COMPLETED: {
            _type: 'filter',
            data: {
                _type: 'state',
                value: 'todos',
            },
            identifier: 'mutatorFilterId0',
            filter: {
                _type: 'equals',
                first: {
                    _type: 'objectValue',
                    object: {
                        _type: 'mapValue',
                        value: 'mutatorFilterId0'
                    },
                    value: {
                        _type: 'string',
                        value: 'completed'
                    },
                },
                second: {
                    _type: 'boolean',
                    value: false
                }
            },
        },
        ADD_TODO: {
            _type: 'push',
            data: {
                _type: 'state',
                value: 'todos',
            },
            value: {
                _type: 'object',
                value: {
                    text: {
                        _type: 'eventValue',
                    },
                    completed: false,
                    showDestroy: false,
                    editing: false,
                }
            },
        },
    },
    // connects mutators with state, it is actually just a cache so I wouldn't have to search through state on every action
    actions: {
        MARK_ALL_AS_COMPLETED: ['todos'],
        CHANGE_ITEM_STATUS: ['todos'],
        CLEAR_COMPLETED: ['todos'],
        CHANGE_FLAG_ALL: ['flag'],
        CHANGE_FLAG_ACTIVE: ['flag'],
        CHANGE_FLAG_COMPLETED: ['flag'],
        UPDATE_INPUT: ['input'],
        ADD_TODO: ['input', 'todos'],
    },
}