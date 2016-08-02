import { FOCUS_NODE } from '../actions/nodes'

const defaultState = {
    selectedNodeId: 0,
}

export default (state = defaultState, action)=> {
    switch (action.type) {
        case FOCUS_NODE:
            return { ...state, selectedNodeId: action.id }
        default:
            return state
    }
}