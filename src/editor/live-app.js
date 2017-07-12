import {state, setState, listen} from './state'
import ugnis from '../ugnis'

const app = ugnis(state.definition)

// Listen to app
app.addListener((eventId, data, e, previousState, currentState, mutations) => {
    setState({
        ...state,
        eventStack: state.eventStack.concat({
            eventId,
            data,
            e,
            previousState,
            currentState,
            mutations,
        }),
    })
})

let oldState = state
listen(()=> {
    if(state.definition !== app.getCurrentDefinition()){
        app.render(state.definition)
    }
    if (oldState.appIsFrozen !== state.appIsFrozen || oldState.selectedViewNode !== state.selectedViewNode) {
        app._freeze(state.appIsFrozen, (ref) => { setState({ ...state, selectedViewNode: ref })}, state.selectedViewNode)
    }
    oldState = state
})

export default app