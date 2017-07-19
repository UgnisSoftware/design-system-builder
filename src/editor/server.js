import {state, listen, setState} from './state'

fetch('/definitions').then(function(response) {
    return response.json();
}).then(function(definitions) {
    setState({
        ...state,
        definition: definitions[Object.keys(definitions)[0]],
        currentDefinitionId: Object.keys(definitions)[0],
        definitionList: definitions,
    })
});

let oldState = state
listen(()=>{
    if (oldState.editingTitleNodeId === '_rootNode' && state.editingTitleNodeId === '') {
        let newName = state.definition.vNodeBox['_rootNode'].title
        fetch('/rename/', { method: 'POST', body: JSON.stringify({ oldId: oldState.definition.id, newName: newName }), headers: { 'Content-Type': 'application/json' } })
    }
    if(oldState.definition !== null && oldState.definition !== state.definition && oldState.currentDefinitionId === state.currentDefinitionId  && oldState.definitionList === state.definitionList){
        fetch('/save/' + state.definition.id, { method: 'POST', body: JSON.stringify(state.definition), headers: { 'Content-Type': 'application/json' } })
    }
    if(oldState.definitionList !== null && oldState.definitionList !== state.definitionList){
        fetch('/new/' + state.definition.vNodeBox['_rootNode'].title, { method: 'POST', body: JSON.stringify(state.definition), headers: { 'Content-Type': 'application/json' } })
    }
    oldState = state
})
