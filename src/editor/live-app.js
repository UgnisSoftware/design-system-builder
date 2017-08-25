import { state, setState, listen } from 'lape'
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

listen((state, oldState) => {
    if (state.definitionList[state.currentDefinitionId] !== app.getCurrentDefinition()) {
        app.render(state.definitionList[state.currentDefinitionId])
    }
    if (oldState.appIsFrozen !== state.appIsFrozen || oldState.selectedViewNode !== state.selectedViewNode) {
        app._freeze(
            state.appIsFrozen,
            state.selectedViewNode
        )
    }
})

export default app
