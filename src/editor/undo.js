import {state, listen, setState} from './state'

// undo/redo
let stateStack = [state.definition]
// implement state stack for every component separately
let stateStackHistory = { [state.currentDefinition]: stateStack }

let oldState = state
listen(()=>{
    const sameComponent = oldState.currentDefinition === state.currentDefinition
    const definitionChanged = oldState.definition !== state.definition
    const timeTravelling = stateStack.includes(state.definition) // not a new definition
    // changed which component is selected, switch current stateStack to the new components stack or if first time, create new
    if (!sameComponent) {
        if (stateStackHistory[state.currentDefinition]) {
            stateStack = stateStackHistory[state.currentDefinition]
        } else {
            stateStack = [state.definition]
            stateStackHistory[state.currentDefinition] = [state.definition]
        }
    }
    // add to state stack
    if (sameComponent && definitionChanged && !timeTravelling) {
        // add the new definition as the last definition
        const currentIndex = stateStack.findIndex(a => a === oldState.definition)
        stateStack = stateStack.slice(0, currentIndex + 1).concat(state.definition)
        stateStackHistory[state.currentDefinition] = stateStack
    }
    oldState = state
})

document.addEventListener('keydown', e => {

    // 90 - z
    // 89 - y
    if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        const currentIndex = stateStack.findIndex(a => a === state.definition)
        if (currentIndex > 0) {
            const newDefinition = stateStack[currentIndex - 1]
            setState({ ...state, definition: newDefinition })
        }
    }
    if ((e.which === 89 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) || (e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey))) {
        e.preventDefault()
        const currentIndex = stateStack.findIndex(a => a === state.definition)
        if (currentIndex < stateStack.length - 1) {
            const newDefinition = stateStack[currentIndex + 1]
            setState({ ...state, definition: newDefinition })
        }
    }
})