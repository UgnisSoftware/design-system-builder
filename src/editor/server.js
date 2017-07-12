import {state, listen} from './state'


// rename
// new
// save

let oldState = state
listen(()=>{
    if (oldState.editingTitleNodeId === '_rootNode' && state.editingTitleNodeId === '') {
        let newName = state.definition.vNodeBox['_rootNode'].title
        if (oldState.currentDefinition !== newName && state.definitionList[newName] !== undefined) {
            fetch('/rename/', { method: 'POST', body: JSON.stringify({ oldId: oldState.definition.id, newName: newName }), headers: { 'Content-Type': 'application/json' } })
        }
    }
    if(oldState.definition !== state.definition && oldState.definitionList === state.definitionList){
        fetch('/save/' + state.definition.id, { method: 'POST', body: JSON.stringify(state.definition), headers: { 'Content-Type': 'application/json' } })
    }
    if(oldState.definitionList !== state.definitionList){
        fetch('/new/' + state.definition.vNodeBox['_rootNode'].title, { method: 'POST', body: JSON.stringify(state.definition), headers: { 'Content-Type': 'application/json' } })
    }
    oldState = state
})
