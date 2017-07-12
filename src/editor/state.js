import AppBar from '../../ugnis_components/App Bar.json'
import Avatar from '../../ugnis_components/Avatar.json'
import Badge from '../../ugnis_components/Badge.json'
import Button from '../../ugnis_components/Button.json'
import Paper from '../../ugnis_components/Paper.json'

const definitions = {
    [AppBar.id]: AppBar,
    [Avatar.id]: Avatar,
    [Badge.id]: Badge,
    [Button.id]: Button,
    [Paper.id]: Paper,
}

// state is global because I am lazy, TODO move to an npm module and deglobalize, when writing tests
export let state = {
    leftOpen: true,
    rightOpen: true,
    fullScreen: false,
    editorRightWidth: 425,
    editorLeftWidth: 200,
    subEditorWidth: 375,
    componentEditorPosition: { x: window.innerWidth - 799, y: 50 },
    appIsFrozen: false,
    selectedViewNode: {},
    selectedPipeId: '',
    selectedStateNodeId: '',
    selectedMenu: 'view', // view | state | events
    selectedViewSubMenu: 'props',
    hoveredComponent: '',
    hoveredViewWithoutDrag: '',
    editingTitleNodeId: '',
    viewFoldersClosed: {},
    draggedComponentView: null,
    draggedComponentStateId: null,
    hoveredPipe: null,
    hoveredViewNode: null,
    hoveredEvent: null,
    mousePosition: {},
    eventStack: [],
    definition: definitions[Object.keys(definitions)[0]],
    currentDefinition: Object.keys(definitions)[0],
    definitionList: definitions,
}

let listenerList = []
export function listen(callback){

    listenerList = listenerList.concat(callback)

    return function unlisten(){
        listenerList = listenerList.filter(fn => fn !== callback)
    }
}

export function setState(newState) {
    state = newState
    
    listenerList.forEach((callback)=> callback())

    // // new definition - render
    // if (state.definition !== newState.definition) {
    //     // unselect deleted components and state
    //     if (newState.definition.state[newState.selectedStateNodeId] === undefined) {
    //         newState = { ...newState, selectedStateNodeId: '' }
    //     }
    //     if (newState.selectedViewNode.ref !== undefined && newState.definition[newState.selectedViewNode.ref][newState.selectedViewNode.id] === undefined) {
    //         newState = { ...newState, selectedViewNode: {} }
    //     }


}
