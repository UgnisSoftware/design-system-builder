import {state, listen, setState} from './state'

// undo/redo
let stateStack = []
// implement state stack for every component separately
let stateStackHistory = { }

let oldState = state
listen(()=>{
    const sameComponent = oldState.currentDefinitionId === state.currentDefinitionId
    const definitionChanged = oldState.definitionList[state.currentDefinitionId] !== state.definitionList[state.currentDefinitionId]
    const timeTravelling = stateStack.includes(state.definitionList[state.currentDefinitionId]) // not a new definition
    // changed which component is selected, switch current stateStack to the new components stack or if first time, create new
    if (!sameComponent) {
        if (stateStackHistory[state.currentDefinitionId]) {
            stateStack = stateStackHistory[state.currentDefinitionId]
        } else {
            stateStack = [state.definitionList[state.currentDefinitionId]]
            stateStackHistory[state.currentDefinitionId] = [state.definitionList[state.currentDefinitionId]]
        }
    }
    // add to state stack
    if (sameComponent && definitionChanged && !timeTravelling) {
        // add the new definition as the last definition
        const currentIndex = stateStack.findIndex(a => a === oldState.definitionList[state.currentDefinitionId])
        stateStack = stateStack.slice(0, currentIndex + 1).concat(state.definitionList[state.currentDefinitionId])
        stateStackHistory[state.currentDefinitionId] = stateStack
    }
    oldState = state
})

document.addEventListener('keydown', e => {
    // 32 - space
    // 90 - z
    // 89 - y
    if (e.which === 32 && e.ctrlKey) {
        e.preventDefault()
        setState({
            ...state,
            appIsFrozen: !state.appIsFrozen
        })
    }
    if (!e.shiftKey && e.which === 90 && e.ctrlKey) {
        e.preventDefault()
        const currentIndex = stateStack.findIndex(a => a === state.definitionList[state.currentDefinitionId])
        if (currentIndex > 0) {
            const newDefinition = stateStack[currentIndex - 1]
            setState({ ...state,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: newDefinition
                },
            })
        }
    }
    if ((e.which === 89 &&  e.ctrlKey) || (e.shiftKey && e.which === 90 && e.ctrlKey)) {
        e.preventDefault()
        const currentIndex = stateStack.findIndex(a => a === state.definitionList[state.currentDefinitionId])
        if (currentIndex < stateStack.length - 1) {
            const newDefinition = stateStack[currentIndex + 1]
            setState({ ...state,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: newDefinition
                },
            })
        }
    }
})