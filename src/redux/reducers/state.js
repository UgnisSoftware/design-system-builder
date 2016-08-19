import update from 'react-addons-update'
import { ADD_STATE } from '../actions/state'
import { STATE_MUTATION } from '../actions/state'

const defaultState = [
    {
        type: 'number',
        name: 'Count',
        defaultValue: 0,
        value: 0,
        actions: [0, 1],
        nodes: [0],
    },
]

export default (state = defaultState, action)=> {
    switch (action.type) {
        case ADD_STATE:
            return state.concat({ // TODO
                type: 'string',
                name: 'Example Text',
                value: 'Hello',
                actions: [0],
                nodes: [0],
            })
        case 'onClick': {
            return update(state, {
                [action.stateId]: {
                    value: {
                        $set: action.mutation[1].value === 'add' ? state[action.stateId].value + 1 : state[action.stateId].value - 1
                    }
                }
            })
        }
        default:
            return state
    }
}