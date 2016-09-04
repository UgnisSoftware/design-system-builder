export const mutators = {
    COUNT_PLUS_ONE: {
        type: 'sum',
        first: {
            type: 'state',
            stateName: 'Count',
        },
        second: {
            type: 'number',
            value: 1
        },
    },
}

export const actions = {
    ADD_ONE: {
        states: ['Count']
    }
}

export const state = {
    Count: {
        type: 'number',
        defaultValue: 0,
        mutators: {
            ADD_ONE: 'COUNT_PLUS_ONE' // mutatorName
        }
    }
}

export const view = {
    type: 'box',
    children: {
        type: 'array',
        value: [ {
            type: 'text',
            value: {
                type: 'state',
                stateName: 'Count',
            }
        }, {
            type: 'text',
            value: {
                type: 'string',
                value: '+',
            },
            onClick: 'ADD_ONE' // actionName
        }]
    }
}