export default {
    view: {
        _type: 'vNode',
        nodeType: 'box',
        style: {
            color: '#dddddd',
            fontWeight: '300',
            fontSize: '14px',
            flex: '1',
            maxWidth: '350px',
            position: 'relative',
            background: '#4d4d4d',
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
            },
            {
                _type: 'vNode',
                nodeType: 'box',
                style: {
                    display: 'flex',
                    height: '100vh',
                    flexDirection: 'column',
                    color: '#dddddd'
                },
                children: [
                    {
                        _type: 'vNode',
                        nodeType: 'box',
                        style: {
                            flex: '2',
                        },
                        children: [
                            {
                                _type: 'vNode',
                                nodeType: 'text',
                                style: {
                                },
                                value: 'hi'
                            },
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
                            {
                                _type: 'vNode',
                                nodeType: 'text',
                                style: {
                                },
                                value: 'hi'
                            },
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
                                _type: 'vNode',
                                nodeType: 'text',
                                style: {
                                },
                                value: 'hi'
                            },
                        ]
                    }
                ],
            },
        ],
    },
    state: {
        input: {
            stateType: 'string',
            defaultValue: '',
            mutators: {
                UPDATE_INPUT: 'UPDATE_INPUT',
                ADD_TODO: 'EMPTY_INPUT',
            },
        },
    },
    mutators: {
        UPDATE_INPUT: {
            _type: 'eventValue',
        },
    },
    actions: {
        MARK_ALL_AS_COMPLETED: ['todos'],
    },
}