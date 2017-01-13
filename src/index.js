import ugnis from './ugnis'
import editor from './editor/editor'

// import savedApp from '../ugnis_components/app.json'

const emptyApp = {
    nodes: {
        _rootNode: {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '_rootStyle',
            childrenIds: ['2471d6d2-00db-8ab5-c332-882575f25425', '1481d6d2-00db-8ab5-c332-882575f25425', '3481d6d2-00db-8ab5-c332-882575f25425'],
        },
        '2471d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '8481d6d2-00db-8ab5-c332-882575f25426',
            value: {
                _type: 'sum',
                first: 'Current value: ',
                second: {
                    _type: 'state',
                    value: '46vdd6d2-00db-8ab5-c332-882575f25426'
                }
            },
        },
        '1481d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '9481d6d2-00db-8ab5-c332-882575f25426',
            value: '+1',
            onClick: {
                eventName: 'd48rd6d2-00db-8ab5-c332-882575f25426'
            },
        },
        '3481d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '7481d6d2-00db-8ab5-c332-882575f25426',
            value: '-1',
            onClick: {
                eventName: '3a54d6d2-00db-8ab5-c332-882575f25426'
            },
        },
    },
    styles: {
        _rootStyle: {
            padding: '10px',
            background: '#f5f5f5',
        },
        '8481d6d2-00db-8ab5-c332-882575f25426': {
            padding: '10px',
            background: '#cccccc',
        },
        '9481d6d2-00db-8ab5-c332-882575f25426': {
            padding: '10px',
            background: '#aaaaaa',
            display: 'inline-block',
            marginLeft: '5px',
            borderRadius: '3px',
            cursor: 'pointer',
            userSelect: 'none',
        },
        '7481d6d2-00db-8ab5-c332-882575f25426': {
            padding: '10px',
            background: '#999999',
            display: 'inline-block',
            marginLeft: '5px',
            borderRadius: '3px',
            cursor: 'pointer',
            userSelect: 'none',
        },
    },
    state: {
        _rootState: {
            title: 'state',
            stateType: 'nameSpace',
            childrenIds: ['46vdd6d2-00db-8ab5-c332-882575f25426'],
        },
        '46vdd6d2-00db-8ab5-c332-882575f25426': {
            title: 'count',
            stateType: 'number',
            defaultValue: 0,
            mutators: {
                'd48rd6d2-00db-8ab5-c332-882575f25426': 'as55d6d2-00db-8ab5-c332-882575f25426',
                '3a54d6d2-00db-8ab5-c332-882575f25426': '9dq8d6d2-00db-8ab5-c332-882575f25426',
            },
        },
    },
    mutators: {
        'as55d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'sum',
            first: {
                _type: 'state',
                value: '46vdd6d2-00db-8ab5-c332-882575f25426'
            },
            second: 1
        },
        '9dq8d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'sum',
            first: {
                _type: 'state',
                value: '46vdd6d2-00db-8ab5-c332-882575f25426'
            },
            second: -1
        },
    },
    events: {
        'd48rd6d2-00db-8ab5-c332-882575f25426':{
            title: 'increment',
            states: ['46vdd6d2-00db-8ab5-c332-882575f25426'],
        },
        '3a54d6d2-00db-8ab5-c332-882575f25426': {
            title: 'decrement',
            states: ['46vdd6d2-00db-8ab5-c332-882575f25426'],
        },
    },
}
const app = ugnis(document.getElementById('app'), emptyApp)
editor(app)