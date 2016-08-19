const defaultState = [
    {
        componentId: 1,
        stateId: 0,
        type: 'onClick',
        mutation: [
            {
                type: 'state',
                stateId: 0,
            },
            {
                type: 'function',
                value: 'add',
            },
            {
                type: 'number',
                value: 1,
            },
        ],
    },
    {
        componentId: 2,
        stateId: 0,
        type: 'onClick',
        mutation: [
            {
                type: 'state',
                stateId: 0,
            },
            {
                type: 'function',
                value: 'subtract',
            },
            {
                type: 'number',
                value: 1,
            },
        ],
    },
]

export default (state = defaultState, action)=> {
    switch (action.type) {
        default:
            return state
    }
}