export default {
    view: {
        _type: 'vNode',
        nodeType: 'box',
        style: {
            color: '#dddddd',
            fontWeight: '300',
            fontSize: '14px',
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#4d4d4d',
            boxSizing: "border-box",
            borderLeft: '3px solid #333333',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            
        },
        children: [
            {
                _type: 'vNode',
                nodeType: 'text',
                style: {
                    position: 'absolute',
                    left: '-45px',
                    transform: 'rotate(180deg)',
                    writingMode: 'vertical-lr',
                    padding: '15px 5px 15px 5px',
                    borderRadius: '0px 5px 5px 0px',
                    top: '30px',
                    fontSize: '2em',
                    background: '#4d4d4d',
                    cursor: 'pointer',
                    transition: 'all 0.5s',
                },
                value: 'Close devtools',
                onClick: {
                    actionName: 'TOGGLE_OPEN_DEVTOOLS'
                }
            },
            {
                _type: 'vNode',
                nodeType: 'box',
                style: {
                    _type: 'object',
                    value: {
                        display: 'flex',
                        height: '100vh',
                        flexDirection: 'column',
                        color: '#dddddd',
                        transition: '0.5s width',
                        overflow: 'hidden',
                        width: {
                            _type: 'conditional',
                            statement: {
                                _type: 'state',
                                value: 'isOpen'
                            },
                            then: '350px',
                            else: '0px',
                        }
                    }
                },
                children: [
                    {
                        _type: 'vNode',
                        nodeType: 'box',
                        style: {
                            flex: '2',
                        },
                        children: [
                        ]
                    },
                    {
                        _type: 'vNode',
                        nodeType: 'box',
                        style: {
                            flex: '1',
                            borderTop: '1px solid #cccccc'
                        },
                        children: [
                        ]
                    },
                    {
                        _type: 'vNode',
                        nodeType: 'box',
                        style: {
                            flex: '2',
                            borderTop: '1px solid #cccccc'
                        },
                        children: [
                            {
                                _type: 'component',
                                value: 'folder',
                                defaultState: {
                                    _type: 'object',
                                    value: {
                                        node: {
                                            _type: 'objectValue',
                                            object: {
                                                _type: 'objectValue',
                                                object: {
                                                    _type: 'state',
                                                    value: 'app'
                                                },
                                                value: 'definition'
                                            },
                                            value: 'view'
                                        },
                                    },
                                },
                            },
                        ]
                    }
                ],
            },
        ],
    },
    state: {
        isOpen: {
            stateType: 'boolean',
            defaultValue: true,
            mutators: {
                TOGGLE_OPEN_DEVTOOLS: 'TOGGLE_OPEN_DEVTOOLS',
            },
        },
        app: {
            stateType: 'object',
            defaultValue: {
                definition: {
                    view: {},
                    state: {},
                    mutators: {},
                    actions: {}
                }
            },
            mutators: {
            },
        }
    },
    mutators: {
        TOGGLE_OPEN_DEVTOOLS: {
            _type: 'not',
            value: {
                _type: 'state',
                value: 'isOpen',
            }
        },
    },
    actions: {
        TOGGLE_OPEN_DEVTOOLS: ['isOpen'],
    },
}