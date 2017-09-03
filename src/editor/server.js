import { state, listen, setState } from 'lape'
import { createDefaultState } from './events'

fetch('/definitions.json')
    .then(function(response) {
        return response.json()
    })
    .then(function(definitions) {
        const currentId = Object.keys(definitions)[0]
        setState({
            ...state,
            currentDefinitionId: currentId,
            eventStack: { [currentId]: [] },
            definitionList: definitions,
            componentState: createDefaultState(definitions[currentId]),
            loading: false,
        })
    })

listen((state, oldState) => {
    const wasEditingName = oldState.editingTitleNodeId === '_rootNode' && state.editingTitleNodeId === ''
    const notJustLoaded = !oldState.loading
    const listLenghtChanged = Object.keys(oldState.definitionList).length !== Object.keys(state.definitionList).length
    const definitionChanged = oldState.definitionList[state.currentDefinitionId] !== state.definitionList[state.currentDefinitionId]
    if (wasEditingName) {
        let newName = state.definitionList[state.currentDefinitionId].vNodeBox['_rootNode'].title
        fetch('/rename/', {
            method: 'POST',
            body: JSON.stringify({ oldId: oldState.definitionList[state.currentDefinitionId].id, newName: newName }),
            headers: { 'Content-Type': 'application/json' },
        })
    }
    if (notJustLoaded && definitionChanged && oldState.currentDefinitionId === state.currentDefinitionId) {
        fetch('/save/' + state.definitionList[state.currentDefinitionId].id, {
            method: 'POST',
            body: JSON.stringify(state.definitionList[state.currentDefinitionId]),
            headers: { 'Content-Type': 'application/json' },
        })
    }
    if (notJustLoaded && listLenghtChanged) {
        fetch('/new/' + state.definitionList[state.currentDefinitionId].vNodeBox['_rootNode'].title, {
            method: 'POST',
            body: JSON.stringify(state.definitionList[state.currentDefinitionId]),
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
