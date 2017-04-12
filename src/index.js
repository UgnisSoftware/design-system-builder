function updateProps(oldVnode, vnode) {
    let key, cur, old, elm = vnode.elm,
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

function uuid(){return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/[10]/g,function(){return(0|Math.random()*16).toString(16)})}
import big from '../node_modules/big.js'
big.E_POS = 1e+6

import ugnis from './ugnis'
import savedApp from '../ugnis_components/app.json'

const attachFastClick = require('fastclick')
attachFastClick(document.body)

const version = '0.0.28v'
editor(savedApp)

function editor(appDefinition){

    const savedDefinition = JSON.parse(localStorage.getItem('app_key_' + version))
    const app = ugnis(savedDefinition || appDefinition)

    let node = document.createElement('div')
    document.body.appendChild(node)

    // State
    let state = {
        leftOpen: true,
        rightOpen: true,
        fullScreen: false,
        editorRightWidth: 350,
        editorLeftWidth: 350,
        subEditorWidth: 350,
        appIsFrozen: false,
        selectedViewNode: {},
        selectedPipeId: '',
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        viewFoldersClosed: {},
        draggedComponent: null,
        mousePosition: {},
        eventStack: [],
        definition: savedDefinition || app.definition,
    }
    // undo/redo
    let stateStack = [state.definition]
    let currentAnimationFrameRequest = null;
    function setState(newState){
        if(newState === state){
            console.warn('state was mutated, search for a bug')
        }
        if(state.definition !== newState.definition){
            // unselect deleted components and state
            if(newState.definition.state[newState.selectedStateNodeId] === undefined){
                newState = {...newState, selectedStateNodeId: ''}
            }
            if(newState.selectedViewNode.ref !== undefined && newState.definition[newState.selectedViewNode.ref][newState.selectedViewNode.id] === undefined){
                newState = {...newState, selectedViewNode: {}}
            }
            // undo/redo then render then save
            const currentIndex = stateStack.findIndex((a)=>a===state.definition)
            stateStack = stateStack.slice(0, currentIndex+1).concat(newState.definition);
            // TODO add garbage collection?
            app.render(newState.definition)
            setTimeout(()=>localStorage.setItem('app_key_'+version, JSON.stringify(newState.definition)), 0);
        }
        if(state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode ){
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode)
        }
        if(newState.editingTitleNodeId && state.editingTitleNodeId !== newState.editingTitleNodeId){
            // que auto focus
            setTimeout(()=> {
                const node = document.querySelectorAll('[data-istitleeditor]')[0]
                if(node){
                    node.focus()
                }
            }, 0)
        }
        state = newState
        if(!currentAnimationFrameRequest){
            window.requestAnimationFrame(render)
        }
    }
    document.addEventListener('click', (e)=> {
        // clicked outside
        if(state.editingTitleNodeId && !e.target.dataset.istitleeditor){
            setState({...state, editingTitleNodeId: ''})
        }
    })
    window.addEventListener("resize", function() {
        render()
    }, false)
    window.addEventListener("orientationchange", function() {
        render()
    }, false)
    document.addEventListener('keydown', (e)=>{
        // 83 - s
        // 90 - z
        // 89 - y
        // 32 - space
        // 13 - enter
        // 27 - escape
        if(e.which === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            // TODO garbage collect
            e.preventDefault();
            fetch('/save', {method: 'POST', body: JSON.stringify(state.definition), headers: {"Content-Type": "application/json"}})
            return false;
        }
        if(e.which === 32 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault()
            FREEZER_CLICKED()
        }
        if(!e.shiftKey && e.which === 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            const currentIndex = stateStack.findIndex((a)=>a===state.definition)
            if(currentIndex > 0){
                const newDefinition = stateStack[currentIndex-1]
                app.render(newDefinition)
                state = {...state, definition: newDefinition}
                render()
            }
        }
        if((e.which === 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) || (e.shiftKey && e.which === 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))) {
            e.preventDefault();
            const currentIndex = stateStack.findIndex((a)=>a===state.definition)
            if(currentIndex < stateStack.length-1){
                const newDefinition = stateStack[currentIndex+1]
                app.render(newDefinition)
                state = {...state, definition: newDefinition}
                render()
            }
        }
        if(e.which === 13) {
            setState({...state, editingTitleNodeId: ''})
        }
        if(e.which === 27) {
            FULL_SCREEN_CLICKED(false)
        }
    })

    // Listen to app
    app.addListener((eventId, data, e, previousState, currentState, mutations)=>{
        setState({...state, eventStack: state.eventStack.concat({eventId, data, e, previousState, currentState, mutations})})
    })

    // Actions
    function VIEW_DRAGGED(nodeRef, e) {
        e.preventDefault()
        const initialX = e.touches? e.touches[0].pageX: e.pageX
        const initialY = e.touches? e.touches[0].pageY: e.pageY

        function drag(e){
            e.preventDefault()
            const x = e.touches? e.touches[0].pageX: e.pageX
            const y = e.touches? e.touches[0].pageY: e.pageY
            if(!state.draggedComponent){
                if(Math.abs(initialY-y) > 3){
                    setState({...state, draggedComponent: nodeRef, mousePosition: {x, y}})
                }
            } else {
                setState({...state, mousePosition: {x, y}})
            }
            return false
        }
        window.addEventListener('mousemove', drag)
        window.addEventListener('touchmove', drag)
        function stopDragging(e){
            e.preventDefault()
            window.removeEventListener('mousemove', drag)
            window.removeEventListener('touchmove', drag)
            window.removeEventListener('mouseup', stopDragging)
            window.removeEventListener('touchend', stopDragging)
            if(!state.draggedComponent){
                VIEW_NODE_SELECTED(nodeRef)
            }
            setState({...state, draggedComponent: null})
            return false
        }
        window.addEventListener('mouseup', stopDragging)
        window.addEventListener('touchend', stopDragging)
        return false
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
            // I probably was drunk
            if(widthName !== 'subEditorWidth' && ( (widthName === 'editorLeftWidth' ? state.leftOpen: state.rightOpen) ? newWidth < 180: newWidth > 180)){
                if(widthName === 'editorLeftWidth'){
                    return setState({...state, leftOpen: !state.leftOpen})
                }
                return setState({...state, rightOpen: !state.rightOpen})
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
            setState({...state, selectedStateNodeId:''})
        }
    }
    function DELETE_SELECTED_VIEW(nodeRef, parentRef, e) {
        e.stopPropagation()
        if(nodeRef.id === '_rootNode'){
            // immutably remove all nodes except rootNode
            return setState({...state, definition: {
                ...state.definition,
                vNodeBox: {'_rootNode': {...state.definition.vNodeBox['_rootNode'], children: []}},
            }, selectedViewNode: {}})
        }
        setState({...state, definition: {
            ...state.definition,
            [parentRef.ref]: {...state.definition[parentRef.ref], [parentRef.id]: {...state.definition[parentRef.ref][parentRef.id], children:state.definition[parentRef.ref][parentRef.id].children.filter((ref)=>ref.id !== nodeRef.id)}},
        }, selectedViewNode: {}})
    }
    function ADD_NODE(nodeRef, type) {
        // TODO remove when dragging works
        if(!nodeRef.ref || !state.definition[nodeRef.ref][nodeRef.id] || !state.definition[nodeRef.ref][nodeRef.id].children){
            nodeRef = {ref: 'vNodeBox', id: '_rootNode'}
        }
        const nodeId = nodeRef.id
        const newNodeId = uuid()
        const newStyleId = uuid()
        const newStyle = {
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
            })
        }
        if(type === 'text'){
            const pipeId = uuid()
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
                }})
        }
        if(type === 'if'){
            const pipeId = uuid()
            const newNode = {
                title: 'conditional',
                value: {ref:'pipe', id:pipeId},
                children: [],
            }
            const newPipe = {
                type: 'boolean',
                value: true,
                transformations: []
            }
            return setState({
                ...state,
                selectedViewNode: {ref:'vNodeIf', id: newNodeId},
                definition: nodeRef.ref === 'vNodeIf' ? {
                    ...state.definition,
                    pipe: {...state.definition.pipe, [pipeId]: newPipe},
                    vNodeIf: {...state.definition.vNodeIf, [nodeId]: {...state.definition.vNodeIf[nodeId], children: state.definition.vNodeIf[nodeId].children.concat({ref:'vNodeIf', id:newNodeId})}, [newNodeId]: newNode},
                } : {
                    ...state.definition,
                    pipe: {...state.definition.pipe, [pipeId]: newPipe},
                    [nodeRef.ref]: {...state.definition[nodeRef.ref], [nodeId]: {...state.definition[nodeRef.ref][nodeId], children: state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeIf', id:newNodeId})}},
                    vNodeIf: {...state.definition.vNodeIf, [newNodeId]: newNode},
                }
            })
        }
        if(type === 'input') {
            const stateId = uuid()
            const eventId = uuid()
            const mutatorId = uuid()
            const pipeInputId = uuid()
            const pipeMutatorId = uuid()
            const newNode = {
                title: 'input',
                style: {ref:'style', id:newStyleId},
                value: {ref:'pipe', id:pipeInputId},
                input: {ref:'event', id:eventId}
            }
            const newPipeInput = {
                type: 'text',
                value: {ref: 'state', id: stateId},
                transformations: []
            }
            const newPipeMutator = {
                type: 'text',
                value: {ref: 'eventData', id: '_input'},
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
                mutation: { ref: 'pipe', id: pipeMutatorId},
            }
            const newEvent = {
                type: 'input',
                title: 'update input',
                mutators: [
                    { ref: 'mutator', id: mutatorId},
                ],
                emitter: {
                    ref: 'vNodeInput',
                    id: newNodeId,
                },
                data: [
                    {ref: 'eventData', id: '_input'}
                ],
            }
            return setState({
                ...state,
                selectedViewNode: {ref:'vNodeInput', id: newNodeId},
                definition: {
                    ...state.definition,
                    pipe: {...state.definition.pipe, [pipeInputId]: newPipeInput, [pipeMutatorId]: newPipeMutator},
                    [nodeRef.ref]: {...state.definition[nodeRef.ref], [nodeId]: {...state.definition[nodeRef.ref][nodeId], children: state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeInput', id:newNodeId})}},
                    vNodeInput: {...state.definition.vNodeInput, [newNodeId]: newNode},
                    style: {...state.definition.style, [newStyleId]: newStyle},
                    nameSpace: {...state.definition.nameSpace, ['_rootNameSpace']: {...state.definition.nameSpace['_rootNameSpace'], children: state.definition.nameSpace['_rootNameSpace'].children.concat({ref:'state', id:stateId})}},
                    state: {...state.definition.state, [stateId]: newState},
                    mutator: {...state.definition.mutator, [mutatorId]: newMutator},
                    event: {...state.definition.event, [eventId]: newEvent},
                }})
        }
    }
    function ADD_STATE(namespaceId, type) {
        const newStateId = uuid()
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
        if(type === 'folder') {
            newState = {
                title: 'new folder',
                children: [],
            }
            return setState({...state, definition: {
                ...state.definition,
                nameSpace: {...state.definition.nameSpace, [namespaceId]: {...state.definition.nameSpace[namespaceId], children: state.definition.nameSpace[namespaceId].children.concat({ref:'nameSpace', id:newStateId})}, [newStateId]: newState},
            }})
        }
        setState({...state, definition: {
            ...state.definition,
            nameSpace: {...state.definition.nameSpace, [namespaceId]: {...state.definition.nameSpace[namespaceId], children: state.definition.nameSpace[namespaceId].children.concat({ref:'state', id:newStateId})}},
            state: {...state.definition.state, [newStateId]: newState},
        }})
    }
    function ADD_DEFAULT_STYLE(styleId, key) {
        const pipeId = uuid()
        const defaults = {
            'background': 'white',
            'border': '1px solid black',
            'outline': '1px solid black',
            'cursor': 'pointer',
            'color': 'black',
            'display': 'block',
            'top': '0px',
            'bottom': '0px',
            'left': '0px',
            'right': '0px',
            'maxWidth': '100%',
            'maxHeight': '100%',
            'minWidth': '100%',
            'minHeight': '100%',
            'position': 'absolute',
            'overflow': 'auto',
            'height': '500px',
            'width': '500px',
            'font': 'italic 2em "Comic Sans MS", cursive, sans-serif',
            'margin': '10px',
            'padding': '10px',
        }
        setState({...state, definition: {
            ...state.definition,
            pipe: {...state.definition.pipe, [pipeId]: {type: 'text', value: defaults[key], transformations:[]}},
            style: {...state.definition.style, [styleId]: {...state.definition.style[styleId], [key]: {ref: 'pipe', id: pipeId}}}}})
    }
    function SELECT_VIEW_SUBMENU(newId) {
        setState({...state, selectedViewSubMenu:newId})
    }
    function EDIT_VIEW_NODE_TITLE(nodeId) {
        setState({...state, editingTitleNodeId:nodeId})
    }
    function DELETE_SELECTED_VIEW(nodeRef, parentRef, e) {
        e.stopPropagation()
        if(nodeRef.id === '_rootNode'){
            if(state.definition.vNodeBox['_rootNode'].children.length === 0){
                return;
            }
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
    function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
        e.preventDefault();
        const nodeId = nodeRef.id
        const nodeType = nodeRef.ref
        setState({...state, definition: {
            ...state.definition,
            [nodeType]: {...state.definition[nodeType], [nodeId]: {...state.definition[nodeType][nodeId], title: e.target.value}},
        }})
    }
    function CHANGE_STATE_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            state: {...state.definition.state, [nodeId]: {...state.definition.state[nodeId], title: e.target.value}},
        }})
    }
    function CHANGE_NAMESPACE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            nameSpace: {...state.definition.nameSpace, [nodeId]: {...state.definition.nameSpace[nodeId], title: e.target.value}},
        }})
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
    function CHANGE_STATIC_VALUE(ref, propertyName, type, e) {
        let value = e.target.value
        if(type === 'number'){
            try {
                value = big(e.target.value)
            } catch(err) {
                return;
            }
        }
        if(type === 'boolean'){
            value = (value === true || value === 'true') ? true : false
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
        }})
    }
    function ADD_EVENT(propertyName, node) {
        const ref = state.selectedViewNode
        const eventId = uuid();
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
                    type: propertyName,
                    emitter: node,
                    mutators: [],
                    data: []
                }
            }
        }})
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
        }})
    }
    function ADD_TRANSFORMATION(pipeId, transformation) {
        if(transformation === 'join'){
            const newPipeId = uuid();
            const joinId = uuid();
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
            }})
        }
        if(transformation === 'toUpperCase'){
            const newId = uuid();
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
            }})
        }
        if(transformation === 'toLowerCase'){
            const newId = uuid();
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
            }})
        }
        if(transformation === 'toText'){
            const newId = uuid();
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
            }})
        }
        if(transformation === 'add'){
            const newPipeId = uuid();
            const addId = uuid();
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
            }})
        }
        if(transformation === 'subtract'){
            const newPipeId = uuid();
            const subtractId = uuid();
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
            }})
        }
    }
    function RESET_APP_STATE() {
        app.setCurrentState(app.createDefaultState())
        setState({...state, eventStack: []})
    }
    function RESET_APP_DEFINITION() {
        if(state.definition !== appDefinition){
            setState({...state, definition: {...appDefinition}})
        }
    }
    function FULL_SCREEN_CLICKED(value) {
        if(value !== state.fullScreen){
            setState({...state, fullScreen: value})
        }
    }

    const boxIcon = () => h('svg', {
            attrs: {width: 14, height: 15},
            style: { cursor: 'pointer', padding: '0 7px 0 0'},
        },
        [
            h('rect', {attrs: {x: 2, y: 2, width: 12, height: 12, fill: 'none', transition: 'all 0.2s', stroke: 'currentcolor', 'stroke-width': '2'}}),
        ])
    const ifIcon = () => h('svg', {
        attrs: {width: 14, height: 14},
        style: { cursor: 'pointer', padding: '0 7px 0 0'},
    }, [
        h('text', {attrs: { x:3, y:14, fill: 'currentcolor'}}, '?'),
    ])
    const numberIcon = () => h('svg', {
        attrs: {width: 14, height: 14},
        style: { cursor: 'pointer', padding: '0 7px 0 0'},
    }, [
        h('text', {attrs: { x:0, y:14, fill: 'currentcolor'}}, '№'),
    ])
    const listIcon = () => h('svg', {
            attrs: {width: 14, height: 14},
            style: { cursor: 'pointer', padding: '0 7px 0 0'},
        },
        [
            h('circle', {attrs: {r: 2, cx: 2, cy: 2, transition: 'all 0.2s', fill: 'currentcolor',}}),
            h('rect', {attrs: {x: 6, y: 1, width: 8, transition: 'all 0.2s', height: 2, fill: 'currentcolor',}}),
            h('circle', {attrs: {r: 2, cx: 2, cy: 7, transition: 'all 0.2s', fill: 'currentcolor',}}),
            h('rect', {attrs: {x: 6, y: 6, width: 8, transition: 'all 0.2s', height: 2, fill: 'currentcolor',}}),
            h('circle', {attrs: {r: 2, cx: 2, cy: 12, transition: 'all 0.2s', fill: 'currentcolor',}}),
            h('rect', {attrs: {x: 6, y: 11, width: 8, transition: 'all 0.2s', height: 2, fill:'currentcolor',}}),
        ])
    const inputIcon = () => h('svg', {
            attrs: {viewBox: '0 0 16 16', width: 14, height: 14},
            style: { cursor: 'pointer', padding: '0 7px 0 0'},
        },
        [
            h('path', {attrs: {d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill:'currentcolor'}}),
            h('path', {attrs: {d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: 'currentcolor'}}),
            h('path', {attrs: {d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: 'currentcolor'}}),
            h('path', {attrs: {d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: 'currentcolor'}}),
        ])
    const textIcon = () => h('svg', {
            attrs: {viewBox: '0 0 300 300', width: 14, height: 14},
            style: { cursor: 'pointer', padding: '0 7px 0 0'},
        },
        [
            h('path', {attrs: {d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: 'currentcolor'}})
        ])
    const folderIcon = () => h('svg', {
            attrs: {viewBox: '0 0 24 24', width: 14, height: 14, fill: 'currentcolor'},
            style: { cursor: 'pointer', padding: '0 7px 0 0'},
        },
        [
            h('path', {attrs: {d: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'}}),
            h('path', {attrs: {d: 'M0 0h24v24H0z', fill:"none"}}),
        ])

    function render() {
        const currentRunningState = app.getCurrentState()
        const dragComponentLeft = h('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'editorLeftWidth'],
                touchstart: [WIDTH_DRAGGED, 'editorLeftWidth'],
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
                    if (transRef.ref === 'equal') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'true/false')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, type)])
                        ])
                    }
                    if (transRef.ref === 'add') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, 'number')])
                        ])
                    }
                    if (transRef.ref === 'subtract') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, 'number')])
                        ])
                    }
                    if (transRef.ref === 'multiply') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, 'number')])
                        ])
                    }
                    if (transRef.ref === 'divide') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, 'number')])
                        ])
                    }
                    if (transRef.ref === 'remainder') {
                        return h('div', {}, [
                            h('div', {key: index, style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0', color: transformations.length-1 !== index ? '#bdbdbd': transType === type ? 'green': 'red'}}, 'number')]),
                            h('div', {style: {paddingLeft: '15px'}}, [emberEditor(transformer.value, 'number')])
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

            function genTransformators() {
                const selectedPipe = state.definition.pipe[state.selectedPipeId]
                return [h('div', {style: {
                    position: 'fixed',
                    top: '0px',
                    left: '-307px',
                    height: '100%',
                    width: '300px',
                    display: 'flex',
                }}, [
                    h('div',{style: {border: '3px solid #222', flex: '1 1 0%', background: '#4d4d4d', marginBottom: '10px'}}, [selectedPipe.type])
                ])]
            }
            if(state.selectedPipeId === ref.id) console.log(ref.id)
            if (typeof pipe.value === 'string') {
                return h('div', {style: {position: 'relative'}}, [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
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
                    h('div', state.selectedPipeId === ref.id ? genTransformators(): [])
                ])
            }

            if (pipe.value === true || pipe.value === false) {
                return h('select', {liveProps: {value:  pipe.value.toString()}, style: {},  on: {input:  [CHANGE_STATIC_VALUE, ref, 'value', 'boolean']}}, [
                    h('option', {attrs: {value: 'true'}, style: {color: 'black'}}, ['true']),
                    h('option', {attrs: {value: 'false'}, style: {color: 'black'}}, ['false']),
                ])
            }

            if (!isNaN(parseFloat(Number(pipe.value))) && isFinite(Number(pipe.value))) {
                return h('div', {style: {position: 'relative'}}, [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
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
                    h('div', state.selectedPipeId === ref.id ? genTransformators(): [])
                ])
            }

            if(pipe.value.ref === 'state'){
                const displState = state.definition[pipe.value.ref][pipe.value.id]
                return h('div', {style: {position: 'relative'}}, [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
                    h('div', {style: {flex: '1'}},
                        [
                            h('span', {style: {flex: '0 0 auto', display: 'inline-block', position: 'relative', transform: 'translateZ(0)', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === pipe.value.id? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                                h('span', {style: {color: 'white', display: 'inline-block'}, on: {click: [STATE_NODE_SELECTED, pipe.value.id]}}, displState.title),
                            ]),
                        ]
                    ),
                    h('div', {style: {flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd': displState.type === type ? 'green': 'red'}}, displState.type)
                ]),
                    h('div', {style: {paddingLeft: '15px'}}, listTransformations(pipe.transformations, pipe.type)),
                    h('div', state.selectedPipeId === ref.id ? genTransformators(): [])
                ])
            }
            if(pipe.value.ref === 'listValue'){
                return h('div', 'TODO')
            }
            if(pipe.value.ref === 'eventData'){
                const eventData = state.definition[pipe.value.ref][pipe.value.id]
                return h('div', [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id]}}, [
                    h('div', {style: {flex: '1'}},
                        [h('div',{
                                style: { cursor: 'pointer', color: state.selectedStateNodeId === pipe.value.id ? '#eab65c': 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNodeId === pipe.value.id ? '#eab65c': 'white'), display: 'inline-block'},
                                on: {click: [STATE_NODE_SELECTED, pipe.value.id]}
                            },
                            [eventData.title])
                        ]
                    ),
                    h('div', {style: {flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd': eventData.type === type ? 'green': 'red'}}, eventData.type)
                ]),
                    h('div', {style: {paddingLeft: '15px'}}, listTransformations(pipe.transformations, pipe.type)),
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
            if(stateId === '_rootNameSpace'){
                return h('div',  currentNameSpace.children.map((ref)=> ref.ref === 'state' ? listState(ref.id): listNameSpace(ref.id)))
            }
            const closed = state.viewFoldersClosed[stateId] || (state.selectedStateNodeId !== stateId && currentNameSpace.children.length === 0)
            return h('div', {
                    style: {
                        position: 'relative',
                    }
                }, [
                    h('div',  {
                        style: {
                            fontSize: '0.8em',
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }, [
                        h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', padding: '5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)', transition: 'all 0.2s'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, stateId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15'}, style: {fill: state.selectedStateNodeId === stateId ? '#eab65c': 'white', transition: 'fill 0.2s'}})]),
                        state.editingTitleNodeId === stateId ?
                            editingNode():
                            h('span', {style: { cursor: 'pointer', color: state.selectedStateNodeId === stateId ? '#eab65c': 'white', transition: 'color 0.2s'}, on: {dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, currentNameSpace.title),
                    ]),
                    h('div', {style: { display: closed ? 'none': 'block', paddingLeft: '10px', paddingBottom: '5px', transition: 'border-color 0.2s'}}, [
                        ...currentNameSpace.children.map((ref)=> ref.ref === 'state' ? listState(ref.id): listNameSpace(ref.id)),
                    ]),
                ]
            )
        }
        function listState(stateId) {
            const currentState = state.definition.state[stateId]
            function editingNode() {
                return h('input', {
                    style: {
                        color: 'white',
                        outline: 'none',
                        padding: '4px 7px',
                        boxShadow: 'none',
                        display: 'inline',
                        border: 'none',
                        background: 'none',
                        font: 'inherit',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        flex: '0 0 auto',
                    },
                    on: {
                        input: [CHANGE_STATE_NODE_TITLE, stateId],
                    },
                    liveProps: {
                        value: currentState.title,
                    },
                    attrs: {
                        'data-istitleeditor': true
                    }
                })
            }
            return h('div', {
                    style: {
                        cursor: 'pointer',
                        position: 'relative',
                        fontSize: '14px',
                    },
                },
                [
                    h('span', {style: {display: 'flex', flexWrap: 'wrap'}}, [
                        h('span', {style: {flex: '0 0 auto',  position: 'relative', transform: 'translateZ(0)', margin: '7px 7px 0 0',  boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                            h('span', {style: {opacity: state.editingTitleNodeId === stateId ? '0': '1', color: 'white', display: 'inline-block'}, on: {click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, currentState.title),
                            state.editingTitleNodeId === stateId ? editingNode(): h('span'),
                        ]),
                        (()=> {
                            const noStyleInput = {
                                color: currentRunningState[stateId] !== state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)' : 'white',
                                background: 'none',
                                outline: 'none',
                                display: 'inline',
                                flex: '1',
                                minWidth: '50px',
                                border: 'none',
                                marginTop: '6px',
                                boxShadow: 'inset 0 -2px 0 0 ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#828282')
                            }
                            if(currentState.type === 'text') return h('input', {attrs: {type: 'text'}, liveProps: {value: currentRunningState[stateId]}, style: noStyleInput, on: {input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId]}})
                            if(currentState.type === 'number') return h('input', {attrs: {type: 'number'}, liveProps: {value: currentRunningState[stateId]}, style: noStyleInput,  on: {input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId]}})
                            if(currentState.type === 'boolean') return h('select', {liveProps: {value: currentRunningState[stateId].toString()}, style: noStyleInput,  on: {input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId]}}, [
                                h('option', {attrs: {value: 'true'}, style: {color: 'black'}}, ['true']),
                                h('option', {attrs: {value: 'false'}, style: {color: 'black'}}, ['false']),
                            ])
                            if(currentState.type === 'table') {
                                if(state.selectedStateNodeId !== stateId){
                                    return h('div', {key: 'icon',on: {click: [STATE_NODE_SELECTED, stateId]}, style: {display: 'flex', alignItems: 'center', marginTop: '7px'}}, [listIcon()])
                                }
                                const table = currentRunningState[stateId];
                                return h('div', {
                                        key: 'table',
                                        style: {
                                            background: '#828183',
                                            width: '100%',
                                            flex: '0 0 100%'
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
                    ]),
                    state.selectedStateNodeId === stateId ?
                        h('span',
                            currentState.mutators.map(mutatorRef => {
                                    const mutator = state.definition[mutatorRef.ref][mutatorRef.id]
                                    const event = state.definition[mutator.event.ref][mutator.event.id]
                                    const emitter = state.definition[event.emitter.ref][event.emitter.id]
                                    return h('div', {style: {
                                        display: 'flex',
                                        cursor: 'pointer',
                                        alignItems: 'center',
                                        background: '#444',
                                        paddingTop: '3px',
                                        paddingBottom: '3px',
                                        color: state.selectedViewNode.id === event.emitter.id ? '#53B2ED': 'white',
                                        transition: '0.2s all',
                                        minWidth: '100%',
                                    }, on: {click: [VIEW_NODE_SELECTED, event.emitter]}}, [
                                        h('span', {style: {flex: '0 0 auto', margin: '0 0 0 5px'}}, [
                                            event.emitter.ref === 'vNodeBox' ? boxIcon() :
                                                event.emitter.ref === 'vNodeList' ? listIcon() :
                                                    event.emitter.ref === 'vNodeList' ? ifIcon() :
                                                        event.emitter.ref === 'vNodeInput' ? inputIcon() :
                                                            textIcon(),
                                        ]),
                                        h('span', {style: {flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}, emitter.title),
                                        h('span', {style: {flex: '0 0 auto', marginLeft: 'auto', marginRight: '5px', color: '#5bcc5b'}}, event.type),
                                    ])
                                }
                            )) :
                        h('span'),
                ]
            )
        }

        const stateComponent = h('div', { attrs: {class: 'better-scrollbar'}, style: {overflow: 'auto', flex: '1', padding: '0 10px'}, on: {click: [UNSELECT_STATE_NODE]}}, [listNameSpace('_rootNameSpace')])

        function listBoxNode(nodeRef, parentRef, depth) {
            const nodeId = nodeRef.id
            const node = state.definition[nodeRef.ref][nodeId]
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
                    h('div', {style: {
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: depth *20 + 8+ 'px',
                        background: '#444',
                        borderTop: '2px solid #4d4d4d',
                        borderBottom: '2px solid #333',
                        paddingTop: '1px',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        paddingBottom: '3px',
                    }}, [
                        h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', display: nodeRef.ref === 'vNodeBox' && node.children.length > 0 ? 'initial': 'none', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, nodeId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15'}, style: {fill: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'fill 0.2s'}})]),
                        h('span', {key: nodeId, style: {color: state.selectedViewNode.id === nodeId ? '#53B2ED': '#bdbdbd', display: 'inline-flex'}, on: {mousedown: [VIEW_DRAGGED, nodeRef], touchstart: [VIEW_DRAGGED, nodeRef],}}, [
                            nodeRef.ref === 'vNodeBox' ? boxIcon() :
                                nodeRef.ref === 'vNodeList' ? listIcon() :
                                    ifIcon()
                        ]),
                        state.editingTitleNodeId === nodeId ?
                            editingNode():
                            h('span', { style: {flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s'}, on: {mousedown: [VIEW_DRAGGED, nodeRef], touchstart: [VIEW_DRAGGED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}}, node.title),
                        h('div', {style: {color: '#53B2ED', cursor: 'pointer', display: state.selectedViewNode.id === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0', padding:'1px 5px'}, on: {click: [DELETE_SELECTED_VIEW, nodeRef, parentRef]}}, 'x'),
                    ]),
                    h('div', {
                        style: { display: closed ? 'none': 'block', transition: 'border-color 0.2s'},
                    }, [
                        ...node.children.map((ref)=>{
                            if(ref.ref === 'vNodeText') return simpleNode(ref, nodeRef, depth+1)
                            if(ref.ref === 'vNodeBox' || ref.ref === 'vNodeList' || ref.ref === 'vNodeIf') return listBoxNode(ref, nodeRef, depth+1)
                            if(ref.ref === 'vNodeInput') return simpleNode(ref, nodeRef, depth+1)
                        }),
                    ]),
                ]
            )
        }
        function simpleNode(nodeRef, parentRef, depth) {
            const nodeId = nodeRef.id
            const node = state.definition[nodeRef.ref][nodeId]
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
                        position: 'relative',
                        paddingLeft: depth *20 + 8 +'px',
                        background: '#444',
                        borderTop: '2px solid #4d4d4d',
                        borderBottom: '2px solid #333',
                        paddingTop: '1px',
                        whiteSpace: 'nowrap',
                        paddingBottom: '3px',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    on: {mousedown: [VIEW_DRAGGED, nodeRef], touchstart: [VIEW_DRAGGED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}
                }, [
                    h('span', {style: {color: state.selectedViewNode.id === nodeId ? '#53B2ED': '#bdbdbd', display: 'inline-flex'}}, [
                        nodeRef.ref === 'vNodeInput' ? inputIcon() :
                            textIcon()
                    ]),
                    state.editingTitleNodeId === nodeId ?
                        editingNode():
                        h('span', {style: {color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s'}}, node.title),
                        h('div', {style: {color: '#53B2ED', cursor: 'pointer', display: state.selectedViewNode.id === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0', padding:'1px 5px'}, on: {click: [DELETE_SELECTED_VIEW, nodeRef, parentRef]}}, 'x'),
                ]
            )
        }

        function generateEditNodeComponent() {
            const styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'right', 'position', 'overflow', 'font', 'margin', 'padding']
            const selectedNode = state.definition[state.selectedViewNode.ref][state.selectedViewNode.id]

            const propsComponent = h('div', {
                style: {
                    background: state.selectedViewSubMenu === 'props' ? '#4d4d4d': '#3d3d3d',
                    padding: '10px 0',
                    flex: '1',
                    cursor: 'pointer',
                    textAlign: 'center',
                },
                on: {
                    click: [SELECT_VIEW_SUBMENU, 'props']
                }
            }, 'data')
            const styleComponent = h('div', {
                style: {
                    background: state.selectedViewSubMenu === 'style' ? '#4d4d4d': '#3d3d3d',
                    padding: '10px 0',
                    flex: '1',
                    borderRight: '1px solid #222',
                    borderLeft: '1px solid #222',
                    textAlign: 'center',
                    cursor: 'pointer',
                },
                on: {
                    click: [SELECT_VIEW_SUBMENU, 'style']
                }
            }, 'style')
            const eventsComponent = h('div', {
                style: {
                    background: state.selectedViewSubMenu === 'events' ? '#4d4d4d': '#3d3d3d',
                    padding: '10px 0',
                    flex: '1',
                    textAlign: 'center',
                    cursor: 'pointer',
                },
                on: {
                    click: [SELECT_VIEW_SUBMENU, 'events']
                }
            }, 'events')

            const genpropsSubmenuComponent = () => h('div', [(()=>{
                if (state.selectedViewNode.ref === 'vNodeBox') {
                    return h('div', {
                        style: {
                            textAlign: 'center',
                            marginTop: '100px',
                            color: '#bdbdbd'
                        }
                    }, 'no data required')
                }
                if (state.selectedViewNode.ref === 'vNodeText') {
                    return h('div', [
                        h('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [
                            h('span', {style: {flex: '1'}}, 'text value'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'text')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'text')])
                    ])
                }
                if (state.selectedViewNode.ref === 'vNodeInput') {
                    return h('div',[
                        h('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [
                            h('span', {style: {flex: '1'}}, 'input value'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'text')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'text')])
                    ])
                }
                if (state.selectedViewNode.ref === 'vNodeList') {
                    return h('div',[
                        h('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [
                            h('span', {style: {flex: '1'}}, 'table'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'table')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'table')])
                    ])
                }
                if (state.selectedViewNode.ref === 'vNodeIf') {
                    return h('div',[
                        h('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [
                            h('span', {style: {flex: '1'}}, 'predicate'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'true/false')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.value, 'boolean')])
                    ])
                }
            })()])
            const genstyleSubmenuComponent = () => {
                const selectedStyle = state.definition.style[selectedNode.style.id]
                return h('div', {attrs: {class: 'better-scrollbar'}, style: {overflow: 'auto'}}, [
                    h('div',{ style: {padding: '10px', fontFamily: "'Comfortaa', sans-serif",  color: '#bdbdbd'}}, 'style panel will change a lot in 1.0v, right now it\'s just CSS'),
                    ...Object.keys(selectedStyle).map((key) => h('div', {style: {
                    }}, [
                        h('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [
                            h('span', {style: {flex: '1'}}, key),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'text')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedStyle[key], 'text')]),
                    ])),
                    h('div', {style: { padding: '5px 10px', fontFamily: "'Comfortaa', sans-serif",  color: '#bdbdbd'}}, 'add Style:'),
                    h('div', {style: { padding: '5px 0 5px 10px'}},
                        styles
                            .filter((key) => !Object.keys(selectedStyle).includes(key))
                            .map((key) => h('div', {
                                on: {click: [ADD_DEFAULT_STYLE, selectedNode.style.id, key]},
                                style: {
                                    cursor: 'pointer',
                                    border: '3px solid white',
                                    padding: '5px',
                                    marginTop: '5px'
                                }
                            }, '+ ' + key))
                    )
                ])
            }
            const geneventsSubmenuComponent = () => {
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
                if (state.selectedViewNode.ref === 'vNodeInput') {
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
                const currentEvents = availableEvents.filter((event) => selectedNode[event.propertyName])
                const eventsLeft = availableEvents.filter((event) => !selectedNode[event.propertyName])
                return h('div', {style: {paddingTop: '20px'}}, [
                        ...(currentEvents.length ?
                            currentEvents.map((eventDesc) => {
                                const event = state.definition[selectedNode[eventDesc.propertyName].ref][selectedNode[eventDesc.propertyName].id]
                                return h('div', [
                                    h('div', {style: {background: '#676767', padding: '5px 10px'}}, event.type),
                                    h('div',
                                        {style: {
                                            color: 'white',
                                            transition: 'color 0.2s',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            padding: '5px 10px',
                                        },
                                        }, event.mutators.map(mutatorRef => {
                                            const mutator = state.definition[mutatorRef.ref][mutatorRef.id]
                                            const stateDef = state.definition[mutator.state.ref][mutator.state.id]
                                            return h('div', {style: {marginTop: '10px'}}, [
                                                h('span', {style: {flex: '0 0 auto', display: 'inline-block', position: 'relative', transform: 'translateZ(0)', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === mutator.state.id ? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                                                    h('span', {style: {color: 'white', display: 'inline-block'}, on: {click: [STATE_NODE_SELECTED, mutator.state.id]}}, stateDef.title),
                                                ]),
                                                emberEditor(mutator.mutation, stateDef.type)
                                            ])
                                        })
                                    )
                                ])
                            }) :
                            []),
                        h('div', {style: { padding: '5px 10px', fontFamily: "'Comfortaa', sans-serif",  color: '#bdbdbd'}}, 'add Event:'),
                        h('div',  {style: { padding: '5px 0 5px 10px'}}, [
                            ...eventsLeft.map((event) =>
                                h('div', {
                                    style: {
                                        border: '3px solid #5bcc5b',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        margin: '10px'
                                    }, on: {click: [ADD_EVENT, event.propertyName, state.selectedViewNode]}
                                }, '+ ' + event.description),
                            ),
                        ]),
                    ]
                )
            }

            const fullVNode = state.selectedViewNode.ref === 'vNodeBox' || state.selectedViewNode.ref === 'vNodeText' || state.selectedViewNode.ref === 'vNodeInput'

            return h('div', {
                style: {
                    position: 'absolute',
                    left: '-15px',
                    transform: 'translate(-100%, 0)',
                    marginRight: '8px',
                    top: '50%',
                    height: '50%',
                    display: 'flex',
                }
            }, [
                h('div', {style: {flex: '1', display: 'flex', marginBottom: '10px', flexDirection: 'column', background: '#4d4d4d', width: state.subEditorWidth + 'px', border: '3px solid #222'}},[
                    h('div', {style: {flex: '0 0 auto',}}, [
                        h('div', {style: {
                            display: 'flex',
                            cursor: 'default',
                            alignItems: 'center',
                            background: '#222',
                            paddingTop: '2px',
                            paddingBottom: '5px',
                            color: '#53B2ED',
                            minWidth: '100%',
                        }}, [
                            h('span', {style: {flex: '0 0 auto', margin: '0 0 0 5px'}}, [
                                state.selectedViewNode.ref === 'vNodeBox' ? boxIcon() :
                                    state.selectedViewNode.ref === 'vNodeList' ? listIcon() :
                                        state.selectedViewNode.ref === 'vNodeList' ? ifIcon() :
                                            state.selectedViewNode.ref === 'vNodeInput' ? inputIcon() :
                                                textIcon(),
                            ]),
                            h('span', {style: {flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}, selectedNode.title),
                            h('span', {style: {flex: '0 0 auto', marginLeft: 'auto', cursor: 'pointer', marginRight: '5px', color: 'white'}, on: {click: [UNSELECT_VIEW_NODE]}}, 'x'),
                        ])
                    ]),
                    fullVNode ? h('div', {style: { display: 'flex', flex: '0 0 auto', fontFamily: "'Comfortaa', sans-serif"}}, [propsComponent, styleComponent, eventsComponent]) : h('span'),
                    dragSubComponent,
                    state.selectedViewSubMenu === 'props' || !fullVNode ? genpropsSubmenuComponent():
                        state.selectedViewSubMenu === 'style' ? genstyleSubmenuComponent():
                            state.selectedViewSubMenu === 'events' ? geneventsSubmenuComponent():
                                h('span', 'Error, no such menu')
                ])
            ])
        }

        const addStateComponent = h('div', {style: { flex: '0 auto', marginLeft: state.rightOpen ? '-10px': '0', border: '3px solid #222', borderRight: 'none', background: '#333', height: '40px', display: 'flex', alignItems: 'center'}}, [
            h('span', {style: { fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', cursor: 'pointer', padding: '0 5px'}}, 'add state: '),
            h('span', {style: {display: 'inline-block'}, on: {click: [ADD_STATE, '_rootNameSpace', 'text']}}, [textIcon()]),
            h('span', {on: {click: [ADD_STATE, '_rootNameSpace', 'number']}}, [numberIcon()]),
            h('span', {on: {click: [ADD_STATE, '_rootNameSpace', 'boolean']}}, [ifIcon()]),
            h('span', {on: {click: [ADD_STATE, '_rootNameSpace', 'table']}}, [listIcon()]),
            h('span', {on: {click: [ADD_STATE, '_rootNameSpace', 'folder']}}, [folderIcon()]),
        ])


        const addViewNodeComponent = h('div', {style: { flex: '0 auto', marginLeft: state.rightOpen ? '-10px': '0', border: '3px solid #222', borderRight: 'none', background: '#333', height: '40px', display: 'flex', alignItems: 'center'}}, [
            h('span', {style: { fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', padding: '0 10px'}}, 'add component: '),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'box']}}, [boxIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'input']}}, [inputIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'text']}}, [textIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'if']}}, [ifIcon()]),
        ])

        const viewComponent = h('div', {attrs: {class: 'better-scrollbar'}, style: {overflow: 'auto', position: 'relative', flex: '1', fontSize: '0.8em'}, on: {click: [UNSELECT_VIEW_NODE]}}, [
            listBoxNode({ref: 'vNodeBox', id:'_rootNode'}, {}, 0),
        ])

        const rightComponent =
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'absolute',
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
                    transform: state.rightOpen ? 'translateZ(0) translateX(0%)': 'translateZ(0) translateX(100%)',
                    userSelect: 'none',
                },
            }, [
                dragComponentRight,
                addStateComponent,
                stateComponent,
                addViewNodeComponent,
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
                display:'flex',
                justifyContent: 'center',
                fontFamily: "'Comfortaa', sans-serif",
            }
        }, [
            h('a', {style: {flex: '0 auto', width: '190px', textDecoration: 'inherit', userSelect: 'none'}, attrs: {href:'/_dev'}}, [
                h('img',{style: { margin: '7px -2px -3px 5px', display: 'inline-block'}, attrs: {src: '/images/logo256x256.png', height: '57'}}),
                h('span',{style: { fontSize:'44px',  verticalAlign: 'bottom', color: '#fff'}}, 'ugnis')
            ]),
            h('div', {style: {
                position: 'absolute',
                top: '0',
                right: '0',
                border: 'none',
                color: 'white',
                fontFamily: "'Comfortaa', sans-serif",
                fontSize: '16px',
            },
            }, [
                h('div', {style: {
                    background: '#444444',
                    border: 'none',
                    color: 'white',
                    display: 'inline-block',
                    padding: '15px 20px',
                    margin: '13px 13px 0 0',
                    cursor: 'pointer',
                },
                    on: {
                        click: [FULL_SCREEN_CLICKED, true]
                    }
                }, 'full screen'),
                h('div', {style: {
                    background: '#444444',
                    border: 'none',
                    color: 'white',
                    display: 'inline-block',
                    padding: '15px 20px',
                    margin: '13px 13px 0 0',
                    cursor: 'pointer',
                },
                    on: {
                        click: RESET_APP_STATE
                    }
                }, 'reset state'),
                h('div', {style: {
                    background: '#444444',
                    border: 'none',
                    color: 'white',
                    display: 'inline-block',
                    padding: '15px 20px',
                    margin: '13px 13px 0 0',
                    cursor: 'pointer',
                },
                    on: {
                        click: RESET_APP_DEFINITION
                    }
                }, 'reset demo')
            ])
        ])
        const leftComponent = h('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
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
                transform: state.leftOpen ? 'translateZ(0) translateX(0%)': 'translateZ(0) translateX(-100%)',
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
                    attrs: {class: 'better-scrollbar'},
                    style: {
                        flex: '1 auto',
                        overflow: 'auto'
                    }
                },
                state.eventStack
                    .filter((eventData)=>state.definition.event[eventData.eventId] !== undefined)
                    .reverse() // mutates the array, but it was already copied with filter
                    .map((eventData, index) => {
                        const event = state.definition.event[eventData.eventId]
                        const emitter = state.definition[event.emitter.ref][event.emitter.id]
                        // no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
                        return h('div', {key: event.emitter.id + index, style: {marginBottom: '10px'}}, [
                            h('div', {style: {
                                display: 'flex',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                alignItems: 'center',
                                background: '#444',
                                paddingTop: '3px',
                                paddingBottom: '3px',
                                color: state.selectedViewNode.id === event.emitter.id ? '#53B2ED': 'white',
                                transition: '0.2s all',
                                minWidth: '100%',
                            }, on: {click: [VIEW_NODE_SELECTED, event.emitter]}}, [
                                h('span', {style: {flex: '0 0 auto', margin: '0 0 0 5px'}}, [
                                    event.emitter.ref === 'vNodeBox' ? boxIcon() :
                                        event.emitter.ref === 'vNodeList' ? listIcon() :
                                            event.emitter.ref === 'vNodeList' ? ifIcon() :
                                                event.emitter.ref === 'vNodeInput' ? inputIcon() :
                                                    textIcon(),
                                ]),
                                h('span', {style: {flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap',  textOverflow: 'ellipsis'}}, emitter.title),
                                h('span', {style: {flex: '0 0 auto', fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', marginLeft: 'auto', marginRight: '5px', color: '#5bcc5b'}}, event.type),
                            ]),
                            Object.keys(eventData.mutations).length === 0 ?
                                h('div', {style: { padding: '5px 10px', fontFamily: "'Comfortaa', sans-serif",  color: '#bdbdbd'}}, 'nothing has changed'):
                                h('div', {style: {paddingLeft: '10px', whiteSpace: 'nowrap'}}, Object.keys(eventData.mutations)
                                    .filter(stateId => state.definition.state[stateId] !== undefined)
                                    .map(stateId =>
                                        h('span', [
                                            h('span', {on: {click: [STATE_NODE_SELECTED, stateId]}, style: {cursor: 'pointer', fontSize: '14px', color: 'white', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#828282') , background: '#444', padding: '2px 5px', marginRight: '5px', display: 'inline-block', transition: 'all 0.2s'}}, state.definition.state[stateId].title),
                                            h('span', {style: {color: '#8e8e8e'}}, eventData.previousState[stateId].toString() + ' –› '),
                                            h('span', eventData.mutations[stateId].toString()),
                                        ])
                                    ))
                        ])
                    })
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
                display:'relative',
                overflow: 'auto',
            },
        }, [
            h('div', {style: (()=>{
                const topMenuHeight = 75
                const widthLeft = window.innerWidth - ((state.leftOpen ? state.editorLeftWidth: 0) + (state.rightOpen ? state.editorRightWidth : 0))
                const heightLeft = window.innerHeight - topMenuHeight
                return {
                    width: state.fullScreen ? '100vw' : widthLeft - 40 +'px',
                    height: state.fullScreen ? '100vh' : heightLeft - 40 + 'px',
                    background: '#ffffff',
                    zIndex: state.fullScreen ? '99999' : undefined,
                    boxShadow: 'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',
                    position: 'fixed',
                    transition: state.fullScreen ?  'all 0.3s': 'none',
                    top: state.fullScreen ? '0px' : 20 + 75 + 'px',
                    left: state.fullScreen ? '0px' : (state.leftOpen ?state.editorLeftWidth : 0) + 20 + 'px',
                }
            })()}, [
                state.fullScreen ?
                    h('span', {style: {position: 'fixed', padding: '12px 10px', top: '0', right: '20px', border: '2px solid #333', borderTop: 'none', background: '#444', color: 'white', opacity: '0.8', cursor: 'pointer'}, on: {click: [FULL_SCREEN_CLICKED, false]}}, 'exit full screen'):
                    h('span'),
                h('div', {style: {overflow: 'auto', width: '100%', height: '100%'}}, [app.vdom])
            ])
        ])
        const mainRowComponent = h('div', {
            style: {
                display: 'flex',
                flex: '1',
                position: 'relative',
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
            state.draggedComponent ? h('div', {style: {position: 'fixed', top: state.mousePosition.y + 'px', left: state.mousePosition.x + 'px', background: '#444', zIndex: '99999', width: state.editorRightWidth + 'px', height: '23px', borderTop: '2px solid #4d4d4d', borderBottom: '2px solid #333', color: 'white'}}, ['drag']): h('span'),
        ])

        node = patch(node, vnode)
        currentAnimationFrameRequest = null;
    }

    render()
}