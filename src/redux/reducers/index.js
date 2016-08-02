import { combineReducers } from 'redux'

import ui from './ui'
import nodes from './nodes'

const rootReducer = combineReducers({
    ui,
    nodes,
})

export default rootReducer