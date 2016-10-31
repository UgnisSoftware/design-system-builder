export default {
    rootNode: 'f55290cb-6204-022b-261c-c093a1baa8ba',
    nodes: {
        'f55290cb-6204-022b-261c-c093a1baa8ba': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '2f5912ce-d927-891a-1697-fe369728f034',
            childrenIds: ['1481d6d2-00db-8ab5-c332-882575f25422', '877ecf00-faa0-78d4-a11e-2ec308f30f01'],
            parentIds: [],
        },
        '1481d6d2-00db-8ab5-c332-882575f25422': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '9d187483-1c66-cd98-7667-90ad02a3858b',
            value: 'Close devtools',
            onClick: {
                actionName: 'TOGGLE_OPEN_DEVTOOLS'
            },
            parentIds: ['f55290cb-6204-022b-261c-c093a1baa8ba'],
        },
        '877ecf00-faa0-78d4-a11e-2ec308f30f01': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: 'f280bbd0-d982-d847-b717-5c35c185568c',
            childrenIds: ['2537b664-9cb9-2b84-d629-c462e47875d2', 'dfab80c8-6181-f7d5-3f6c-35d26b8b8313', '4af7b676-c0f5-35a3-c230-88f13e8c7da5'],
            parentIds: ['f55290cb-6204-022b-261c-c093a1baa8ba'],
        },
        '2537b664-9cb9-2b84-d629-c462e47875d2': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '5448cae5-37d7-370e-b276-5cc1ea92bff0',
            childrenIds: ['6bdd792d-6385-a824-1f01-70579f261875'],
            parentIds: ['877ecf00-faa0-78d4-a11e-2ec308f30f01'],
        },
        'dfab80c8-6181-f7d5-3f6c-35d26b8b8313': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '8e412044-12a2-2a05-ff50-86c1ef909c63',
            childrenIds: [],
            parentIds: ['877ecf00-faa0-78d4-a11e-2ec308f30f01'],
        },
        '4af7b676-c0f5-35a3-c230-88f13e8c7da5': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: 'fd30749b-06e7-b5b2-358d-22b8f47afc96',
            childrenIds: ['d854a06f-0e1e-d3e4-f82b-0d1c9d707720'],
            parentIds: ['877ecf00-faa0-78d4-a11e-2ec308f30f01'],
        },
        '6bdd792d-6385-a824-1f01-70579f261875': {
            _type: 'listObj',
            data: {
                _type: 'objectValue',
                object: {
                    _type: 'state',
                    value: 'definition'
                },
                value: 'state'
            },
            identifier: 'listObject1',
            list: {
                _type: 'vNode',
                nodeType: 'text',
                styleId: '5448cae5-37d7-370e-b276-5cc1ea92bff0',
                value: {
                    "_type": "listIndex",
                    "value": "listObject1"
                }
            },
            parentIds: ['2537b664-9cb9-2b84-d629-c462e47875d2'],
        },
        'd854a06f-0e1e-d3e4-f82b-0d1c9d707720': {
            _type: 'repeater',
            identifier: 'folder',
            data: {
                _type: 'objectValue',
                object: {
                    _type: 'state',
                    value: 'definition'
                },
                value: 'rootNode'
            },
            value: {
                _type: 'vNode',
                nodeType: 'box',
                styleId: '7bab95c0-32da-d258-835f-fbff59984922',
                childrenIds: ['1442bf6c-23d7-6026-a40e-11b08d14e941', '83b4e3a0-da1c-6a2b-9771-6c919e3a754e']
            },
        },
        '1442bf6c-23d7-6026-a40e-11b08d14e941': {
            _type: 'vNode',
            nodeType: 'text',
            //style: {},
            value: {
                _type: 'objectValue',
                object: {
                    _type: 'objectValue',
                    object: {
                        _type: 'objectValue',
                        object: {
                            _type: 'state',
                            value: 'definition'
                        },
                        value: 'nodes'
                    },
                    value: {
                        _type: 'listValue',
                        value: 'folder',
                    }
                },
                value: 'nodeType'
            },
            onClick: {
                actionName: 'NODE_FOLDER_CLICKED',
                data: {
                    _type: 'object',
                    value: {
                        nodeId: {
                            _type: 'listValue',
                            value: 'folder',
                        }
                    }
                }
            }
        },
        '83b4e3a0-da1c-6a2b-9771-6c919e3a754e': {
            _type: 'conditional',
            statement: {
                _type: 'equals',
                first: {
                    _type: 'objectValue',
                    object: {
                        _type: 'objectValue',
                        object: {
                            _type: 'objectValue',
                            object: {
                                _type: 'state',
                                value: 'definition'
                            },
                            value: 'nodes'
                        },
                        value: {
                            _type: 'listValue',
                            value: 'folder',
                        }
                    },
                    value: 'nodeType'
                },
                second: 'box'
            },
            then: {
                _type: 'vNode',
                nodeType: 'box',
                styleId: 'f13ed055-b036-edae-6b7e-783aef4c5c52',
                childrenIds: [ 'd273cf1a-012c-e71b-040c-21b44332d7c8']
            },
        },
        'd273cf1a-012c-e71b-040c-21b44332d7c8': {
            _type: 'list',
            data: {
                _type: 'objectValue',
                object:  {
                    _type: 'objectValue',
                    object: {
                        _type: 'objectValue',
                        object: {
                            _type: 'state',
                            value: 'definition'
                        },
                        value: 'nodes'
                    },
                    value: {
                        _type: 'listValue',
                        value: 'folder',
                    }
                },
                value: 'childrenIds'
            },
            identifier: 'folderMap1',
            list: {
                _type: 'repeat',
                identifier: 'folder',
                data: {
                    "_type": "listValue",
                    "value": "folderMap1"
                }
            },
        },
    },
    styles: {
        '2f5912ce-d927-891a-1697-fe369728f034': {
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
        '9d187483-1c66-cd98-7667-90ad02a3858b': {
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
        'f280bbd0-d982-d847-b717-5c35c185568c': {
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
        '5448cae5-37d7-370e-b276-5cc1ea92bff0': {
            flex: '2',
        },
        '8e412044-12a2-2a05-ff50-86c1ef909c63': {
            flex: '1',
            borderTop: '1px solid #cccccc',
        },
        'fd30749b-06e7-b5b2-358d-22b8f47afc96': {
            flex: '2',
            borderTop: '1px solid #cccccc',
        },
        '7bab95c0-32da-d258-835f-fbff59984922': {
            paddingLeft: '10px',
        },
        'f13ed055-b036-edae-6b7e-783aef4c5c52': {
            _type: 'object',
            value: {
                display: {
                    _type: 'conditional',
                    statement: {
                        _type: 'objectValue',
                        object: {
                            _type: 'state',
                            value: 'uiNodesClosed'
                        },
                        value: {
                            _type: 'listValue',
                            value: 'folder',
                        }
                    },
                    then: 'none',
                    else: 'block',
                }
            }
        },
    },
    state: {
        definition: {
            stateType: 'object',
            defaultValue: {
                rootNode: '951a66fd-49e2-04d1-e0e0-97726b76887b',
                nodes: {
                    '951a66fd-49e2-04d1-e0e0-97726b76887b': {
                        _type: 'vNode',
                        nodeType: 'box',
                        childrenIds: []
                    }
                },
                styles: {},
                state: {},
                mutators: {},
                actions: {}
            },
        },
        isOpen: {
            stateType: 'boolean',
            defaultValue: true,
            mutators: {
                TOGGLE_OPEN_DEVTOOLS: 'TOGGLE_OPEN_DEVTOOLS',
            },
        },
        uiNodesClosed: {
            stateType: 'object',
            defaultValue: {},
            mutators: {
                NODE_FOLDER_CLICKED: 'TOGGLE_NODE',
            },
        },
    },
    mutators: {
        TOGGLE_OPEN_DEVTOOLS: {
            _type: 'not',
            value: {
                _type: 'state',
                value: 'isOpen',
            }
        },
        TOGGLE_NODE: {
            _type: 'set',
            data: {
                _type: 'state',
                value: 'uiNodesClosed',
            },
            name: {
                _type: 'objectValue',
                object:{
                    _type: 'actionData'
                },
                value: 'nodeId',
            },
            value: {
                _type: 'not',
                value: {
                    _type: 'ifExists',
                    data: {
                        _type: 'state',
                        value: 'uiNodesClosed',
                    },
                    key: {
                        _type: 'objectValue',
                        object:{
                            _type: 'actionData'
                        },
                        value: 'nodeId',
                    },
                    else: false
                }
            },
        },
    },
    actions: {
        TOGGLE_OPEN_DEVTOOLS: ['isOpen'],
        NODE_FOLDER_CLICKED: ['uiNodesClosed']
    },
}