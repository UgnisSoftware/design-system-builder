export default {
    view: {
        _type: 'vNode',
        nodeType: 'box',
        style: {
            paddingLeft: '10px',
        },
        children: [
            {
                _type: 'vNode',
                nodeType: 'text',
                style: {},
                value: {
                    _type: 'objectValue',
                    object: {
                        "_type": "state",
                        "value": "node"
                    },
                    value: 'nodeType'
                },
                onClick: {
                    "actionName": "CHANGE_SHOW"
                }
            },
            {
                _type: 'conditional',
                statement: {
                    _type: 'equals',
                    first: {
                        _type: 'objectValue',
                        object: {
                            "_type": "state",
                            "value": "node"
                        },
                        value: 'nodeType'
                    },
                    second: 'box'
                },
                then: {
                    _type: 'vNode',
                    nodeType: 'box',
                    style: {
                        _type: 'object',
                        value: {
                            display: {
                                _type: 'conditional',
                                statement: {
                                    _type: 'state',
                                    value: 'showChildren'
                                },
                                then: 'block',
                                else: 'none',
                            }
                        }
                    },
                    children: [
                        {
                            _type: 'map',
                            data: {
                                _type: 'objectValue',
                                object: {
                                    "_type": "state",
                                    "value": "node"
                                },
                                value: 'children'
                            },
                            identifier: 'folderMap1',
                            map: {
                                _type: 'component',
                                value: 'folder',
                                defaultState: {
                                    _type: 'object',
                                    value: {
                                        node: {
                                            "_type": "mapValue",
                                            "value": "folderMap1"
                                        }
                                    }
                                },
                            },
                        },
                    ]
                },
            },
        ],
    },
    state: {
        node: {
            stateType: 'object',
            defaultValue: {},
        },
        showChildren: {
            stateType: 'boolean',
            defaultValue: true,
            mutators: {
                CHANGE_SHOW: 'CHANGE_SHOW'
            }
        }
    },
    mutators: {
        CHANGE_SHOW: {
            _type: 'not',
            value: {
                _type: 'state',
                value: 'showChildren',
            }
        },
    },
    actions: {
        CHANGE_SHOW: ['showChildren'],
    },
}