function updateProps(oldVnode, vnode) {
    var key, cur, old, elm = vnode.elm,
        props = vnode.data.liveProps || {};
    for (key in props) {
        cur = props[key];
        old = elm[key];
        if (old !== cur) elm[key] = cur;
    }
}
const livePropsPlugin = {create: updateProps, update: updateProps};
import snabbdom from "snabbdom"
import h from "snabbdom/h"
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/attributes'),
    livePropsPlugin
]);

const uuid = require('node-uuid')
import big from 'big.js';
big.E_POS = 1e+6

import ugnis from './ugnis'

import savedApp from '../ugnis_components/app.json'

editor(savedApp)

function editor(appDefinition){

    //app.vdom.elm.parentNode

    const app = ugnis(appDefinition)

    let node = document.createElement('div')
    document.body.appendChild(node)

    // State
    let state = {
        open: true,
        editorRightWidth: 350,
        editorLeftWidth: 350,
        subEditorWidth: 350,
        appIsFrozen: false,
        selectedViewNode: {},
        selectedEventId: '',
        selectedPipeId: '',
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        activeEvent: '',
        viewFoldersClosed: {},
        definition: app.definition,
    }
    // undo/redo
    let stateStack = [state]
    function setState(newState, pushToStack){
        if(newState === state){
            console.warn('state was mutated, search for a bug')
        }
        // some actions should not be recorded and controlled through undo/redo
        if(pushToStack){
            const currentIndex = stateStack.findIndex((a)=>a===state)
            stateStack = stateStack.slice(0, currentIndex+1).concat(newState);
        } else {
            // overwrite current
            stateStack[stateStack.findIndex((a)=>a===state)] = newState;
        }
        if(state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode ){
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode)
        }
        if(state.definition !== newState.definition){
            // TODO add garbage collection?
            app.render(newState.definition)
        }
        state = newState
        render()
    }
    document.addEventListener('click', (e)=> {
        // clicked outside
        if(state.editingTitleNodeId && !e.target.dataset.istitleeditor){
            setState({...state, editingTitleNodeId: ''})
        }
    })
    document.addEventListener('keydown', (e)=>{
        // 83 - s
        // 90 - z
        // 89 - y
        // 32 - space
        // 13 - enter
        if(e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            // TODO garbage collect
            e.preventDefault();
            fetch('/save', {method: 'POST', body: JSON.stringify(state.definition), headers: {"Content-Type": "application/json"}})
            return false;
        }
        if(e.which == 32 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault()
            FREEZER_CLICKED()
        }
        if(!e.shiftKey && e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            const currentIndex = stateStack.findIndex((a)=>a===state)
            if(currentIndex > 0){
                const newState = stateStack[currentIndex-1]
                if(state.definition !== newState.definition){
                    app.render(newState.definition)
                }
                state = newState
                render()
            }
        }
        if((e.which == 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) || (e.shiftKey && e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))) {
            e.preventDefault();
            const currentIndex = stateStack.findIndex((a)=>a===state)
            if(currentIndex < stateStack.length-1){
                const newState = stateStack[currentIndex+1]
                if(state.definition !== newState.definition){
                    app.render(newState.definition)
                }
                state = newState
                render()
            }
        }
        if(e.which == 13) {
            setState({...state, editingTitleNodeId: ''})
        }
    })

    // Actions
    function ARROW_CLICKED() {
        setState({...state, open: !state.open})
    }
    function WIDTH_DRAGGED(widthName, e) {
        e.preventDefault()
        function resize(e){
            e.preventDefault()
            let newWidth = window.innerWidth - (e.touches? e.touches[0].pageX: e.pageX)
            if(widthName === 'editorLeftWidth'){
                newWidth = e.touches? e.touches[0].pageX: e.pageX
            }
            if(widthName === 'subEditorWidth'){
                newWidth = newWidth - state.editorRightWidth - 10
            }
            // minify if you want it so small
            if(state.open && widthName !== 'subEditorWidth' && newWidth < 180){
                ARROW_CLICKED()
                return false
            }
            if(!state.open && widthName !== 'subEditorWidth' && newWidth > 180){
                ARROW_CLICKED()
                return false
            }
            if(newWidth < 250){
                newWidth = 250
            }
            setState({...state, [widthName]: newWidth})
            return false
        }
        window.addEventListener('mousemove', resize)
        window.addEventListener('touchmove', resize)
        function stopDragging(e){
            e.preventDefault()
            window.removeEventListener('mousemove', resize)
            window.removeEventListener('touchmove', resize)
            window.removeEventListener('mouseup', stopDragging)
            window.removeEventListener('touchend', stopDragging)
            return false
        }
        window.addEventListener('mouseup', stopDragging)
        window.addEventListener('touchend', stopDragging)
        return false
    }
    function FREEZER_CLICKED() {
        setState({...state, appIsFrozen: !state.appIsFrozen})
    }
    function VIEW_FOLDER_CLICKED(nodeId) {
        setState({...state, viewFoldersClosed:{...state.viewFoldersClosed, [nodeId]: !state.viewFoldersClosed[nodeId]}})
    }
    function VIEW_NODE_SELECTED(ref) {
        setState({...state, selectedViewNode:ref})
    }
    function UNSELECT_VIEW_NODE(e) {
        if(e.target === this.elm){
            setState({...state, selectedViewNode:{}})
        }
    }
    function STATE_NODE_SELECTED(nodeId) {
        setState({...state, selectedStateNodeId:nodeId})
    }
    function UNSELECT_STATE_NODE(e) {
        if(e.target === this.elm){
            setState({...state, selectedStateNodeId:'', selectedEventId:''})
        }
    }
    function DELETE_SELECTED_VIEW(nodeRef, parentRef, e) {
        e.stopPropagation()
        if(nodeRef.id === '_rootNode'){
            // immutably remove all nodes except rootNode
            return setState({...state, definition: {
                ...state.definition,
                vNodeBox: {'_rootNode': {...state.definition.vNodeBox['_rootNode'], children: []}},
            }, selectedViewNode: {}}, true)
        }
        setState({...state, definition: {
            ...state.definition,
            [parentRef.ref]: {...state.definition[parentRef.ref], [parentRef.id]: {...state.definition[parentRef.ref][parentRef.id], children:state.definition[parentRef.ref][parentRef.id].children.filter((ref)=>ref.id !== nodeRef.id)}},
        }, selectedViewNode: {}}, true)
    }
    function ADD_NODE(nodeRef, type) {
        const nodeId = nodeRef.id
        const newNodeId = uuid.v4()
        const newStyleId = uuid.v4()
        const newStyle = {
            padding: '10px',
        }
        if(type === 'box') {
            const newNode = {
                title: 'box',
                style: {ref:'style', id:newStyleId},
                children: [],
            }
            return setState({
                ...state,
                selectedViewNode: {ref:'vNodeBox', id: newNodeId},
                definition: nodeRef.ref === 'vNodeBox' ? {
                    ...state.definition,
                    vNodeBox: {...state.definition.vNodeBox, [nodeId]: {...state.definition.vNodeBox[nodeId], children: state.definition.vNodeBox[nodeId].children.concat({ref:'vNodeBox', id:newNodeId})}, [newNodeId]: newNode},
                    style: {...state.definition.style, [newStyleId]: newStyle},
                } : {
                        ...state.definition,
                        [nodeRef.ref]: {...state.definition[nodeRef.ref], [nodeId]: {...state.definition[nodeRef.ref][nodeId], children: state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeBox', id:newNodeId})}},
                        vNodeBox: {...state.definition.vNodeBox, [newNodeId]: newNode},
                        style: {...state.definition.style, [newStyleId]: newStyle},
                    }
            }, true)
        }
        if(type === 'text'){
            const pipeId = uuid.v4()
            const newNode = {
                title: 'text',
                style: {ref:'style', id:newStyleId},
                value: {ref:'pipe', id:pipeId}
            }
            const newPipe = {
                type: 'text',
                value: 'Default Text',
                transformations: []
            }
            return setState({
                ...state,
                selectedViewNode: {ref:'vNodeText', id: newNodeId},
                definition: {
                    ...state.definition,
                    pipe: {...state.definition.pipe, [pipeId]: newPipe},
                    [nodeRef.ref]: {...state.definition[nodeRef.ref], [nodeId]: {...state.definition[nodeRef.ref][nodeId], children: state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeText', id:newNodeId})}},
                    vNodeText: {...state.definition.vNodeText, [newNodeId]: newNode},
                    style: {...state.definition.style, [newStyleId]: newStyle},
                }}, true)
        }
        if(type === 'input') {
            const stateId = uuid.v4()
            const eventId = uuid.v4()
            const mutatorId = uuid.v4()
            const pipeId = uuid.v4()
            const newNode = {
                title: 'input',
                style: {ref:'style', id:newStyleId},
                value: {ref:'pipe', id:pipeId},
                input: {ref:'event', id:eventId}
            }
            const newPipe = {
                type: 'text',
                value: {ref: 'state', id: stateId},
                transformations: []
            }
            const newState = {
                title: 'input value',
                type: 'text',
                ref: stateId,
                defaultValue: 'Default text',
                mutators: [{ ref:'mutator', id:mutatorId}],
            }
            const newMutator = {
                event: { ref: 'event', id:eventId},
                state: { ref: 'state', id:stateId},
                mutation: { ref: 'eventValue'},
            }
            const newEvent = {
                title: 'update input',
                mutators: [
                    { ref: 'mutator', id: mutatorId},
                ]
            }
            return setState({
                ...state,
                selectedViewNode: {ref:'vNodeInput', id: newNodeId},
                definition: {
                    ...state.definition,
                    pipe: {...state.definition.pipe, [pipeId]: newPipe},
                    [nodeRef.ref]: {...state.definition[nodeRef.ref], [nodeId]: {...state.definition[nodeRef.ref][nodeId], children: state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeInput', id:newNodeId})}},
                    vNodeInput: {...state.definition.vNodeInput, [newNodeId]: newNode},
                    style: {...state.definition.style, [newStyleId]: newStyle},
                    nameSpace: {...state.definition.nameSpace, ['_rootNameSpace']: {...state.definition.nameSpace['_rootNameSpace'], children: state.definition.nameSpace['_rootNameSpace'].children.concat({ref:'state', id:stateId})}},
                    state: {...state.definition.state, [stateId]: newState},
                    mutator: {...state.definition.mutator, [mutatorId]: newMutator},
                    event: {...state.definition.event, [eventId]: newEvent},
                    eventValue: {...state.definition.eventValue}
                }}, true)
        }
    }
    function ADD_STATE(namespaceId, type) {
        const newStateId = uuid.v4()
        let newState
        if(type === 'text') {
            newState = {
                title: 'new text',
                ref: newStateId,
                type: 'text',
                defaultValue: 'Default text',
                mutators: [],
            }
        }
        if(type === 'number') {
            newState = {
                title: 'new number',
                ref: newStateId,
                type: 'number',
                defaultValue: 0,
                mutators: [],
            }
        }
        if(type === 'boolean') {
            newState = {
                title: 'new boolean',
                type: 'boolean',
                ref: newStateId,
                defaultValue: true,
                mutators: [],
            }
        }
        if(type === 'table') {
            newState = {
                title: 'new table',
                type: 'table',
                ref: newStateId,
                defaultValue: {},
                mutators: [],
            }
        }
        if(type === 'namespace') {
            newState = {
                title: 'new namespace',
                children: [],
            }
            return setState({...state, definition: {
                ...state.definition,
                nameSpace: {...state.definition.nameSpace, [namespaceId]: {...state.definition.nameSpace[namespaceId], children: state.definition.nameSpace[namespaceId].children.concat({ref:'nameSpace', id:newStateId})}, [newStateId]: newState},
            }}, true)
        }
        setState({...state, definition: {
            ...state.definition,
            nameSpace: {...state.definition.nameSpace, [namespaceId]: {...state.definition.nameSpace[namespaceId], children: state.definition.nameSpace[namespaceId].children.concat({ref:'state', id:newStateId})}},
            state: {...state.definition.state, [newStateId]: newState},
        }}, true)
    }
    function CHANGE_STYLE(styleId, key, e) {
        e.preventDefault()
        // and now I really regret not using immutable or ramda lenses
        setState({...state, definition: {...state.definition, style: {...state.definition.style, [styleId]: {...state.definition.style[styleId], [key]: e.target.value}}}}, true)
    }
    function ADD_DEFAULT_STYLE(styleId, key) {
        setState({...state, definition: {...state.definition, style: {...state.definition.style, [styleId]: {...state.definition.style[styleId], [key]: 'default'}}}}, true)
    }
    function SELECT_VIEW_SUBMENU(newId) {
        setState({...state, selectedViewSubMenu:newId})
    }
    function EDIT_VIEW_NODE_TITLE(nodeId) {
        setState({...state, editingTitleNodeId:nodeId})
    }
    function EDIT_EVENT_TITLE(nodeId) {
        setState({...state, editingTitleNodeId:nodeId})
    }
    function CHANGE_EVENT_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            event: {
                ...state.definition.event,
                [nodeId]: {
                    ...state.definition.event[nodeId],
                    title: e.target.value
                }
            },
        }}, true)
    }
    function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
        e.preventDefault();
        const nodeId = nodeRef.id
        const nodeType = nodeRef.ref
        setState({...state, definition: {
            ...state.definition,
            [nodeType]: {...state.definition[nodeType], [nodeId]: {...state.definition[nodeType][nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_STATE_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            state: {...state.definition.state, [nodeId]: {...state.definition.state[nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_NAMESPACE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            nameSpace: {...state.definition.nameSpace, [nodeId]: {...state.definition.nameSpace[nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e) {
        app.setCurrentState({...app.getCurrentState(), [stateId]: e.target.value})
        render()
    }
    function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId, e) {
        // todo big throws error instead of returning NaN... fix, rewrite or hack
        try {
            if(big(e.target.value).toString() !== app.getCurrentState()[stateId].toString()){
                app.setCurrentState({...app.getCurrentState(), [stateId]: big(e.target.value)})
                render()
            }
        } catch(err) {
        }
    }
    function INCREMENT_CURRENT_STATE_NUMBER_VALUE(stateId) {
        app.setCurrentState({...app.getCurrentState(), [stateId]: big(app.getCurrentState()[stateId]).add(1)})
        render()
    }
    function DECREMENT_CURRENT_STATE_NUMBER_VALUE(stateId) {
        app.setCurrentState({...app.getCurrentState(), [stateId]: big(app.getCurrentState()[stateId]).add(-1)})
        render()
    }
    function SELECT_EVENT(eventId) {
        setState({...state, selectedEventId:eventId})
    }
    function CHANGE_STATIC_VALUE(ref, propertyName, type, e) {
        let value = e.target.value
        if(type === 'number'){
            try {
                value = big(e.target.value)
            } catch(err) {
                return;
            }
        }
        setState({...state, definition:{
            ...state.definition,
            [ref.ref]: {
                ...state.definition[ref.ref],
                [ref.id]: {
                    ...state.definition[ref.ref][ref.id],
                    [propertyName]: value
                }
            }
        }}, true)
    }
    function ADD_EVENT(propertyName) {
        const ref = state.selectedViewNode
        const eventId = uuid.v4();
        setState({...state, definition:{
            ...state.definition,
            [ref.ref]: {
                ...state.definition[ref.ref],
                [ref.id]: {
                    ...state.definition[ref.ref][ref.id],
                    [propertyName]: {ref: 'event', id: eventId}
                }
            },
            event: {
                ...state.definition.event,
                [eventId]: {
                    title: 'On ' + propertyName,
                    mutators: []
                }
            }
        }}, true)
    }
    function ADD_MUTATOR(stateId, eventId) {
        const mutatorId = uuid.v4();
        const pipeId = uuid.v4();
        setState({...state, definition:{
            ...state.definition,
            pipe:{
                ...state.definition.pipe,
                [pipeId]: {
                    type: state.definition.state[stateId].type,
                    value: state.definition.state[stateId].defaultValue,
                    transformations: []
                }
            },
            state: {
                ...state.definition.state,
                [stateId]: {
                    ...state.definition.state[stateId],
                    mutators: state.definition.state[stateId].mutators.concat({
                        ref: 'mutator',
                        id: mutatorId
                    })
                }
            },
            mutator: {
                ...state.definition.mutator,
                [mutatorId]: {
                    event: {
                        ref: "event",
                        id: eventId
                    },
                    state: {
                        ref: "state",
                        id: stateId
                    },
                    mutation: {
                        ref: "pipe",
                        id: pipeId
                    }
                }
            },
            event: {
                ...state.definition.event,
                [eventId]: {
                    ...state.definition.event[eventId],
                    mutators: state.definition.event[eventId].mutators.concat({
                        ref: 'mutator',
                        id: mutatorId
                    })
                }
            }
        }}, true)
    }
    function MOVE_VIEW_NODE(parentRef, position, amount, e) {
        e.preventDefault()
        e.stopPropagation()
        setState({...state, definition:{
            ...state.definition,
            [parentRef.ref]: {
                ...state.definition[parentRef.ref],
                [parentRef.id]: {
                    ...state.definition[parentRef.ref][parentRef.id],
                    children: state.definition[parentRef.ref][parentRef.id].children.map( // functional swap
                        (child,index)=> index === position + amount ?
                            state.definition[parentRef.ref][parentRef.id].children[position]:
                            index === position ?
                                state.definition[parentRef.ref][parentRef.id].children[position + amount]:
                                state.definition[parentRef.ref][parentRef.id].children[index]
                    )
                }
            }
        }}, true)
    }
    function SELECT_PIPE(pipeId) {
        setState({...state, selectedPipeId:pipeId})
    }
    function CHANGE_PIPE_VALUE_TO_STATE(pipeId) {
        if(!state.selectedStateNodeId || state.selectedStateNodeId === state.definition.pipe[pipeId].value.id ){
            return;
        }
        setState({...state, definition: {
            ...state.definition,
            pipe: {
                ...state.definition.pipe,
                [pipeId]: {
                    ...state.definition.pipe[pipeId],
                    value: {ref: 'state', id: state.selectedStateNodeId},
                    transformations: []
                }
            }
        }}, true)
    }
    function ADD_TRANSFORMATION(pipeId, transformation) {
        if(transformation === 'join'){
            const newPipeId = uuid.v4();
            const joinId = uuid.v4();
            setState({...state, definition: {
                ...state.definition,
                join: {
                    ...state.definition.join,
                    [joinId]: {
                        value: {ref: 'pipe', id:newPipeId}
                    }
                },
                pipe: {
                    ...state.definition.pipe,
                    [newPipeId]: {
                        type: 'text',
                        value: 'Default text',
                        transformations: []
                    },
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        transformations: state.definition.pipe[pipeId].transformations.concat({ref: 'join', id:joinId})
                    }
                }
            }}, true)
        }
        if(transformation === 'toUpperCase'){
            const newId = uuid.v4();
            setState({...state, definition: {
                ...state.definition,
                toUpperCase: {
                    ...state.definition.toUpperCase,
                    [newId]: {}
                },
                pipe: {
                    ...state.definition.pipe,
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        transformations: state.definition.pipe[pipeId].transformations.concat({ref: 'toUpperCase', id:newId})
                    }
                }
            }}, true)
        }
        if(transformation === 'toLowerCase'){
            const newId = uuid.v4();
            setState({...state, definition: {
                ...state.definition,
                toLowerCase: {
                    ...state.definition.toLowerCase,
                    [newId]: {}
                },
                pipe: {
                    ...state.definition.pipe,
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        transformations: state.definition.pipe[pipeId].transformations.concat({ref: 'toLowerCase', id:newId})
                    }
                }
            }}, true)
        }
        if(transformation === 'toText'){
            const newId = uuid.v4();
            setState({...state, definition: {
                ...state.definition,
                toText: {
                    ...state.definition.toText,
                    [newId]: {}
                },
                pipe: {
                    ...state.definition.pipe,
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        transformations: state.definition.pipe[pipeId].transformations.concat({ref: 'toText', id:newId})
                    }
                }
            }}, true)
        }
        if(transformation === 'add'){
            const newPipeId = uuid.v4();
            const addId = uuid.v4();
            setState({...state, definition: {
                ...state.definition,
                add: {
                    ...state.definition.add,
                    [addId]: {
                        value: {ref: 'pipe', id:newPipeId}
                    }
                },
                pipe: {
                    ...state.definition.pipe,
                    [newPipeId]: {
                        type: 'number',
                        value: 0,
                        transformations: []
                    },
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        transformations: state.definition.pipe[pipeId].transformations.concat({ref: 'add', id:addId})
                    }
                }
            }}, true)
        }
        if(transformation === 'subtract'){
            const newPipeId = uuid.v4();
            const subtractId = uuid.v4();
            setState({...state, definition: {
                ...state.definition,
                subtract: {
                    ...state.definition.subtract,
                    [subtractId]: {
                        value: {ref: 'pipe', id:newPipeId}
                    }
                },
                pipe: {
                    ...state.definition.pipe,
                    [newPipeId]: {
                        type: 'number',
                        value: 0,
                        transformations: []
                    },
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        transformations: state.definition.pipe[pipeId].transformations.concat({ref: 'subtract', id:subtractId})
                    }
                }
            }}, true)
        }
    }

    // Listen to app and blink every action
    let timer = null
    const eventStack = []
    app.addListener((eventName, data, e, previousState, currentState, mutations)=>{
        eventStack.push({eventName, data, e, previousState, currentState, mutations})
        setState({...state, activeEvent: eventName})
        // yeah, I probably needed some observables too
        if(timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=> {
            setState({...state, activeEvent: ''})
        }, 500)
    })

    // Render
    function render() {
        const currentState = app.getCurrentState()
        const dragComponentLeft = h('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'editorLeftWidth'],
                touchstart: [WIDTH_DRAGGED, 'editorLeftWidth'],
            },
            attrs: {

            },
            style: {
                position: 'absolute',
                right: '0',
                transform: 'translateX(100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: '0',
                cursor: 'col-resize',
            },
        })
        const dragComponentRight = h('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'editorRightWidth'],
                touchstart: [WIDTH_DRAGGED, 'editorRightWidth'],
            },
            attrs: {

            },
            style: {
                position: 'absolute',
                left: '0',
                transform: 'translateX(-100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: '0',
                cursor: 'col-resize',
            },
        })
        const dragSubComponent = h('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'subEditorWidth'],
                touchstart: [WIDTH_DRAGGED, 'subEditorWidth'],
            },
            attrs: {

            },
            style: {
                position: 'absolute',
                left: '2px',
                transform: 'translateX(-100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: 0,
                cursor: 'col-resize',
            },
        })

        function emberEditor(ref, type){
            const pipe = state.definition[ref.ref][ref.id]

            function listTransformations(transformations, transType) {
                return transformations.map((transRef, index)=>{
                    const transformer = state.definition[transRef.ref][transRef.id]
                    // if (transRef.ref === 'equal') {
                    //     return h('div', {}, [
                    //         h('div', {style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0'}}, transType)]),
                    //         emberEditor(transformer.value, type)
                    //     ])
                    // }
                    if (transRef.ref === 'add') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, transType)])
                        ])
                    }
                    if (transRef.ref === 'subtract') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, transType)])
                        ])
                    }
                    // if (transRef.ref === 'branch') {
                    //     if(resolve(transformer.predicate)){
                    //         value = transformValue(value, transformer.then)
                    //     } else {
                    //         value = transformValue(value, transformer.else)
                    //     }
                    // }
                    if (transRef.ref === 'join') {
                        return h('div', {}, [
                            h('div', {style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'text')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, transType)])
                        ])
                    }
                    if (transRef.ref === 'toUpperCase') {
                        return h('div', {}, [
                            h('div', {style: {cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1', color: '#bdbdbd'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'text')]),
                        ])
                    }
                    if (transRef.ref === 'toLowerCase') {
                        return h('div', {}, [
                            h('div', {style: {cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1', color: '#bdbdbd'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'text')]),
                        ])
                    }
                    if (transRef.ref === 'toText') {
                        return h('div', {}, [
                            h('div', {style: {cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1', color: '#bdbdbd'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'text')]),
                        ])
                    }
                })
            }

            function genTransformators(type) {
                if(type === 'text'){
                    return [
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: state.selectedStateNodeId ? '2px solid white' : '2px solid #bdbdbd', color: state.selectedStateNodeId ? 'white' : '#bdbdbd',}, on: {click: [CHANGE_PIPE_VALUE_TO_STATE, ref.id]}}, 'change to state'),
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white'}, on: {click: [ADD_TRANSFORMATION, ref.id, 'join']}}, 'join'),
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white'}, on: {click: [ADD_TRANSFORMATION, ref.id, 'toUpperCase']}}, 'to Upper case'),
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white'}, on: {click: [ADD_TRANSFORMATION, ref.id, 'toLowerCase']}}, 'to Lower case'),
                    ]
                }
                if(type === 'number'){
                    return [
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: state.selectedStateNodeId ? '2px solid white' : '2px solid #bdbdbd', color: state.selectedStateNodeId  ? 'white' : '#bdbdbd',}, on: {click: [CHANGE_PIPE_VALUE_TO_STATE, ref.id]}}, 'change to state'),
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white'}, on: {click: [ADD_TRANSFORMATION, ref.id, 'toText']}}, 'to text'),
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white'}, on: {click: [ADD_TRANSFORMATION, ref.id, 'add']}}, 'add'),
                        h('div', {style: {padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white'}, on: {click: [ADD_TRANSFORMATION, ref.id, 'subtract']}}, 'subtract'),
                    ]
                }
            }
            if (typeof pipe.value === 'string') {
                return h('div', [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
                    h('input', {
                            style: {
                                background: 'none',
                                outline: 'none',
                                padding: '0',
                                margin:  '0',
                                border: 'none',
                                borderRadius: '0',
                                display: 'inline-block',
                                width: '100%',
                                color: 'white',
                                textDecoration: 'underline',
                            },
                            on: {
                                input: [CHANGE_STATIC_VALUE, ref, 'value', 'text'],
                            },
                            liveProps: {
                                value: pipe.value,
                            },
                        }
                    ),
                    h('div', {style: {flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd': type === 'text' ? 'green': 'red'}}, 'text')
                ]),
                    h('div', {style: {paddingLeft: '15px'}}, listTransformations(pipe.transformations, pipe.type)),
                    h('div', state.selectedPipeId === ref.id ? genTransformators('text'): [])
                ])
            }

            if (!isNaN(parseFloat(Number(pipe.value))) && isFinite(Number(pipe.value))) {
                return h('div', [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
                    h('input', {
                            attrs: {type:'number'},
                            style: {
                                background: 'none',
                                outline: 'none',
                                padding: '0',
                                margin:  '0',
                                border: 'none',
                                borderRadius: '0',
                                display: 'inline-block',
                                width: '100%',
                                color: 'white',
                                textDecoration: 'underline',
                            },
                            on: {
                                input: [CHANGE_STATIC_VALUE, ref, 'value', 'number'],
                            },
                            liveProps: {
                                value: Number(pipe.value),
                            },
                        }
                    ),
                    h('div', {style: {flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd': type === 'number' ? 'green': 'red'}}, 'number')
                ]),
                    h('div', {style: {paddingLeft: '15px'}}, listTransformations(pipe.transformations, pipe.type)),
                    h('div', state.selectedPipeId === ref.id ? genTransformators('number'): [])
                ])
            }

            if(pipe.value.ref === 'state'){
                const displState = state.definition[pipe.value.ref][pipe.value.id]
                return h('div', [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
                    h('div', {style: {flex: '1'}},
                        [h('div',{
                                style: { cursor: 'pointer', color: state.selectedStateNodeId === pipe.value.id ? '#eab65c': 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNodeId === pipe.value.id ? '#eab65c': 'white'), borderRadius: '10px', display: 'inline-block'},
                                on: {click: [STATE_NODE_SELECTED, pipe.value.id]}
                            },
                            [displState.title])
                        ]
                    ),
                    h('div', {style: {flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd': displState.type === type ? 'green': 'red'}}, displState.type)
                ]),
                    h('div', {style: {paddingLeft: '15px'}}, listTransformations(pipe.transformations, pipe.type)),
                    h('div', state.selectedPipeId === ref.id ? pipe.transformations.length === 0 ? genTransformators(displState.type): pipe.transformations[pipe.transformations.length-1].ref === 'add' || pipe.transformations[pipe.transformations.length-1].ref === 'subtract'? genTransformators('number') : genTransformators('text'): []) // TODO fix, a hack for demo, type should be last transformation not just text
                ])
            }
        }

        function listNameSpace(stateId) {
            const currentNameSpace = state.definition.nameSpace[stateId]
            function editingNode() {
                return h('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNodeId === stateId ? '#eab65c': 'white',
                        outline: 'none',
                        boxShadow: 'inset 0 -1px 0 0 white',
                        padding: '0',
                        margin:  '0',
                        border: 'none',
                        borderRadius: '0',
                        display: 'inline',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_NAMESPACE_TITLE, stateId],
                    },
                    liveProps: {
                        value: currentNameSpace.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            const closed = state.viewFoldersClosed[stateId] || (state.selectedStateNodeId !== stateId && currentNameSpace.children.length === 0)
            return h('div', {
                    style: {
                        position: 'relative',
                    }
                }, [
                    h('div', [
                        h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-10px'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, stateId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15'}, style: {fill: state.selectedStateNodeId === stateId ? '#eab65c': 'white', transition: 'fill 0.2s'}})]),
                        state.editingTitleNodeId === stateId ?
                            editingNode():
                            h('span', { style: { cursor: 'pointer'}, on: {click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, [h('span', {style: {color: state.selectedStateNodeId === stateId ? '#eab65c': 'white', transition: 'color 0.2s'}}, currentNameSpace.title)]),
                    ]),
                    h('div', {style: { display: closed ? 'none': 'block', paddingLeft: '10px', paddingBottom: '5px', borderLeft: state.selectedStateNodeId === stateId ? '2px solid #eab65c' :'2px solid #bdbdbd', transition: 'border-color 0.2s'}}, [
                        ...currentNameSpace.children.map((ref)=> ref.ref === 'state' ? listState(ref.id): listNameSpace(ref.id)),
                        h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'text']}}, '+ text'),
                        h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'number']}}, '+ number'),
                        //h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'boolean']}}, '+ variant'),
                        //h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'table']}}, '+ table'),
                        h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'namespace']}}, '+ folder'),
                    ]),
                ]
            )
        }
        function listState(stateId) {
            const currentState = state.definition.state[stateId]
            function editingNode() {
                return h('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNodeId === stateId ? '#eab65c': 'white',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '2px 5px',
                        margin: '3px 3px 0 0',
                        border: '2px solid ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#bdbdbd'),
                        borderRadius: '10px',
                        display: 'inline',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_STATE_NODE_TITLE, stateId],
                    },
                    liveProps: {
                        value: currentState.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            return h('div', {
                    style: {
                        cursor: 'pointer',
                        position: 'relative',
                        fontSize: '0.8em',
                    },
                },
                [
                    h('span', {on: {click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, [
                        state.editingTitleNodeId === stateId ?
                            editingNode():
                            h('span', {style: {color: state.selectedStateNodeId === stateId ? '#eab65c': 'white', padding: '2px 5px', margin: '7px 3px 2px 0', border: '2px solid ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#bdbdbd'), borderRadius: '10px', display: 'inline-block', transition: 'all 0.2s'}}, currentState.title),
                    ]),
                    h('span', ': '),
                    (()=> {
                        const noStyleInput = {
                            color: app.getCurrentState()[stateId] != state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)' : 'white',
                            background: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            display: 'inline',
                            border: 'none',
                            maxWidth: '50%',
                        }
                        if(currentState.type === 'text') return h('input', {attrs: {type: 'text'}, liveProps: {value: app.getCurrentState()[stateId]}, style: noStyleInput, on: {input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId]}})
                        if(currentState.type === 'number') return h('span', {style: {position: 'relative'}}, [
                            h('input', {attrs: {type: 'number'}, liveProps: {value: app.getCurrentState()[stateId]}, style: {...noStyleInput, width: 9*app.getCurrentState()[stateId].toString().length + 'px'}, on: {input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId]}}),
                            h('svg', {
                                    attrs: {width: 6, height: 8},
                                    style: { cursor: 'pointer', position: 'absolute', top: '0', right: '-12px', padding: '1px 2px 3px 2px', transform:'rotate(-90deg)'},
                                    on: {
                                        click: [INCREMENT_CURRENT_STATE_NUMBER_VALUE, stateId]
                                    },
                                },
                                [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]),
                            h('svg', {
                                    attrs: {width: 6, height: 8},
                                    style: { cursor: 'pointer', position: 'absolute', bottom: '0', right: '-12px', padding: '3px 2px 1px 2px', transform:'rotate(90deg)'},
                                    on: {
                                        click: [DECREMENT_CURRENT_STATE_NUMBER_VALUE, stateId]
                                    },
                                },
                                [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]),
                        ])
                        if(currentState.type === 'table') {
                            const table = app.getCurrentState()[stateId];
                            return h('div', {
                                    style: {
                                        marginTop: '3px',
                                        background: '#828183',
                                        width: '100%',
                                    }
                                },[
                                    h('div', {style: {display: 'flex'}},  Object.keys(currentState.definition).map(key =>
                                            h('div', {style: {flex: '1', padding: '2px 5px', borderBottom: '2px solid white'}}, key)
                                        )
                                    ),
                                    ...Object.keys(table).map(id =>
                                        h('div', {style: {display: 'flex'}}, Object.keys(table[id]).map(key =>
                                            h('div', {style: {flex: '1', padding: '2px 5px'}}, table[id][key])
                                        ))
                                    )
                                ]
                            )
                        }
                    })(),
                    ...currentState.mutators.map(ref =>
                        h('div', {
                                style: {color: state.activeEvent === state.definition.mutator[ref.id].event.id ? '#5bcc5b': 'white', transition: 'all 0.2s', boxShadow: state.selectedEventId === state.definition.mutator[ref.id].event.id ? '#5bcc5b 5px 0 0px 0px inset': 'none', padding: '0 0 0 7px'},
                                on: {
                                    click: [SELECT_EVENT, state.definition.mutator[ref.id].event.id],
                                    dblclick: [EDIT_EVENT_TITLE, state.definition.mutator[ref.id].event.id]
                                }
                            },
                            [
                                h('span', [
                                        '• ',
                                        state.editingTitleNodeId === state.definition.mutator[ref.id].event.id ?
                                            h('input', {
                                                style: {
                                                    background: 'none',
                                                    color: 'white',
                                                    outline: 'none',
                                                    boxShadow: 'inset 0 -1px 0 0 white',
                                                    padding: '0',
                                                    margin:  '0',
                                                    border: 'none',
                                                    borderRadius: '0',
                                                    display: 'inline',
                                                    font: 'inherit'
                                                },
                                                on: {
                                                    input: [CHANGE_EVENT_TITLE, state.definition.mutator[ref.id].event.id],
                                                },
                                                liveProps: {
                                                    value: state.definition.event[state.definition.mutator[ref.id].event.id].title,
                                                },
                                                attrs: {
                                                    autofocus: true,
                                                    'data-istitleeditor': true
                                                }
                                            })
                                            : state.definition.event[state.definition.mutator[ref.id].event.id].title
                                    ]
                                ),
                                state.selectedEventId === state.definition.mutator[ref.id].event.id ? h('div', {style: {marginLeft: '10px'}}, [emberEditor(state.definition.mutator[ref.id].mutation, currentState.type)]): h('div')
                            ])
                    ),
                    state.selectedStateNodeId === stateId ?
                        h('div', Object.keys(state.definition.event).filter((eventId)=> !currentState.mutators.map((ref)=> state.definition[ref.ref][ref.id].event.id).includes(eventId)).map((eventId)=>
                            h('div', {style: {display: 'inline-block', border: '3px solid #5bcc5b', borderRadius: '5px', cursor: 'pointer', padding: '5px', margin: '10px'}, on: {click: [ADD_MUTATOR, stateId, eventId]}}, 'React to: ' + state.definition.event[eventId].title))
                        ):
                        h('div')
                ]
            )
        }

        const stateComponent = h('div', {style: {overflow: 'auto', flex: '1', padding: '6px 15px'}, on: {click: [UNSELECT_STATE_NODE]}}, [listNameSpace('_rootNameSpace')])

        function listBoxNode(nodeRef, parentRef, position) {
            const nodeId = nodeRef.id
            const parentId = parentRef.id
            const node = state.definition.vNodeBox[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef],
                    },
                    liveProps: {
                        value: node.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            const closed = state.viewFoldersClosed[nodeId]
            return h('div', {
                    style: {
                        position: 'relative',
                    }
                }, [
                    h('div', {style: {display: 'flex', alignItems: 'center'}}, [
                        h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, nodeId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15'}, style: {fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'fill 0.2s'}})]),
                        h('svg', {
                                attrs: {width: 14, height: 14},
                                style: { cursor: 'pointer', padding: '0 5px 0 0'},
                                on: {click: [VIEW_NODE_SELECTED, nodeRef]}
                            },
                            [
                                h('rect', {attrs: {x: 1, y: 1, width: 12, height: 12, fill: 'none', stroke: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', 'stroke-width': '2'}}),
                            ]),
                        state.editingTitleNodeId === nodeId ?
                            editingNode():
                            h('span', { style: {flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s'}, on: {click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}}, node.title),
                    ]),
                    h('div', {style: { display: closed ? 'none': 'block', marginLeft: '7px', paddingLeft: '10px', borderLeft: state.selectedViewNode.id === nodeId ? '2px solid #53B2ED' : '2px solid #bdbdbd', transition: 'border-color 0.2s'}}, [
                        ...node.children.map((ref, index)=>{
                            if(ref.ref === 'vNodeText') return listTextNode(ref, nodeRef, index)
                            if(ref.ref === 'vNodeBox') return listBoxNode(ref, nodeRef, index)
                            if(ref.ref === 'vNodeInput') return listInputNode(ref, nodeRef, index)
                            if(ref.ref === 'vNodeList') return listListNode(ref, nodeRef, index)
                        }),
                        h('span', {style: {display: state.selectedViewNode.id === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeRef, 'box']}}, '+ box'),
                        h('span', {style: {display: state.selectedViewNode.id === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeRef, 'text']}}, '+ text'),
                        h('span', {style: {display: state.selectedViewNode.id === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeRef, 'input']}}, '+ input'),
                    ]),
                    position > 0 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform:'rotate(-90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    parentId && position < state.definition[parentRef.ref][parentId].children.length-1 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform:'rotate(90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    h('div', {style: {cursor: 'pointer', display: state.selectedViewNode.id === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeRef, parentRef]}}, 'x'),
                ]
            )
        }
        function listTextNode(nodeRef, parentRef, position) {
            const nodeId = nodeRef.id
            const parentId = parentRef.id
            const node = state.definition.vNodeText[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef],
                    },
                    liveProps: {
                        value: node.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            return h('div', {
                    style: {
                        cursor: 'pointer',
                        position: 'relative'
                    },
                    on: {click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}
                }, [
                    h('svg', {
                            attrs: {viewBox: '0 0 300 300', width: 14, height: 14},
                            style: { cursor: 'pointer', padding: '0 7px 0 0'},
                        },
                        [
                            h('path', {attrs: {d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white'}})
                        ]),
                    state.editingTitleNodeId === nodeId ?
                        editingNode():
                        h('span', {style: {color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s'}}, node.title),
                    position > 0 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform:'rotate(-90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    position < state.definition[parentRef.ref][parentId].children.length-1 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform:'rotate(90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    h('div', {style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeRef, parentRef]}}, 'x')
                ]
            )
        }
        function listInputNode(nodeRef, parentRef, position) {
            const nodeId = nodeRef.id
            const parentId = parentRef.id
            const node = state.definition.vNodeInput[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef],
                    },
                    liveProps: {
                        value: node.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            return h('div', {
                    style: {
                        cursor: 'pointer',
                        position: 'relative'
                    },
                    on: {click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}
                }, [
                    h('svg', {
                            attrs: {viewBox: '0 0 16 16', width: 14, height: 14},
                            style: { cursor: 'pointer', padding: '0 7px 0 0'},
                        },
                        [
                            h('path', {attrs: {d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white'}}),
                            h('path', {attrs: {d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white'}}),
                            h('path', {attrs: {d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white'}}),
                            h('path', {attrs: {d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white'}}),
                        ]),
                    state.editingTitleNodeId === nodeId ?
                        editingNode():
                        h('span', {style: {color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s'}}, node.title),
                    position > 0 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform:'rotate(-90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    position < state.definition[parentRef.ref][parentId].children.length-1 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform:'rotate(90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    h('div', {style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeRef, parentRef]}}, 'x')
                ]
            )
        }

        function listListNode(nodeRef, parentRef, position) {
            const nodeId = nodeRef.id
            const parentId = parentRef.id
            const node = state.definition.vNodeList[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef],
                    },
                    liveProps: {
                        value: node.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            const closed = state.viewFoldersClosed[nodeId]
            return h('div', {
                    style: {
                        position: 'relative',
                    }
                }, [
                    h('div', {style: {display: 'flex', alignItems: 'center'}}, [
                        h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, nodeId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15'}, style: {fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'fill 0.2s'}})]),
                        h('svg', {
                                attrs: {width: 14, height: 14},
                                style: { cursor: 'pointer', padding: '0 5px 0 0'},
                                on: {click: [VIEW_NODE_SELECTED, nodeRef]}
                            },
                            [
                                h('circle', {attrs: {r: 2, cx: 2, cy: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white',}}),
                                h('rect', {attrs: {x: 6, y: 1, width: 10, height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white',}}),
                                h('circle', {attrs: {r: 2, cx: 2, cy: 7, fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white',}}),
                                h('rect', {attrs: {x: 6, y: 6, width: 10, height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white',}}),
                                h('circle', {attrs: {r: 2, cx: 2, cy: 12, fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white',}}),
                                h('rect', {attrs: {x: 6, y: 11, width: 10, height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white',}}),
                            ]
                        ),
                        state.editingTitleNodeId === nodeId ?
                            editingNode():
                            h('span', { style: {flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s'}, on: {click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}}, node.title),
                    ]),
                    h('div', {style: { display: closed ? 'none': 'block', marginLeft: '7px', paddingLeft: '10px', borderLeft: state.selectedViewNode.id === nodeId ? '2px solid #53B2ED' : '2px solid #bdbdbd', transition: 'border-color 0.2s'}}, [
                        ...node.children.map((ref, index)=>{
                            if(ref.ref === 'vNodeText') return listTextNode(ref, nodeRef, index)
                            if(ref.ref === 'vNodeBox') return listBoxNode(ref, nodeRef, index)
                            if(ref.ref === 'vNodeInput') return listInputNode(ref, nodeRef, index)
                            if(ref.ref === 'vNodeList') return listListNode(ref, nodeRef, index)
                        }),
                        h('span', {style: {display: state.selectedViewNode.id === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeRef, 'box']}}, '+ box'),
                        h('span', {style: {display: state.selectedViewNode.id === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeRef, 'text']}}, '+ text'),
                        h('span', {style: {display: state.selectedViewNode.id === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeRef, 'input']}}, '+ input'),
                    ]),
                    position > 0 ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform:'rotate(-90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    parentId && position < (state.definition[parentRef.ref][parentId].children.length-1) ? h('svg', {
                                attrs: {width: 6, height: 8},
                                style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform:'rotate(90deg)'},
                                on: {
                                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                                },
                            },
                            [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]):
                        h('span'),
                    h('div', {style: {display: state.selectedViewNode.id === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeRef, parentRef]}}, 'x'),
                ]
            )
        }

        const propsComponent = h('div', {
            style: {
                background: state.selectedViewSubMenu === 'props' ? '#4d4d4d': '#3d3d3d',
                padding: '12px 15px 8px',
                position: 'absolute',
                top: '0',
                left: '6px',
                zIndex: state.selectedViewSubMenu === 'props' ? '500': '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'props']
            }
        }, 'props')
        const styleComponent = h('div', {
            style: {
                background: state.selectedViewSubMenu === 'style' ? '#4d4d4d': '#3d3d3d',
                padding: '12px 15px 8px',
                position: 'absolute',
                top: '0',
                left: '91px',
                zIndex: state.selectedViewSubMenu === 'style' ? '500': '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'style']
            }
        }, 'style')
        const eventsComponent = h('div', {
            style: {
                background: state.selectedViewSubMenu === 'events' ? '#4d4d4d': '#3d3d3d',
                padding: '12px 15px 8px',
                position: 'absolute',
                top: '0',
                left: '165px',
                zIndex: state.selectedViewSubMenu === 'events' ? '500': '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'events']
            }
        }, 'events')
        const unselectComponent = h('div', {
            style: {
                background: '#4d4d4d',
                padding: '15px 23px 5px',
                position: 'absolute',
                top: '0',
                right: '16px',
                zIndex: '100',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [UNSELECT_VIEW_NODE]
            }
        }, 'x')

        function generateEditNodeComponent() {
            const styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'right', 'position', 'overflow', 'height', 'width', 'font', 'font', 'margin', 'padding', 'userSelect']
            const selectedNode = state.definition[state.selectedViewNode.ref][state.selectedViewNode.id]
            const selectedStyle = state.definition.style[selectedNode.style.id]
            const styleEditorComponent = h('div', {style: {}},
                Object.keys(selectedStyle).map((key)=>h('div', [h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color:  'white',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 white',
                        display: 'inline-block',
                        width: '160px',
                        margin: '10px',
                    },
                    props: {value: selectedStyle[key]},
                    on: {input: [CHANGE_STYLE, selectedNode.style.id, key]}}),
                    h('span', key)]))
            )
            const addStyleComponent = h('div', {style: {}},
                styles
                    .filter((key)=>!Object.keys(selectedStyle).includes(key))
                    .map((key)=>h('div', {on: {click: [ADD_DEFAULT_STYLE, selectedNode.style.id, key]},style:{display: 'inline-block', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}}, '+ ' + key))
            )
            function generatePropsMenu() {
                if(state.selectedViewNode.ref === 'vNodeBox'){
                    return h('div', {style: {textAlign: 'center', marginTop: '100px', color: '#bdbdbd' }}, 'Component has no props')
                }
                if(state.selectedViewNode.ref === 'vNodeText'){
                    return h('div', {style: {paddingTop: '20px'}}, [
                        h('div', {style: {display:'flex', alignItems: 'center', background: '#676767', padding: '5px 10px', marginBottom: '10px'}}, [
                            h('span', {style: {flex: '1'}}, 'text value'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'text')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'text')])
                    ])
                }
                if(state.selectedViewNode.ref === 'vNodeInput'){
                    return h('div', {style: {paddingTop: '20px'}}, [
                        h('div', {style: {display:'flex', alignItems: 'center', background: '#676767', padding: '5px 10px', marginBottom: '10px'}}, [
                            h('span', {style: {flex: '1'}}, 'input value'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'text')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'text')])
                    ])
                }
                if(state.selectedViewNode.ref === 'vNodeList'){
                    return h('div', {style: {textAlign: 'center', marginTop: '100px', color: '#bdbdbd' }}, 'TODO ADD PROPS')
                }
            }
            const propsSubmenuComponent = h('div', [generatePropsMenu()])
            const styleSubmenuComponent = h('div', [styleEditorComponent, addStyleComponent])
            let availableEvents = [
                {
                    description: 'on click',
                    propertyName: 'click'
                },
                {
                    description: 'double clicked',
                    propertyName: 'dblclick'
                },
                {
                    description: 'mouse over',
                    propertyName: 'mouseover'
                },
                {
                    description: 'mouse out',
                    propertyName: 'mouseout'
                },
            ]
            if(state.selectedViewNode.ref === 'vNodeInput'){
                availableEvents = availableEvents.concat([
                    {
                        description: 'input',
                        propertyName: 'input'
                    },
                    {
                        description: 'focus',
                        propertyName: 'focus'
                    },
                    {
                        description: 'blur',
                        propertyName: 'blur'
                    },
                ])
            }
            const currentEvents = availableEvents.filter((event)=>selectedNode[event.propertyName])
            const eventsLeft = availableEvents.filter((event)=>!selectedNode[event.propertyName])
            const eventsSubmenuComponent = h('div', { style: {paddingTop: '20px'}}, eventsLeft.map((event)=>
                h('div', {style: {display: 'inline-block', border: '3px solid #5bcc5b', borderRadius: '5px', cursor: 'pointer', padding: '5px', margin: '10px'}, on:{click: [ADD_EVENT, event.propertyName]}}, '+ ' + event.description),
            ).concat(currentEvents.length ?
                currentEvents.map((event)=>
                    h('div', [
                        h('div', {style: {background: '#676767', padding: '5px 10px'}}, event.description),
                        h('div',
                            {
                                style:
                                    {color: state.activeEvent === selectedNode[event.propertyName].id ? '#5bcc5b': 'white', transition: 'color 0.2s', fontSize: '0.8em', cursor: 'pointer', padding: '5px 10px', boxShadow: state.selectedEventId === selectedNode[event.propertyName].id ? '#5bcc5b 5px 0 0px 0px inset': 'none'},
                                on: {
                                    click: [SELECT_EVENT, selectedNode[event.propertyName].id],
                                    dblclick: [EDIT_EVENT_TITLE, selectedNode[event.propertyName].id]
                                }
                            }, [
                                h('span', {}, [
                                    '• ',
                                    state.editingTitleNodeId === selectedNode[event.propertyName].id ?
                                        h('input', {
                                            style: {
                                                background: 'none',
                                                color: 'white',
                                                outline: 'none',
                                                boxShadow: 'inset 0 -1px 0 0 white',
                                                padding: '0',
                                                margin:  '0',
                                                border: 'none',
                                                borderRadius: '0',
                                                display: 'inline',
                                                font: 'inherit'
                                            },
                                            on: {
                                                input: [CHANGE_EVENT_TITLE, selectedNode[event.propertyName].id],
                                            },
                                            liveProps: {
                                                value: state.definition.event[selectedNode[event.propertyName].id].title,
                                            },
                                            attrs: {
                                                autofocus: true,
                                                'data-istitleeditor': true
                                            }
                                        })
                                        : state.definition.event[selectedNode[event.propertyName].id].title]
                                )
                            ]
                        )
                    ])) :
                []))
            return h('div', {
                style: {
                    position: 'absolute',
                    left: '-8px',
                    transform: 'translate(-100%, 0)',
                    marginRight: '8px',
                    bottom: '6px',
                    height: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }, [
                h('div', {style: {flex: '1', maxHeight: '43px', minHeight: '43px', position: 'relative', marginTop: '6px'}}, [eventsComponent, styleComponent, propsComponent, unselectComponent]),
                h('div', { style: {flex: '1', overflow: 'auto', background: '#4d4d4d', borderRadius: '10px', width: state.subEditorWidth + 'px', border: '3px solid #222'}},[
                    dragSubComponent,
                    state.selectedViewSubMenu === 'props' ? propsSubmenuComponent:
                        state.selectedViewSubMenu === 'style' ? styleSubmenuComponent:
                            state.selectedViewSubMenu === 'events' ? eventsSubmenuComponent:
                                h('span', 'Error, no such menu')
                ])
            ])
        }

        const viewComponent = h('div', {style: {overflow: 'auto', position: 'relative', flex: '1', borderTop: '3px solid #222', padding: '6px 8px'}, on: {click: [UNSELECT_VIEW_NODE]}}, [
            listBoxNode({ref: 'vNodeBox', id:'_rootNode'}, {}),
        ])

        const rightComponent =
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: '0',
                    right: '0',
                    color: 'white',
                    height: '100%',
                    font: "300 1.2em 'Open Sans'",
                    lineHeight: '1.2em',
                    width: state.editorRightWidth + 'px',
                    background: '#4d4d4d',
                    boxSizing: "border-box",
                    borderLeft: '3px solid #222',
                    transition: '0.5s transform',
                    transform: state.open ? 'translateZ(0) translateX(0%)': 'translateZ(0) translateX(100%)',
                    userSelect: 'none',
                },
            }, [
                dragComponentRight,
                stateComponent,
                viewComponent,
                state.selectedViewNode.ref ? generateEditNodeComponent(): h('span')
            ])


        const topComponent = h('div', {
            style: {
                flex: '1 auto',
                height: '75px',
                maxHeight: '75px',
                minHeight: '75px',
                background: '#222',
                display:'flex'
            }
        }, [
            h('a', {style: {flex: '0 auto', width: '190px', textDecoration: 'inherit', userSelect: 'none'}, attrs: {href:'/'}}, [
                h('img',{style: { margin: '7px -2px -3px 5px', display: 'inline-block'}, attrs: {src: '/images/logo256x256.png', height: '57'}}),
                h('span',{style: { fontSize:'44px', fontFamily: "'Comfortaa', sans-serif", verticalAlign: 'bottom', color: '#fff'}}, 'ugnis')
            ]),
        ])
        const leftComponent = h('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '0',
                left: '0',
                height: '100%',
                color: 'white',
                font: "300 1.2em 'Open Sans'",
                lineHeight: '1.2em',
                width: state.editorLeftWidth + 'px',
                background: '#4d4d4d',
                boxSizing: "border-box",
                borderRight: '3px solid #222',
                transition: '0.5s transform',
                transform: state.open ? 'translateZ(0) translateX(0%)': 'translateZ(0) translateX(-100%)',
                userSelect: 'none',
            },
        }, [
            dragComponentLeft,
            h('div', {
                on: {
                    click: FREEZER_CLICKED
                },
                style: {
                    flex: '0 auto',
                    padding: '10px',
                    textAlign: 'center',
                    background: '#333',
                    cursor: 'pointer',
                },
            }, [
                h('span', {style: { padding: '15px 15px 10px 15px', color: state.appIsFrozen ? 'rgb(91, 204, 91)' : 'rgb(204, 91, 91)'}}, state.appIsFrozen ? '►' : '❚❚'),
            ]),
            h('div', {
                on: {
                    click: FREEZER_CLICKED
                },
                style: {
                    flex: '1 auto',
                    padding: '10px',
                    overflow: 'auto'
                },
            },
                eventStack.map((a)=>a).reverse().map(event =>
                    h('div', {style: { padding: '5px', color: '#ffffff'}}, [
                        state.definition.event[event.eventName].title,
                        h('div', Object.keys(event.mutations).map(stateId => state.definition.state[stateId].title + ': ' + event.mutations[stateId].toString()))
                    ]
                ))
            )
        ])
        const renderViewComponent = h('div', {
            style: {
                flex: '1 auto',
                background: `
                    radial-gradient(black 5%, transparent 16%) 0 0,
                    radial-gradient(black 5%, transparent 16%) 8px 8px,
                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 0 1px,
                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 8px 9px`,
                backgroundColor:'#333',
                backgroundSize:'16px 16px',
                transform: 'translateZ(0)',
                display:'relative',
                overflow: 'auto',
            },
        }, [
            h('div', {style: (()=>{
                const desiredWidth = 1920
                const desiredHeight = 1080
                const topMenuHeight = 75
                const widthLeft = window.innerWidth - (state.editorLeftWidth + state.editorRightWidth)
                const heightLeft = window.innerHeight - topMenuHeight
                let scaleX = widthLeft < desiredWidth ? widthLeft/desiredWidth: 1
                let scaleY = heightLeft < desiredHeight ? heightLeft/desiredHeight: 1
                if(scaleX > scaleY) {
                    scaleX = scaleY
                } else {
                    scaleY = scaleX
                }
                return {
                    width: desiredWidth +'px',
                    height: desiredHeight + 'px',
                    background: '#ffffff',
                    transform: 'translateZ(0) scale('+ scaleX + ','+ scaleY +')',
                    overflow: 'auto',
                    position: 'absolute',
                    top: (heightLeft-desiredHeight)/2 + 'px',
                    left: (widthLeft-desiredWidth)/2+state.editorLeftWidth + 'px',
                }
            })()}, [app.vdom])
        ])
        const mainRowComponent = h('div', {
            style: {
                display: 'flex',
                flex: '1',
                position: 'relative',
                transform: 'translateZ(0)',
            },
        }, [
            renderViewComponent,
            leftComponent,
            rightComponent
        ])
        const vnode = h('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '0',
                right: '0',
                width: '100vw',
                height: '100vh',
            },
        }, [
            topComponent,
            mainRowComponent,
        ])

        node = patch(node, vnode)
    }

    render()
}