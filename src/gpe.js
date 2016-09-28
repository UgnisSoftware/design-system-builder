/**
 *  General Purpose Editor
 */

const types = {
    string: {
        _type: 'string',
        value: '',
    },
    number: {
        _type: 'number',
        value: 0,
    },
    boolean: {
        _type: 'boolean',
        value: true,
    },
    array: {
        _type: 'array',
        value: [],
    },
    object: {
        _type: 'object',
        value: {},
    },
    // enum
    // category
    // vnode // vnodeBox, vnodeText ????
}

const operations = {
    equals: {
        _type: 'equals',
        first: 'any',
        second: 'any',
    },
    conditional: {
        _type: 'conditional',
        statement: 'boolean',
        first: 'any',
        second: 'any',
    },
    objectValue: {
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
}