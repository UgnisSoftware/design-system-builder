import { state, setState, listen } from './state'
import ugnis from '../ugnis'
import emptyDef from '../_empty.json'

const app = ugnis(emptyDef)

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
listen(() => {
    if (state.definitionList[state.currentDefinitionId] !== app.getCurrentDefinition()) {
        app.render(state.definitionList[state.currentDefinitionId])
    }
    if (oldState.appIsFrozen !== state.appIsFrozen || oldState.selectedViewNode !== state.selectedViewNode) {
        app._freeze(
            state.appIsFrozen,
            ref => {
                setState({ ...state, selectedViewNode: ref })
            },
            state.selectedViewNode
        )
    }
    oldState = state
})

export default app
