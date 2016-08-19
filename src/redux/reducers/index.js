import { combineReducers } from 'redux'

import ui from './ui'
import nodes from './nodes'
import state from './state'
import actions from './actions'

const rootReducer = combineReducers({
    ui,
    nodes,
    state,
    actions,
})

export default rootReducer