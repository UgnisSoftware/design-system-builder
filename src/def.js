export default {
    mutators: {
        COUNT_PLUS_ONE: {
            type: 'sum',
            first: {
                type: 'state',
                stateName: 'Count',
            },
            second: {
                type: 'number',
                value: 1,
            },
        },
    },
    actions: {
        ADD_ONE: {
            states: ['Count'],
        },
    },
    state: {
        Count: {
            type: 'number',
            defaultValue: 0,
            mutators: {
                ADD_ONE: 'COUNT_PLUS_ONE', // mutatorName
            },
        },
    },
    view: {
        type: 'box',
        children: {
            type: 'array',
            value: [
                {
                    type: 'text',
                    value: {
                        type: 'state',
                        stateName: 'Count',
                    },
                },
                {
                    type: 'text',
                    value: {
                        type: 'string',
                        value: '+',
                    },
                    onClick: 'ADD_ONE', // actionName
                },
            ],
        },
    },
}