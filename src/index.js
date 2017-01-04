import ugnis from './ugnis'
import editor from './editor/editor'

const emptyApp = {
    nodes: {
        _rootNode: {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '_rootStyle',
            childrenIds: ['2471d6d2-00db-8ab5-c332-882575f25425', '1481d6d2-00db-8ab5-c332-882575f25425'],
        },
        '2471d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNode',
            nodeType: 'box',
            styleId: '8481d6d2-00db-8ab5-c332-882575f25426',
            childrenIds: ['3481d6d2-00db-8ab5-c332-882575f25425'],
        },
        '1481d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '9481d6d2-00db-8ab5-c332-882575f25426',
            value: 'Hi',
        },
        '3481d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNode',
            nodeType: 'text',
            styleId: '7481d6d2-00db-8ab5-c332-882575f25426',
            value: 'Hello',
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
        },
        '7481d6d2-00db-8ab5-c332-882575f25426': {
            padding: '10px',
            background: '#999999',
            display: 'inline-block',
        },
    },
    state: {
        _rootState: {
            title: 'root state',
            stateType: 'nameSpace',
            childrenIds: [],
        },
    },
    mutators: {},
    actions: {},
}
const app = ugnis(document.getElementById('app'), emptyApp)
editor(app)