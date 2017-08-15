export let state = {
    loading: true,
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
    selectedStateNode: {},
    selectedMenu: 'view', // view | state | events
    selectedViewSubMenu: 'props',
    hoveredComponent: '',
    hoveredViewWithoutDrag: '',
    editingTitleNodeId: '',
    viewFoldersClosed: {},
    draggedComponentView: null,
    draggedComponentState: {},
    hoveredPipe: null,
    hoveredViewNode: null,
    hoveredEvent: null,
    mousePosition: {},
    eventStack: [],
    currentDefinitionId: '',
    definitionList: {},
}

let listenerList = []
export function listen(callback){

    listenerList = listenerList.concat(callback)

    return function unlisten(){
        listenerList = listenerList.filter(fn => fn !== callback)
    }
}

export function setState(newState) {
    console.log(newState)
    state = newState
    
    listenerList.forEach((callback)=> callback())
}
