import {state, listen, setState} from './state'

// fetch('/definitions').then(function(response) {
//     return response.json();
// }).then(function(definitions) {
//     setState({
//         ...state,
//         currentDefinitionId: Object.keys(definitions)[0],
//         definitionList: definitions,
//         loading: false,
//     })
// });
//
// let oldState = state
// listen(()=>{
//     const wasEditingName = oldState.editingTitleNodeId === '_rootNode' && state.editingTitleNodeId === ''
//     const notJustLoaded = !oldState.loading
//     const listLenghtChanged = Object.keys(oldState.definitionList).length !== Object.keys(state.definitionList).length
//     const definitionChanged =  oldState.definitionList[state.currentDefinitionId] !== state.definitionList[state.currentDefinitionId]
//     if (wasEditingName) {
//         let newName = state.definitionList[state.currentDefinitionId].vNodeBox['_rootNode'].title
//         fetch('/rename/', { method: 'POST', body: JSON.stringify({ oldId: oldState.definitionList[state.currentDefinitionId].id, newName: newName }), headers: { 'Content-Type': 'application/json' } })
//     }
//     if(notJustLoaded && definitionChanged && oldState.currentDefinitionId === state.currentDefinitionId){
//         fetch('/save/' + state.definitionList[state.currentDefinitionId].id, { method: 'POST', body: JSON.stringify(state.definitionList[state.currentDefinitionId]), headers: { 'Content-Type': 'application/json' } })
//     }
//     if(notJustLoaded && listLenghtChanged){
//         fetch('/new/' + state.definitionList[state.currentDefinitionId].vNodeBox['_rootNode'].title, { method: 'POST', body: JSON.stringify(state.definitionList[state.currentDefinitionId]), headers: { 'Content-Type': 'application/json' } })
//     }
//     oldState = state
// })

import app from '../../ugnis_components/App Bar.json'
import avatar from '../../ugnis_components/Avatar.json'
import badge from '../../ugnis_components/Badge.json'
import button from '../../ugnis_components/Button.json'
import color from '../../ugnis_components/Color picker.json'
import paper from '../../ugnis_components/Paper.json'
import todo from '../../ugnis_components/TODO MVC.json'

const definitions = {
    app,
    avatar,
    badge,
    button,
    color,
    paper,
    todo
}

setState({
    ...state,
    currentDefinitionId: Object.keys(definitions)[0],
    definitionList: definitions,
    loading: false,
})