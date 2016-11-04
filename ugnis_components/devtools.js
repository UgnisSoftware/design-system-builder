export default {
    nodes: {
        '_rootNode': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '2f5912ce-d927-891a-1697-fe369728f034',
            childrenIds: ['1481d6d2-00db-8ab5-c332-882575f25422', '877ecf00-faa0-78d4-a11e-2ec308f30f01'],
        },
        '1481d6d2-00db-8ab5-c332-882575f25422': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '9d187483-1c66-cd98-7667-90ad02a3858b',
            value: 'Close devtools',
            onClick: {
                actionName: 'TOGGLE_OPEN_DEVTOOLS'
            },
        },
        '877ecf00-faa0-78d4-a11e-2ec308f30f01': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: 'f280bbd0-d982-d847-b717-5c35c185568c',
            childrenIds: ['2537b664-9cb9-2b84-d629-c462e47875d2', 'dfab80c8-6181-f7d5-3f6c-35d26b8b8313', '4af7b676-c0f5-35a3-c230-88f13e8c7da5'],
        },
        '2537b664-9cb9-2b84-d629-c462e47875d2': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '5448cae5-37d7-370e-b276-5cc1ea92bff0',
            childrenIds: ['6bdd792d-6385-a824-1f01-70579f261875'],
        },
        'dfab80c8-6181-f7d5-3f6c-35d26b8b8313': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '8e412044-12a2-2a05-ff50-86c1ef909c63',
            childrenIds: ['26cbcbcb-4a93-75e3-dda5-1a545207642d'],
        },
        '26cbcbcb-4a93-75e3-dda5-1a545207642d': {
            _type: 'vNode',
            nodeType: 'box',
            //styleId: '8e412044-12a2-2a05-ff50-86c1ef909c63',
            childrenIds: ['6eb58745-c122-cb63-6f10-cfcc28a87feb'],
        },
        '6eb58745-c122-cb63-6f10-cfcc28a87feb':{
            _type: 'vNode',
            nodeType: 'text',
            value: {
                _type: 'state',
                value: '6b9da8cc-5ab5-27ad-5965-3ac65c248472',
            },
        },
        '4af7b676-c0f5-35a3-c230-88f13e8c7da5': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: 'fd30749b-06e7-b5b2-358d-22b8f47afc96',
            childrenIds: ['d854a06f-0e1e-d3e4-f82b-0d1c9d707720'],
        },
        '6bdd792d-6385-a824-1f01-70579f261875': {
            _type: 'listObj',
            data: {
                _type: 'state',
                value: 'state',
            },
            identifier: 'listObject1',
            list: {
                _type: 'vNode',
                nodeType: 'text',
                styleId: '599e3e50-1a08-2819-ff3e-d0aac3ebcfed',
                value: {
                    _type: 'objectValue',
                    object: {
                        _type: 'listValue',
                        value: 'listObject1',
                    },
                    value: 'title'
                },
            },
        },
        'd854a06f-0e1e-d3e4-f82b-0d1c9d707720': {
            _type: 'repeater',
            identifier: 'folder',
            data: '_rootNode',
            value: {
                _type: 'vNode',
                nodeType: 'box',
                styleId: '7bab95c0-32da-d258-835f-fbff59984922',
                childrenIds: ['2c3ab5d7-1276-7ee6-d694-a845f9a004a5', '1442bf6c-23d7-6026-a40e-11b08d14e941', '83b4e3a0-da1c-6a2b-9771-6c919e3a754e', '323f80ba-ff2a-cad3-7d0e-a9d2bb9523f1']
            },
        },
        '2c3ab5d7-1276-7ee6-d694-a845f9a004a5': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: 'e96f7622-8007-6a7b-8702-979e6c18f428',
            value: {
                _type: 'conditional',
                statement: {
                    _type: 'ifExists',
                    data: {
                        _type: 'state',
                        value: '407ee467-67b9-2425-ef9c-3ec9ee880d87',
                    },
                    key: {
                        _type: 'listValue',
                        value: 'folder',
                    },
                    else: false
                },
                then: '+',
                else: '-',
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
        '1442bf6c-23d7-6026-a40e-11b08d14e941': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: 'fc4e05b7-fc3a-a35e-c9d8-6bfd0ed14516',
            value: {
                _type: 'objectValue',
                object: {
                    _type: 'objectValue',
                    object: {
                        _type: 'state',
                        value: 'nodes',
                    },
                    value: {
                        _type: 'listValue',
                        value: 'folder',
                    }
                },
                value: 'nodeType'
            },
            onClick: {
                actionName: 'SELECT_NODE',
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
                        object:  {
                            _type: 'state',
                            value: 'nodes',
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
                        _type: 'state',
                        value: 'nodes',
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
        '323f80ba-ff2a-cad3-7d0e-a9d2bb9523f1':{
            _type: 'vNode',
            nodeType: 'text',
            styleId: '5f05ea1a-457c-4290-10b4-72763c09c446',
            value: 'add component',
            onClick: {
                actionName: 'ADD_NODE',
                data: {
                    _type: 'object',
                    value: {
                        nodeId: {
                            _type: "listValue",
                            value: "folder",
                        },
                        newNodeId: {
                            _type: 'uuid'
                        },
                        newStyleId: {
                            _type: 'uuid'
                        }
                    }
                }
            }
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
                fontSize: '1.2em',
                flexDirection: 'column',
                color: '#dddddd',
                transition: '0.5s width',
                overflow: 'hidden',
                width: {
                    _type: 'conditional',
                    statement: {
                        _type: 'state',
                        value: 'a79098fc-eeb8-228a-179b-1a04c701fcab'
                    },
                    then: '350px',
                    else: '0px',
                }
            }
        },
        '599e3e50-1a08-2819-ff3e-d0aac3ebcfed': {
            display: 'block',
            padding: '2px',
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
            padding: '10px',
            display: 'block',
        },
        'f13ed055-b036-edae-6b7e-783aef4c5c52': {
            _type: 'object',
            value: {
                display: {
                    _type: 'conditional',
                    statement: {
                        _type: 'ifExists',
                        data: {
                            _type: 'state',
                            value: '407ee467-67b9-2425-ef9c-3ec9ee880d87',
                        },
                        key: {
                            _type: 'listValue',
                            value: 'folder',
                        },
                        else: false
                    },
                    then: 'none',
                    else: 'block',
                }
            }
        },
        '5f05ea1a-457c-4290-10b4-72763c09c446': {
            borderRadius: '5px',
            background: 'white',
            color: '#222222',
            padding: '5px',
            display: 'inline-block',
        },
        'e96f7622-8007-6a7b-8702-979e6c18f428': {
            padding: '0 5px',
            cursor: 'pointer',
        },
        'fc4e05b7-fc3a-a35e-c9d8-6bfd0ed14516': {
            cursor: 'pointer',
        }
    },
    state: {
        '_rootState': {
            title: 'root state',
            stateType: 'nameSpace',
            childrenIds: [
                '61dd3de6-39bc-bbf3-ad6b-81f81ed83f55',
                'a79098fc-eeb8-228a-179b-1a04c701fcab',
                '407ee467-67b9-2425-ef9c-3ec9ee880d87',
                '6b9da8cc-5ab5-27ad-5965-3ac65c248472',
            ],
        },
        '61dd3de6-39bc-bbf3-ad6b-81f81ed83f55': {
            title: 'application',
            stateType: 'nameSpace',
            childrenIds: ['nodes', 'styles', 'state', 'mutators'],
        },
        'nodes': {
            title: 'nodes',
            stateType: 'collection',
            defaultValue: {
                '_rootNode': {
                    _type: 'vNode',
                    nodeType: 'box',
                    childrenIds: []
                }
            },
            mutators: {
                ADD_NODE: 'ADD_NODE'
            }
        },
        'styles': {
            title: 'styles',
            stateType: 'collection',
            defaultValue: {},
            mutators: {
                ADD_NODE: 'ADD_STYLE'
            }
        },
        'state': {
            title: 'state',
            stateType: 'collection',
            defaultValue: {},
        },
        'mutators': {
            title: 'mutators',
            stateType: 'collection',
            defaultValue: {},
        },
        'actions': {
            title: 'actions',
            stateType: 'collection',
            defaultValue: {},
        },
        '1040cc15-76d7-d6a4-97f8-87c16a57c784': {
            title: 'defaultStateConnectors',
            stateType: 'collection',
            defaultValue: {},
        },
        'a79098fc-eeb8-228a-179b-1a04c701fcab': {
            title: 'is devtools open',
            stateType: 'boolean',
            defaultValue: true,
            mutators: {
                TOGGLE_OPEN_DEVTOOLS: 'TOGGLE_OPEN_DEVTOOLS',
            },
        },
        '407ee467-67b9-2425-ef9c-3ec9ee880d87': {
            title: 'is node closed',
            stateType: 'collection',
            defaultValue: {},
            mutators: {
                NODE_FOLDER_CLICKED: 'TOGGLE_NODE',
            },
        },
        '6b9da8cc-5ab5-27ad-5965-3ac65c248472': {
            title: 'selected node',
            stateType: 'string',
            defaultValue: '_rootNode',
            mutators: {
                SELECT_NODE: 'SELECT_NODE',
            },
        },
    },
    mutators: {
        TOGGLE_OPEN_DEVTOOLS: {
            _type: 'not',
            value: {
                _type: 'state',
                value: 'a79098fc-eeb8-228a-179b-1a04c701fcab',
            }
        },
        TOGGLE_NODE: {
            _type: 'set',
            data: {
                _type: 'state',
                value: '407ee467-67b9-2425-ef9c-3ec9ee880d87',
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
                        value: '407ee467-67b9-2425-ef9c-3ec9ee880d87',
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
        ADD_NODE: {
            _type: 'set',
            data: {
                _type: 'set',
                data: {
                    _type: 'state',
                    value: 'nodes',
                },
                name: {
                    _type: 'objectValue',
                    object:{
                        _type: 'actionData'
                    },
                    value: 'nodeId',
                },
                value: {
                    _type: 'set',
                    data: {
                        _type: 'objectValue',
                        object:{
                            _type: 'state',
                            value: 'nodes',
                        },
                        value: {
                            _type: 'objectValue',
                            object:{
                                _type: 'actionData'
                            },
                            value: 'nodeId',
                        },
                    },
                    name: 'childrenIds',
                    value: {
                        _type: 'push',
                        data: {
                            _type: 'objectValue',
                            object: {
                                _type: 'objectValue',
                                object:{
                                    _type: 'state',
                                    value: 'nodes',
                                },
                                value: {
                                    _type: 'objectValue',
                                    object:{
                                        _type: 'actionData'
                                    },
                                    value: 'nodeId',
                                },
                            },
                            value: 'childrenIds',
                        },
                        value: {
                            _type: 'objectValue',
                            object:{
                                _type: 'actionData'
                            },
                            value: 'newNodeId',
                        }
                    },
                },
            },
            name: {
                _type: 'objectValue',
                object:{
                    _type: 'actionData'
                },
                value: 'newNodeId',
            },
            value: {
                _type: 'object',
                value: {
                    _type: 'vNode',
                    nodeType: 'box',
                    styleId: {
                        _type: 'objectValue',
                        object:{
                            _type: 'actionData'
                        },
                        value: 'newStyleId',
                    },
                    childrenIds: [],
                },
            },
        },
        ADD_STYLE: {
            _type: 'set',
            data: {
                _type: 'state',
                value: 'styles',
            },
            name: {
                _type: 'objectValue',
                object:{
                    _type: 'actionData'
                },
                value: 'newStyleId',
            },
            value: {
                _type: 'object',
                value: {
                    padding: '10px',
                    backgroundColor: {
                        _type: 'randomColor'
                    }
                },
            },
        },
        SELECT_NODE: {
            _type: 'objectValue',
            object:{
                _type: 'actionData'
            },
            value: 'nodeId',
        },
    },
    actions: {
        TOGGLE_OPEN_DEVTOOLS: ['a79098fc-eeb8-228a-179b-1a04c701fcab'],
        NODE_FOLDER_CLICKED: ['407ee467-67b9-2425-ef9c-3ec9ee880d87'],
        ADD_NODE: ['nodes', 'styles'],
        SELECT_NODE: ['6b9da8cc-5ab5-27ad-5965-3ac65c248472'],
    },
}