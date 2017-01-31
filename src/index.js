import ugnis from './ugnis'
import editor from './editor/editor'

// import savedApp from '../ugnis_components/app.json'

const emptyApp = {
    text: {
        'h5dsd6d2-00db-8ab5-c332-882575f25426': {
            _type: 'text',
            value: 'Current value: '
        },
        'mnr8d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'text',
            value: 'add one'
        },
        '5jsud6d2-00db-8ab5-c332-882575f25426': {
            _type: 'text',
            value: 'remove one'
        },
    },
    number: {
        'qpw7d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'number',
            value: 1
        },
        '3qp4d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'number',
            value: -1
        },
    },
    toLowerCase: {},
    toUpperCase: {},
    conditional: {},
    equal: {},
    not: {},
    list: {},
    eventValue: {},
    join: {
        'w86fd6d2-00db-8ab5-c332-882575f25426': {
            _type: 'join',
            a: { _type: 'ref', ref: 'state', id: '46vdd6d2-00db-8ab5-c332-882575f25426'},
            b: { _type: 'ref', ref: 'number', id: 'qpw7d6d2-00db-8ab5-c332-882575f25426'}
        },
        'u43wd6d2-00db-8ab5-c332-882575f25426': {
            _type: 'join',
            a: { _type: 'ref', ref: 'state', id: '46vdd6d2-00db-8ab5-c332-882575f25426'},
            b: { _type: 'ref', ref: 'number', id: '3qp4d6d2-00db-8ab5-c332-882575f25426'}
        },
        'p9s3d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'join',
            a: { _type: 'ref', ref: 'text', id: 'h5dsd6d2-00db-8ab5-c332-882575f25426'},
            b: { _type: 'ref', ref: 'state', id: '46vdd6d2-00db-8ab5-c332-882575f25426'},
        }
    },
    vNodeBox: {
        _rootNode: {
            _type: 'vNodeBox',
            title: 'box',
            style: {_type:'ref', ref:'styles', id:'_rootStyle'},
            children: [
                {_type:'ref', ref:'vNodeText', id:'2471d6d2-00db-8ab5-c332-882575f25425'},
                {_type:'ref', ref:'vNodeText', id:'1481d6d2-00db-8ab5-c332-882575f25425'},
                {_type:'ref', ref:'vNodeText', id:'3481d6d2-00db-8ab5-c332-882575f25425'}
            ],
        },
    },
    vNodeText: {
        '2471d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNodeText',
            title: 'text',
            style: {_type: 'ref', ref: 'styles', id: '8481d6d2-00db-8ab5-c332-882575f25426'},
            value: { _type: 'ref', ref: 'join', id: 'p9s3d6d2-00db-8ab5-c332-882575f25426'},
        },
        '1481d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNodeText',
            title: 'text',
            value: { _type: 'ref', ref: 'text', id: 'mnr8d6d2-00db-8ab5-c332-882575f25426'},
            style: {_type: 'ref', ref: 'styles', id: '9481d6d2-00db-8ab5-c332-882575f25426'},
            click: { _type: 'ref', ref: 'events', id: 'd48rd6d2-00db-8ab5-c332-882575f25426'},
        },
        '3481d6d2-00db-8ab5-c332-882575f25425': {
            _type: 'vNodeText',
            title: 'text',
            value: { _type: 'ref', ref: 'text', id: '5jsud6d2-00db-8ab5-c332-882575f25426'},
            style: {_type: 'ref', ref: 'styles', id: '7481d6d2-00db-8ab5-c332-882575f25426'},
            click: { _type: 'ref', ref: 'events', id: '3a54d6d2-00db-8ab5-c332-882575f25426'},
        },
    },
    vNodeInput: {},
    styles: {
        _rootStyle: {
            _type: 'style',
            fontFamily: "'Comfortaa', cursive",
            padding: '10px',
            background: '#f5f5f5',
        },
        '8481d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'style',
            padding: '10px',
            background: '#cccccc',
        },
        '9481d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'style',
            padding: '10px',
            background: '#aaaaaa',
            display: 'inline-block',
            marginLeft: '5px',
            borderRadius: '3px',
            cursor: 'pointer',
            userSelect: 'none',
        },
        '7481d6d2-00db-8ab5-c332-882575f25426': {
            _type: 'style',
            padding: '10px',
            background: '#999999',
            display: 'inline-block',
            marginLeft: '5px',
            borderRadius: '3px',
            cursor: 'pointer',
            userSelect: 'none',
        },
    },
    nameSpace: {
        _rootNameSpace: {
            title: 'state',
            children: [
                { _type: 'ref', ref: 'state', id: '46vdd6d2-00db-8ab5-c332-882575f25426'},
            ],
        },
    },
    state: {
        '46vdd6d2-00db-8ab5-c332-882575f25426': {
            _type: 'state',
            title: 'count',
            ref: '46vdd6d2-00db-8ab5-c332-882575f25426',
            stateType: 'number',
            defaultValue: 0,
            mutators: [
                { _type: 'ref', ref: 'mutators', id: 'as55d6d2-00db-8ab5-c332-882575f25426'},
                { _type: 'ref', ref: 'mutators', id: '9dq8d6d2-00db-8ab5-c332-882575f25426'},
            ]
        },
    },
    mutators: {
        'as55d6d2-00db-8ab5-c332-882575f25426': {
            event: { _type: 'ref', ref: 'events', id: 'd48rd6d2-00db-8ab5-c332-882575f25426'},
            state: { _type: 'ref', ref: 'state', id: '46vdd6d2-00db-8ab5-c332-882575f25426'},
            mutation: { _type: 'ref', ref: 'join', id: 'w86fd6d2-00db-8ab5-c332-882575f25426'},
        },
        '9dq8d6d2-00db-8ab5-c332-882575f25426': {
            event: { _type: 'ref', ref: 'events', id: '3a54d6d2-00db-8ab5-c332-882575f25426'},
            state: { _type: 'ref', ref: 'state', id: '46vdd6d2-00db-8ab5-c332-882575f25426'},
            mutation: { _type: 'ref', ref: 'join', id: 'u43wd6d2-00db-8ab5-c332-882575f25426'},
        },
    },
    events: {
        'd48rd6d2-00db-8ab5-c332-882575f25426':{
            title: 'increment',
            mutators: [
                { _type: 'ref', ref: 'mutators', id: 'as55d6d2-00db-8ab5-c332-882575f25426'},
            ]
        },
        '3a54d6d2-00db-8ab5-c332-882575f25426': {
            title: 'decrement',
            mutators: [
                { _type: 'ref', ref: 'mutators', id: '9dq8d6d2-00db-8ab5-c332-882575f25426'},
            ]
        },
    },
}
const app = ugnis(document.getElementById('app'), emptyApp)
editor(app)