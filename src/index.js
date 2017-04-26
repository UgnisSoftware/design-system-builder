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

function moveInArray (array, moveIndex, toIndex) {
    let item = array[moveIndex];
    let length = array.length;
    let diff = moveIndex - toIndex;

    if (diff > 0) {
        return [
            ...array.slice(0, toIndex),
            item,
            ...array.slice(toIndex, moveIndex),
            ...array.slice(moveIndex + 1, length)
        ];
    } else if (diff < 0) {
        return [
            ...array.slice(0, moveIndex),
            ...array.slice(moveIndex + 1, toIndex + 1),
            item,
            ...array.slice(toIndex + 1, length)
        ];
    }
    return array;
}

const attachFastClick = require('fastclick')
attachFastClick(document.body)

const version = '0.0.32v'
editor(savedApp)

function editor(appDefinition){

    const savedDefinition = JSON.parse(localStorage.getItem('app_key_' + version))
    const app = ugnis(savedDefinition || appDefinition)

    let node = document.createElement('div')
    document.body.appendChild(node)

    // State
    let state = {
        leftOpen: false,
        rightOpen: true,
        fullScreen: false,
        editorRightWidth: 350,
        editorLeftWidth: 350,
        subEditorWidth: 350,
        componentEditorPosition: {x: window.innerWidth - 710, y: window.innerHeight / 2} ,
        appIsFrozen: false,
        selectedViewNode: {},
        selectedPipeId: '',
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        viewFoldersClosed: {},
        draggedComponentView: null,
        draggedComponentStateId: null,
        hoveredPipe: null,
        hoveredViewNode: null,
        hoveredEvent: null,
        mousePosition: {},
        eventStack: [],
        definition: savedDefinition || app.definition,
    }
    // undo/redo
    let stateStack = [state.definition]
    let currentAnimationFrameRequest = null;
    function setState(newState, timeTraveling){
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
            if(!timeTraveling){
                const currentIndex = stateStack.findIndex((a)=>a===state.definition)
                stateStack = stateStack.slice(0, currentIndex+1).concat(newState.definition)
            }
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
                setState({...state, definition: newDefinition}, true)
            }
        }
        if((e.which === 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) || (e.shiftKey && e.which === 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))) {
            e.preventDefault();
            const currentIndex = stateStack.findIndex((a)=>a===state.definition)
            if(currentIndex < stateStack.length-1){
                const newDefinition = stateStack[currentIndex+1]
                setState({...state, definition: newDefinition}, true)
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
    let openBoxTimeout = null
    function VIEW_DRAGGED(nodeRef, parentRef, initialDepth, e) {
        e.preventDefault()
        const isArrow = e.target.dataset.closearrow
        const isTrashcan = e.target.dataset.trashcan
        const initialX = e.touches? e.touches[0].pageX: e.pageX
        const initialY = e.touches? e.touches[0].pageY: e.pageY
        const position = this.elm.getBoundingClientRect()
        const offsetX = initialX - position.left
        const offsetY = initialY - position.top
        function drag(e){
            e.preventDefault()
            const x = e.touches? e.touches[0].pageX: e.pageX
            const y = e.touches? e.touches[0].pageY: e.pageY
            if(!state.draggedComponentView){
                if(Math.abs(initialY-y) > 3){
                    setState({...state, draggedComponentView: {...nodeRef, depth: initialDepth}, mousePosition: {x: x - offsetX, y: y - offsetY}})
                }
            } else {
                setState({...state, mousePosition: {x: x - offsetX, y: y - offsetY}})
            }
            return false
        }
        window.addEventListener('mousemove', drag)
        window.addEventListener('touchmove', drag)
        function stopDragging(event){
            event.preventDefault()
            window.removeEventListener('mousemove', drag)
            window.removeEventListener('touchmove', drag)
            window.removeEventListener('mouseup', stopDragging)
            window.removeEventListener('touchend', stopDragging)
            if(openBoxTimeout){
                clearTimeout(openBoxTimeout)
                openBoxTimeout = null
            }
            if(!state.draggedComponentView){
                if(event.target === e.target && isArrow){
                    return VIEW_FOLDER_CLICKED(nodeRef.id)
                }
                if(event.target === e.target && isTrashcan){
                    return DELETE_SELECTED_VIEW(nodeRef, parentRef)
                }
                return VIEW_NODE_SELECTED(nodeRef)
            }
            if(!state.hoveredViewNode){
                return setState({...state, draggedComponentView: null,})
            }
            const newParentRef = state.hoveredViewNode.parent
            // frame this somewhere on how not to write code
            const fixedParents = {
                ...state,
                draggedComponentView: null,
                hoveredViewNode: null,
                definition: parentRef.id === newParentRef.id ? { // moving in the same parent
                    ...state.definition,
                    [parentRef.ref]: {
                        ...state.definition[parentRef.ref],
                        [parentRef.id]: {
                            ...state.definition[parentRef.ref][parentRef.id],
                            children: moveInArray(state.definition[parentRef.ref][parentRef.id].children, state.definition[parentRef.ref][parentRef.id].children.findIndex((ref)=> ref.id === nodeRef.id), state.hoveredViewNode.position)
                        }
                    }
                } : parentRef.ref === newParentRef.ref ? { // moving in the similar parent (same type)
                    ...state.definition,
                    [parentRef.ref]: {
                        ...state.definition[parentRef.ref],
                        [parentRef.id]: {
                            ...state.definition[parentRef.ref][parentRef.id],
                            children: state.definition[parentRef.ref][parentRef.id].children.filter((ref)=> ref.id !== nodeRef.id)
                        },
                        [newParentRef.id]: {
                            ...state.definition[newParentRef.ref][newParentRef.id],
                            children: state.definition[newParentRef.ref][newParentRef.id].children.slice(0, state.hoveredViewNode.position).concat(nodeRef, state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position))
                        }
                    },
                } : { // moving to a new type parent
                    ...state.definition,
                    [parentRef.ref]: {
                        ...state.definition[parentRef.ref],
                        [parentRef.id]: {
                            ...state.definition[parentRef.ref][parentRef.id],
                            children: state.definition[parentRef.ref][parentRef.id].children.filter((ref)=> ref.id !== nodeRef.id)
                        },
                    },
                    [newParentRef.ref]: {
                        ...state.definition[newParentRef.ref],
                        [newParentRef.id]: {
                            ...state.definition[newParentRef.ref][newParentRef.id],
                            children: state.definition[newParentRef.ref][newParentRef.id].children.slice(0, state.hoveredViewNode.position).concat(nodeRef, state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position))
                        },
                    },
                }
            }
            setState({
                ...fixedParents,
                definition: {
                    ...fixedParents.definition,
                    [nodeRef.ref]: {
                        ...fixedParents.definition[nodeRef.ref],
                        [nodeRef.id]: {
                            ...fixedParents.definition[nodeRef.ref][nodeRef.id],
                            parent: newParentRef
                        }
                    },
                }
            })
            return false
        }
        window.addEventListener('mouseup', stopDragging)
        window.addEventListener('touchend', stopDragging)
        return false
    }

    function HOVER_MOBILE(e) {
        const elem = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
        const moveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
            screenX: e.touches[0].screenX,
            screenY: e.touches[0].screenY,
        })
        elem.dispatchEvent(moveEvent)
    }

    function VIEW_HOVERED(nodeRef, parentRef, depth, e) {
        if(!state.draggedComponentView){
            return;
        }
        const hitPosition = (e.touches? 28: e.layerY) / 28
        const insertBefore  = ()=> setState({...state, hoveredViewNode: {parent: parentRef, depth, position: state.definition[parentRef.ref][parentRef.id].children.filter((ref)=> ref.id !== state.draggedComponentView.id).findIndex((ref)=>ref.id === nodeRef.id)}})
        const insertAfter   = ()=> setState({...state, hoveredViewNode: {parent: parentRef, depth, position: state.definition[parentRef.ref][parentRef.id].children.filter((ref)=> ref.id !== state.draggedComponentView.id).findIndex((ref)=>ref.id === nodeRef.id) + 1}})
        const insertAsFirst = ()=> setState({...state, hoveredViewNode: {parent: nodeRef, depth: depth+1, position: 0}})
        const insertAsLast = ()=> setState({...state, hoveredViewNode: {parent: {ref: 'vNodeBox', id: '_rootNode'}, depth: 1, position: state.definition['vNodeBox']['_rootNode'].children.length}})
        const insertAt = (toPutRef, index)=> setState({...state, hoveredViewNode: {parent: toPutRef, depth: depth-1, position: index+1}})

        if(nodeRef.id === state.draggedComponentView.id){
            const parent = state.definition[parentRef.ref][parentRef.id]
            // check if the last child, if yes, go to grandparent and drop there after parent
            if(parent.children[parent.children.length - 1].id === nodeRef.id){
                if(parentRef.id !== '_rootNode') {
                    const grandparent = state.definition[parent.parent.ref][parent.parent.id]
                    const parentPosition = grandparent.children.findIndex((childRef)=> childRef.id === parentRef.id)
                    return insertAt(parent.parent, parentPosition)
                }
            }
            return setState({...state, hoveredViewNode: null,})
        }
        if(nodeRef.id === '_rootNode'){
            return insertAsFirst()
        }
        if(nodeRef.id === '_lastNode'){
            return insertAsLast()
        }
        // pray to god that you did not make a mistake here
        if(state.definition[nodeRef.ref][nodeRef.id].children){ // if box
            if(state.viewFoldersClosed[nodeRef.id] || state.definition[nodeRef.ref][nodeRef.id].children.length === 0){ // if closed or empty box
                if(hitPosition < 0.3){
                    insertBefore()
                } else {
                    if(!openBoxTimeout){
                        openBoxTimeout = setTimeout(()=>VIEW_FOLDER_CLICKED(nodeRef.id, false), 500)
                    }
                    insertAsFirst()
                    return
                }
            } else { // open box
                if(hitPosition < 0.5){
                    insertBefore()
                } else {
                    insertAsFirst()
                }
            }
        } else { // simple node
            if(hitPosition < 0.5){
                insertBefore()
            } else {
                insertAfter()
            }
        }
        if(openBoxTimeout){
            clearTimeout(openBoxTimeout)
            openBoxTimeout = null
        }
    }

    function PIPE_HOVERED(pipeRef, e) {
        if(!state.draggedComponentStateId){
            return;
        }
        setState({...state, hoveredPipe: pipeRef})
    }

    function COMPONENT_VIEW_DRAGGED(e) {
        const initialX = e.touches ? e.touches[0].pageX : e.pageX
        const initialY = e.touches ? e.touches[0].pageY : e.pageY
        const position = this.elm.getBoundingClientRect()
        const offsetX = initialX - position.left
        const offsetY = initialY - position.top

        function drag(e) {
            e.preventDefault()
            const x = e.touches ? e.touches[0].pageX : e.pageX
            const y = e.touches ? e.touches[0].pageY : e.pageY
            setState({
                ...state,
                componentEditorPosition: {x: x - offsetX, y: y - offsetY}
            })
        }
        window.addEventListener('mousemove', drag)
        window.addEventListener('touchmove', drag)
        function stopDragging(event) {
            event.preventDefault()
            window.removeEventListener('mousemove', drag)
            window.removeEventListener('touchmove', drag)
            window.removeEventListener('mouseup', stopDragging)
            window.removeEventListener('touchend', stopDragging)
        }
        window.addEventListener('mouseup', stopDragging)
        window.addEventListener('touchend', stopDragging)
    }
    function WIDTH_DRAGGED(widthName, e) {
        e.preventDefault()
        function resize(e){
            e.preventDefault()
            // TODO refactor
            let newWidth = window.innerWidth - (e.touches? e.touches[0].pageX: e.pageX)
            if(widthName === 'editorLeftWidth'){
                newWidth = e.touches? e.touches[0].pageX: e.pageX
            }
            if(widthName === 'subEditorWidth'){
                newWidth = (e.touches? e.touches[0].pageX: e.pageX) - state.componentEditorPosition.x
            }
            if(widthName === 'subEditorWidthLeft'){
                newWidth = state.componentEditorPosition.x + state.subEditorWidth - (e.touches? e.touches[0].pageX: e.pageX)
                if(newWidth < 250){
                    return
                }
                return setState({...state, subEditorWidth: newWidth, componentEditorPosition: {...state.componentEditorPosition, x: e.touches? e.touches[0].pageX: e.pageX}})
            }
            // I probably was drunk
            if(widthName !== 'subEditorWidth' && widthName !== 'subEditorWidth' && ( (widthName === 'editorLeftWidth' ? state.leftOpen: state.rightOpen) ? newWidth < 180: newWidth > 180)){
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

    function STATE_DRAGGED(stateId, e) {
        e.preventDefault()
        const initialX = e.touches? e.touches[0].pageX: e.pageX
        const initialY = e.touches? e.touches[0].pageY: e.pageY
        const position = this.elm.getBoundingClientRect()
        const offsetX = initialX - position.left
        const offsetY = initialY - position.top
        function drag(e){
            e.preventDefault()
            const x = e.touches? e.touches[0].pageX: e.pageX
            const y = e.touches? e.touches[0].pageY: e.pageY
            if(!state.draggedComponentView){
                if(Math.abs(initialY-y) > 3){
                    setState({...state, draggedComponentStateId: stateId, mousePosition: {x: x - offsetX, y: y - offsetY}})
                }
            } else {
                setState({...state, mousePosition: {x: x - offsetX, y: y - offsetY}})
            }
            return false
        }
        window.addEventListener('mousemove', drag)
        window.addEventListener('touchmove', drag)
        function stopDragging(event){
            event.preventDefault()
            window.removeEventListener('mousemove', drag)
            window.removeEventListener('touchmove', drag)
            window.removeEventListener('mouseup', stopDragging)
            window.removeEventListener('touchend', stopDragging)
            if(!state.draggedComponentStateId) {
                return STATE_NODE_SELECTED(stateId)
            }
            if(!state.hoveredPipe && !state.hoveredEvent) {
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                })
            }
            if(state.hoveredEvent){
                // check if event already changes the state
                if(state.definition.state[state.draggedComponentStateId].mutators.map(mutatorRef=>state.definition.mutator[mutatorRef.id].event.id).filter(eventid=>eventid === state.hoveredEvent.id).length){
                    return setState({
                        ...state,
                        draggedComponentStateId: null,
                        hoveredEvent: null,
                    })
                }
                const mutatorId = uuid()
                const pipeId = uuid()
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredEvent: null,
                    definition: {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [pipeId]: {
                                type: state.definition.state[state.draggedComponentStateId].type,
                                value: {ref: 'state', id: state.draggedComponentStateId},
                                transformations: []
                            }
                        },
                        state: {
                            ...state.definition.state,
                            [state.draggedComponentStateId]: {
                                ...state.definition.state[state.draggedComponentStateId],
                                mutators: state.definition.state[state.draggedComponentStateId].mutators.concat({ref: 'mutator', id:mutatorId})
                            }
                        },
                        mutator: {
                            ...state.definition.mutator,
                            [mutatorId]: {
                                event: state.hoveredEvent,
                                state: {ref: 'state', id: state.draggedComponentStateId},
                                mutation: {ref: 'pipe', id: pipeId}
                            }
                        },
                        event: {
                            ...state.definition.event,
                            [state.hoveredEvent.id]: {
                                ...state.definition.event[state.hoveredEvent.id],
                                mutators: state.definition.event[state.hoveredEvent.id].mutators.concat({ref: 'mutator', id:mutatorId})
                            }
                        }
                    }
                })
            }
            const pipeDropped = state.definition.pipe[state.hoveredPipe.id]
            if(pipeDropped.type === 'text'){
                if(state.definition.pipe[state.hoveredPipe.id].value.ref && state.definition.pipe[state.hoveredPipe.id].value.ref === 'state'){
                    return setState({
                        ...state,
                        draggedComponentStateId: null,
                        hoveredPipe: null,
                        definition : {
                            ...state.definition,
                            pipe: {
                                ...state.definition.pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definition.pipe[state.hoveredPipe.id],
                                    value: {ref: 'state', id:state.draggedComponentStateId},
                                    transformations: []
                                },
                            },
                        }
                    })
                }
                const joinIdState = uuid()
                const joinIdText = uuid()
                const pipeIdState = uuid()
                const pipeIdText = uuid()
                setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition : {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                transformations: [{ref: 'join', id: joinIdState}, {ref: 'join', id: joinIdText}].concat(state.definition.pipe[state.hoveredPipe.id].transformations)
                            },
                            [pipeIdState]: {
                                type: 'text',
                                value: {ref: 'state', id:state.draggedComponentStateId},
                                transformations: []
                            },
                            [pipeIdText]: {
                                type: 'text',
                                value: '',
                                transformations: []
                            },
                        },
                        join: {
                            ...state.definition.join,
                            [joinIdState]: {
                                value: {ref: 'pipe', id: pipeIdState}
                            },
                            [joinIdText]: {
                                value: {ref: 'pipe', id: pipeIdText}
                            },
                        },
                    }
                })
            }
            if(pipeDropped.type === 'number'){
                // you can't drop boolean into number
                if(state.definition.state[state.draggedComponentStateId].type === 'boolean'){
                    return setState({
                        ...state,
                        draggedComponentStateId: null,
                        hoveredPipe: null,
                    })
                }
                // you can't drop boolean into number
                if(state.definition.state[state.draggedComponentStateId].type === 'text'){
                    return setState({
                        ...state,
                        draggedComponentStateId: null,
                        hoveredPipe: null,
                        definition : {
                            ...state.definition,
                            pipe: {
                                ...state.definition.pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definition.pipe[state.hoveredPipe.id],
                                    value: {ref: 'state', id:state.draggedComponentStateId},
                                    transformations: [{
                                        ref: 'length',
                                        id: 'noop'
                                    }]
                                },
                            },
                        }
                    })
                }
                setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition : {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                value: {ref: 'state', id:state.draggedComponentStateId}
                            },
                        },
                    }
                })
            }
            if(pipeDropped.type === 'boolean'){
                if(state.definition.state[state.draggedComponentStateId].type === 'number'){
                    const eqId = uuid()
                    const pipeId = uuid()
                    return setState({
                        ...state,
                        draggedComponentStateId: null,
                        hoveredPipe: null,
                        definition : {
                            ...state.definition,
                            pipe: {
                                ...state.definition.pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definition.pipe[state.hoveredPipe.id],
                                    value: {ref: 'state', id:state.draggedComponentStateId},
                                    transformations: [{
                                        ref: 'equal',
                                        id: eqId
                                    }]
                                },
                                [pipeId]: {
                                    type: 'number',
                                    value: 0,
                                    transformations: [],
                                }
                            },
                            equal: {
                                ...state.definition.equal,
                                [eqId]: {
                                    value: {
                                        ref: 'pipe',
                                        id: pipeId
                                    }
                                },
                            },
                        }
                    })
                }
                // you can't drop boolean into number
                if(state.definition.state[state.draggedComponentStateId].type === 'text'){
                    const eqId = uuid()
                    const pipeId = uuid()
                    return setState({
                        ...state,
                        draggedComponentStateId: null,
                        hoveredPipe: null,
                        definition : {
                            ...state.definition,
                            pipe: {
                                ...state.definition.pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definition.pipe[state.hoveredPipe.id],
                                    value: {ref: 'state', id:state.draggedComponentStateId},
                                    transformations: [{
                                        ref: 'equal',
                                        id: eqId
                                    }]
                                },
                                [pipeId]: {
                                    type: 'text',
                                    value: 'Default text',
                                    transformations: [],
                                }
                            },
                            equal: {
                                ...state.definition.equal,
                                [eqId]: {
                                    value: {
                                        ref: 'pipe',
                                        id: pipeId
                                    }
                                },
                            },
                        }
                    })
                }
                setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition : {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                value: {ref: 'state', id:state.draggedComponentStateId}
                            },
                        },
                    }
                })
            }
        }
        window.addEventListener('mouseup', stopDragging)
        window.addEventListener('touchend', stopDragging)
    }
    function OPEN_SIDEBAR(side) {
        if(side === 'left'){
            return setState({...state, leftOpen: !state.leftOpen})
        }
        if(side === 'right'){
            return setState({...state, rightOpen: !state.rightOpen})
        }
    }
    function FREEZER_CLICKED() {
        setState({...state, appIsFrozen: !state.appIsFrozen})
    }
    function VIEW_FOLDER_CLICKED(nodeId, forcedValue) {
        setState({...state, viewFoldersClosed:{...state.viewFoldersClosed, [nodeId]: forcedValue !== undefined ? forcedValue : !state.viewFoldersClosed[nodeId]}})
    }
    function VIEW_NODE_SELECTED(ref) {
        setState({...state, selectedViewNode:ref})
    }
    function UNSELECT_VIEW_NODE(selfOnly, stopPropagation, e) {
        if(stopPropagation){
            e.stopPropagation()
        }
        if(selfOnly && e.target !== this.elm){
            return
        }
        setState({...state, selectedViewNode:{}})
    }
    function STATE_NODE_SELECTED(nodeId) {
        setState({...state, selectedStateNodeId:nodeId})
    }
    function UNSELECT_STATE_NODE(e) {
        if(e.target === this.elm){
            setState({...state, selectedStateNodeId:''})
        }
    }
    function ADD_NODE(nodeRef, type) {
        if(!nodeRef.ref || !state.definition[nodeRef.ref][nodeRef.id] || !state.definition[nodeRef.ref][nodeRef.id].children){
            if(state.selectedViewNode.id && state.selectedViewNode.id !== '_rootNode'){
                nodeRef = state.definition[state.selectedViewNode.ref][state.selectedViewNode.id].parent
            } else {
                nodeRef = {ref: 'vNodeBox', id: '_rootNode'}
            }
        }
        const nodeId = nodeRef.id
        const newNodeId = uuid()
        const newStyleId = uuid()
        const newStyle = {
        }
        if(type === 'box') {
            const newNode = {
                title: 'box',
                parent: nodeRef,
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
                parent: nodeRef,
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
        if(type === 'image'){
            const pipeId = uuid()
            const newNode = {
                title: 'image',
                parent: nodeRef,
                style: {ref:'style', id:newStyleId},
                src: {ref:'pipe', id:pipeId}
            }
            const newPipe = {
                type: 'text',
                value: 'https://www.ugnis.com/images/logo256x256.png',
                transformations: []
            }
            return setState({
                ...state,
                selectedViewNode: {ref:'vNodeImage', id: newNodeId},
                definition: {
                    ...state.definition,
                    pipe: {...state.definition.pipe, [pipeId]: newPipe},
                    [nodeRef.ref]: {...state.definition[nodeRef.ref], [nodeId]: {...state.definition[nodeRef.ref][nodeId], children: state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeImage', id:newNodeId})}},
                    vNodeImage: {...state.definition.vNodeImage, [newNodeId]: newNode},
                    style: {...state.definition.style, [newStyleId]: newStyle},
                }})
        }
        if(type === 'if'){
            const pipeId = uuid()
            const newNode = {
                title: 'conditional',
                parent: nodeRef,
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
                parent: nodeRef,
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
            'flex': '1 1 auto',
            'justifyContent': 'center',
            'alignItems': 'center',
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
    function DELETE_SELECTED_VIEW(nodeRef, parentRef) {
        if(nodeRef.id === '_rootNode'){
            if(state.definition.vNodeBox['_rootNode'].children.length === 0){
                return;
            }
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
    function SELECT_PIPE(pipeId, e) {
        e.stopPropagation()
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
    function SAVE_DEFAULT(stateId) {
        setState({...state, definition:{
            ...state.definition,
            state: {
                ...state.definition.state,
                [stateId]: {
                    ...state.definition.state[stateId],
                    defaultValue: app.getCurrentState()[stateId]
                }
            }
        }})
    }
    function DELETE_STATE(stateId) {
        const {[stateId]: deletedState, ...newState} = state.definition.state
        setState({...state, definition:{
            ...state.definition,
            state: newState,
            nameSpace: {
                ...state.definition.nameSpace,
                '_rootNameSpace': {
                    ...state.definition.nameSpace['_rootNameSpace'],
                    children: state.definition.nameSpace['_rootNameSpace'].children.filter((ref)=> ref.id !== stateId)
                }
            }
        }})
    }
    function EVENT_HOVERED(eventRef) {
        setState({
            ...state,
            hoveredEvent: eventRef
        })
    }
    function EVENT_UNHOVERED() {
        if(state.hoveredEvent){
            setState({
                ...state,
                hoveredEvent: null
            })
        }
    }

    const boxIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'layers')
    const ifIcon = () => h('i', {attrs: {class: 'material-icons'}, style: {transform: 'rotate(90deg)'}}, 'call_split')
    const numberIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'looks_one')
    const listIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'view_list')
    const inputIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'input')
    const textIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'text_fields')
    const deleteIcon = () => h('i', {attrs: {class: 'material-icons', 'data-trashcan': true}}, 'delete_forever')
    const clearIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'clear')
    const folderIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'folder')
    const saveIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'check')
    const imageIcon = () => h('i', {attrs: {class: 'material-icons'}}, 'image')
    const appIcon = () => h('i', {attrs: {class: 'material-icons'}, style: { fontSize: '18px'}}, 'description')
    const arrowIcon = (rotate) => h('i', {attrs: {class: 'material-icons', 'data-closearrow': true}, style: {transition: 'all 0.2s', transform: rotate ? 'rotate(-90deg)' : 'rotate(0deg)', cursor: 'pointer'}}, 'expand_more')

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
        const openComponentLeft = h('div', {
            on: {
                mousedown: [OPEN_SIDEBAR, 'left'],
                touchstart: [OPEN_SIDEBAR, 'left'],
            },
            style: {
                position: 'absolute',
                right: '-3px',
                top: '50%',
                transform: 'translateZ(0) translateX(100%) translateY(-50%)',
                width: '15px',
                height: '10%',
                textAlign: 'center',
                fontSize: '1em',
                borderRadius: '0 5px 5px 0',
                background: '#5d5d5d',
                boxShadow: 'inset 0 0 2px 7px #222',
                cursor: 'pointer',
            },
        })
        const openComponentRight = h('div', {
            on: {
                mousedown: [OPEN_SIDEBAR, 'right'],
                touchstart: [OPEN_SIDEBAR, 'right'],
            },
            style: {
                position: 'absolute',
                left: '-3px',
                top: '50%',
                transform: 'translateZ(0) translateX(-100%) translateY(-50%)',
                width: '15px',
                height: '10%',
                textAlign: 'center',
                fontSize: '1em',
                borderRadius: '5px 0 0 5px',
                background: '#5d5d5d',
                boxShadow: 'inset 0 0 2px 7px #222',
                cursor: 'pointer',
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
        const dragSubComponentRight = h('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'subEditorWidth'],
                touchstart: [WIDTH_DRAGGED, 'subEditorWidth'],
            },
            style: {
                position: 'absolute',
                right: '2px',
                transform: 'translateX(100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: 0,
                cursor: 'col-resize',
            },
        })
        const dragSubComponentLeft = h('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'subEditorWidthLeft'],
                touchstart: [WIDTH_DRAGGED, 'subEditorWidthLeft'],
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
                        return h('span', {}, [emberEditor(transformer.value, transType)])
                    }
                    if (transRef.ref === 'toUpperCase') {
                        return h('div', {}, [
                            h('div', {style: {cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1', color: '#bdbdbd'}}, transRef.ref)]),
                        ])
                    }
                    if (transRef.ref === 'toLowerCase') {
                        return h('div', {}, [
                            h('div', {style: {cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1', color: '#bdbdbd'}}, transRef.ref)]),
                        ])
                    }
                    if (transRef.ref === 'length') {
                        return h('div', {}, [
                            h('div', {style: {cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1', color: '#bdbdbd'}}, transRef.ref)]),
                        ])
                    }
                })
            }

            function genTransformators() {
                const selectedPipe = state.definition.pipe[state.selectedPipeId]
                return [h('span')] // TODO rethink
                return [h('div', {style: {
                    position: 'fixed',
                    top: state.componentEditorPosition.y + 'px',
                    left: state.componentEditorPosition.x - 307 + 'px',
                    height: '50%',
                    width: '300px',
                    display: 'flex',
                }}, [
                    h('div',{style: {border: '3px solid #222', flex: '1 1 0%', background: '#4d4d4d', marginBottom: '10px'}}, [
                        h('div', {style: {
                            display: 'flex',
                            cursor: 'default',
                            alignItems: 'center',
                            background: '#222',
                            paddingTop: '2px',
                            paddingBottom: '5px',
                            color: '#53B2ED',
                            minWidth: '100%',
                        },}, [
                            h('span', {style: {flex: '5 5 auto', margin: '0 5px', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '0.8em'}}, 'Ugnis Toolbox'),
                            h('span', {style: {flex: '0 0 auto', marginLeft: 'auto', cursor: 'pointer', marginRight: '5px', color: 'white', display: 'inline-flex'}, on: {mousedown: [SELECT_PIPE, ''], touchstart: [SELECT_PIPE, '']}}, [clearIcon()]),
                        ]),

                    ]),
                ])]
            }
            if (typeof pipe.value === 'string') {
                return h('div', {style: {position: 'relative'}}, [h('div', {style:{display:'flex', alignItems: 'baseline'}, on: {click: [SELECT_PIPE, ref.id]}}, [
                    h('span', {style: {flex: '0 0 auto', position: 'relative', transform: 'translateZ(0)'}}, [
                        h('span', {style: {opacity: '0', display: 'inline-block', whiteSpace: 'pre', padding: '0 5px 2px 5px', borderBottom: '2px solid white'}}, pipe.value),
                        h('input', {
                            attrs: {
                                type: 'text'
                            },
                            style: {
                                color: 'white',
                                outline: 'none',
                                boxShadow: 'none',
                                textAlign: 'center',
                                display: 'inline',
                                border: 'none',
                                borderBottom: '2px solid white',
                                background: 'none',
                                font: 'inherit',
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                flex: '0 0 auto',
                            },
                            on: {
                                input: [CHANGE_STATIC_VALUE, ref, 'value', 'text'],
                                mousemove: [PIPE_HOVERED, ref],
                            },
                            liveProps: {
                                value: pipe.value,
                            },
                        }),
                    ]),
                    ...listTransformations(pipe.transformations, pipe.type),
                ]),
                    h('div', state.selectedPipeId === ref.id ? genTransformators(): [])
                ])
            }

            if (pipe.value === true || pipe.value === false) {
                return h('select', {liveProps: {value:  pipe.value.toString()}, style: {},  on: {click: [SELECT_PIPE, ref.id], input: [CHANGE_STATIC_VALUE, ref, 'value', 'boolean'], mousemove: [PIPE_HOVERED, ref]}}, [
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
                                mousemove: [PIPE_HOVERED, ref]
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
                return h('div', {style: {position: 'relative', cursor: 'pointer'}}, [h('div', {style:{display:'flex', alignItems: 'center'}, on: {click: [SELECT_PIPE, ref.id], mousemove: [PIPE_HOVERED, ref]}}, [
                    h('div', {style: {flex: '1'}},
                        [
                            h('span', {style: {whiteSpace: 'nowrap',flex: '0 0 auto', display: 'inline-block', position: 'relative', transform: 'translateZ(0)', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === pipe.value.id? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                                h('span', {style: {color: 'white', display: 'inline-block'}, on: {click: [STATE_NODE_SELECTED, pipe.value.id]}}, displState.title),
                            ]),
                        ]
                    ),
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
                    h('span', {style: {display: 'flex', flexWrap: 'wrap', marginTop: '6px'}}, [
                        h('span', {style: {flex: '0 0 auto',  position: 'relative', transform: 'translateZ(0)', margin: '0 7px 0 0',  boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                            h('span', {style: {opacity: state.editingTitleNodeId === stateId ? '0': '1', color: 'white', display: 'inline-block'}, on: {mousedown: [STATE_DRAGGED, stateId], touchstart: [STATE_DRAGGED, stateId], touchmove: [HOVER_MOBILE], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, currentState.title),
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
                                boxShadow: 'inset 0 -2px 0 0 ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#828282')
                            }
                            if(currentState.type === 'text') return h('input', {attrs: {type: 'text'}, liveProps: {value: currentRunningState[stateId]}, style: noStyleInput, on: {input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId]}})
                            if(currentState.type === 'number') return h('input', {attrs: {type: 'number'}, liveProps: {value: currentRunningState[stateId]}, style: noStyleInput,  on: {input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId]}})
                            if(currentState.type === 'boolean') return h('select', {liveProps: {value: currentRunningState[stateId].toString()}, style: noStyleInput,  on: {input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId]}}, [
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
                        currentState.type !== 'table' && currentRunningState[stateId] !== state.definition.state[stateId].defaultValue ? h('div', {style: {display: 'inline-flex', alignSelf: 'center'}, on: {click: [SAVE_DEFAULT, stateId]}}, [saveIcon()]): h('span'),
                        state.selectedStateNodeId === stateId && currentState.type !== 'table' ? h('div', {style: {display: 'inline-flex', alignSelf: 'center'}, on: {click: [DELETE_STATE, stateId]}}, [deleteIcon()]): h('span')
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
                                        h('span', {style: {flex: '0 0 auto', margin: '0 3px 0 5px', display: 'inline-flex'}}, [
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

        function fakeState(stateId) {
            const currentState = state.definition.state[stateId]
            return h('span', {style: {flex: '0 0 auto',  position: 'relative', transform: 'translateZ(0)', margin: '7px 7px 0 0',  boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                h('span', {style: {color: 'white', display: 'inline-block'}}, currentState.title),
            ])
        }

        const stateComponent = h('div', { attrs: {class: 'better-scrollbar'}, style: {overflow: 'auto', flex: '1', padding: '0 10px'}, on: {click: [UNSELECT_STATE_NODE]}}, state.definition.nameSpace['_rootNameSpace'].children.map((ref)=> listState(ref.id)))

        function listNode(nodeRef, parentRef, depth){
            if(nodeRef.id === '_rootNode') return listRootNode(nodeRef)
            if(nodeRef.ref === 'vNodeText') return simpleNode(nodeRef, parentRef, depth)
            if(nodeRef.ref === 'vNodeImage') return simpleNode(nodeRef, parentRef, depth)
            if(nodeRef.ref === 'vNodeBox' || nodeRef.ref === 'vNodeList' || nodeRef.ref === 'vNodeIf') return listBoxNode(nodeRef, parentRef, depth)
            if(nodeRef.ref === 'vNodeInput') return simpleNode(nodeRef, parentRef, depth)
        }

        function prevent_bubbling(e) {
            e.stopPropagation()
        }
        function editingNode(nodeRef) {
            return h('input', {
                style: {
                    border: 'none',
                    height: '26px',
                    background: 'none',
                    color: '#53B2ED',
                    outline: 'none',
                    flex: '1',
                    padding: '0',
                    boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                    font: 'inherit',
                    paddingLeft: '2px',
                },
                on: {
                    mousedown: prevent_bubbling,
                    input: [CHANGE_VIEW_NODE_TITLE, nodeRef],
                },
                liveProps: {
                    value: state.definition[nodeRef.ref][nodeRef.id].title,
                },
                attrs: {
                    autofocus: true,
                    'data-istitleeditor': true
                }
            })
        }

        function listRootNode(nodeRef) {
            const nodeId = nodeRef.id
            const node = state.definition[nodeRef.ref][nodeId]
            return h('div', {
                    style: {
                        position: 'relative',
                    },
                }, [
                    h('div', {style: {
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        background: '#444',
                        borderTop: '2px solid #4d4d4d',
                        borderBottom: '2px solid #333',
                        height: '26px',
                        whiteSpace: 'nowrap',
                    },
                        on: {mousemove: [VIEW_HOVERED, nodeRef, {}, 1], touchmove: [HOVER_MOBILE]}
                    },  [
                        h('span', {key: nodeId, style: {color: state.selectedViewNode.id === nodeId ? '#53B2ED': '#bdbdbd', display: 'inline-flex'}, on: {click: [VIEW_NODE_SELECTED, nodeRef]}}, [
                            appIcon()
                        ]),
                        state.editingTitleNodeId === nodeId ?
                            editingNode(nodeRef):
                            h('span', { style: {flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s', paddingLeft: '2px'}, on: {click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}}, node.title),
                    ]),
                    h('div', state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId && !(node.children.findIndex((ref)=> ref.id === state.draggedComponentView.id) === state.hoveredViewNode.position) ?
                        (()=>{
                            // copy pasted from listBoxNode
                            const oldPosition = node.children.findIndex((ref)=> ref.id === state.draggedComponentView.id)
                            const newPosition = oldPosition === -1 || state.hoveredViewNode.position < oldPosition ? state.hoveredViewNode.position : state.hoveredViewNode.position + 1
                            const children = node.children.map((ref)=>listNode(ref, nodeRef, 1))
                            return children.slice(0, newPosition).concat(spacerComponent(), children.slice(newPosition))
                        })():
                        node.children.map((ref)=>listNode(ref, nodeRef, 1))
                    ),
                    h('div', {style: {
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            height: '15px',
                        },
                            on: {mousemove: [VIEW_HOVERED, {id: '_lastNode'}, {}, 1], touchmove: [HOVER_MOBILE]}}
                    ),
                ]
            )
        }

        function listBoxNode(nodeRef, parentRef, depth) {
            const nodeId = nodeRef.id
            const node = state.definition[nodeRef.ref][nodeId]
            return h('div', {style: {
                    opacity: state.draggedComponentView && state.draggedComponentView.id === nodeId ? '0.5' : '1.0',
                }}, [
                    h('div', {
                        key: nodeId,
                        style: {
                            display: 'flex',
                            height: '26px',
                            position: 'relative',
                            alignItems: 'center',
                            paddingLeft: (depth - (node.children.length > 0 || (state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId) ? 1: 0)) *20 + 8+ 'px',
                            paddingRight: '8px',
                            background: '#444',
                            borderTop: '2px solid #4d4d4d',
                            borderBottom: '2px solid #333',
                            whiteSpace: 'nowrap',
                            color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white'
                        },
                        on: {mousedown: [VIEW_DRAGGED, nodeRef, parentRef, depth], touchstart: [VIEW_DRAGGED, nodeRef, parentRef, depth], mousemove: [VIEW_HOVERED, nodeRef, parentRef, depth], touchmove: [HOVER_MOBILE]}}, [
                        node.children.length > 0 || (state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId) ? h('span', {style: {display: 'inline-flex'}}, [arrowIcon(state.viewFoldersClosed[nodeId] || (state.draggedComponentView && nodeId === state.draggedComponentView.id))]): h('span'),
                        h('span', {key: nodeId, style: {display: 'inline-flex', color: state.selectedViewNode.id === nodeId ? '#53B2ED': '#bdbdbd', transition: 'color 0.2s'}}, [
                            nodeRef.ref === 'vNodeBox' ? boxIcon() :
                                nodeRef.ref === 'vNodeList' ? listIcon() :
                                    ifIcon()
                        ]),
                        state.editingTitleNodeId === nodeId ?
                            editingNode(nodeRef):
                            h('span', { style: {flex: '1', cursor: 'pointer', transition: 'color 0.2s', paddingLeft: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}, on: {dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}}, node.title),
                        h('div', {style: {color: '#53B2ED', cursor: 'pointer', display: state.selectedViewNode.id === nodeId ? 'inline-flex': 'none', flex: '0 0 auto'}}, [deleteIcon()]),
                    ]),
                    h('div', {
                            style: { display: state.viewFoldersClosed[nodeId] || (state.draggedComponentView && nodeId === state.draggedComponentView.id) ? 'none': 'block'},
                        }, state.hoveredViewNode && state.hoveredViewNode.parent.id === nodeId && !(node.children.findIndex((ref)=> ref.id === state.draggedComponentView.id) === state.hoveredViewNode.position) ?
                            (()=>{
                                // adds a fake component
                                const oldPosition = node.children.findIndex((ref)=> ref.id === state.draggedComponentView.id) // this is needed because we still show the old node
                                const newPosition = oldPosition === -1 || state.hoveredViewNode.position < oldPosition ? state.hoveredViewNode.position : state.hoveredViewNode.position + 1
                                const children = node.children.map((ref)=>listNode(ref, nodeRef, depth+1))
                                return children.slice(0, newPosition).concat(spacerComponent(), children.slice(newPosition))
                            })():
                            node.children.map((ref)=>listNode(ref, nodeRef, depth+1))
                    ),
                ]
            )
        }
        function simpleNode(nodeRef, parentRef, depth) {
            const nodeId = nodeRef.id
            const node = state.definition[nodeRef.ref][nodeId]
            return h('div', {
                    key: nodeId,
                    style: {
                        cursor: 'pointer',
                        opacity: state.draggedComponentView && state.draggedComponentView.id === nodeId ? '0.5' : '1.0',
                        position: 'relative',
                        height: '26px',
                        paddingLeft: depth *20 + 8 +'px',
                        paddingRight: '8px',
                        background: '#444',
                        borderTop: '2px solid #4d4d4d',
                        borderBottom: '2px solid #333',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        color: state.selectedViewNode.id === nodeId ? '#53B2ED': '#bdbdbd',
                    },
                    on: {mousedown: [VIEW_DRAGGED, nodeRef, parentRef, depth], touchstart: [VIEW_DRAGGED, nodeRef, parentRef, depth], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId], mousemove: [VIEW_HOVERED, nodeRef, parentRef, depth], touchmove: [HOVER_MOBILE]}
                }, [
                    nodeRef.ref === 'vNodeInput' ? inputIcon() :
                        nodeRef.ref === 'vNodeImage' ? imageIcon() :
                            textIcon(),
                    state.editingTitleNodeId === nodeId ?
                        editingNode(nodeRef):
                        h('span', {style: {flex: '1', color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s', paddingLeft: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}, node.title),
                    h('div', {style: {color: '#53B2ED', cursor: 'pointer', display: state.selectedViewNode.id === nodeId ? 'inline-flex': 'none', flex: '0 0 auto'}}, [deleteIcon()]),
                ]
            )
        }

        function spacerComponent(){
            return h('div', {
                key: 'spacer',
                style: {
                    cursor: 'pointer',
                    height: '6px',
                    boxShadow: 'inset 0 0 1px 1px #53B2ED',
                },
            })
        }
        function fakeComponent(nodeRef, depth,) {
            const nodeId = nodeRef.id
            const node = state.definition[nodeRef.ref][nodeId]
            return h('div', {
                    key: '_fake'+nodeId,
                    style: {
                        cursor: 'pointer',
                        transition: 'padding-left 0.2s',
                        height: '26px',
                        paddingLeft: (depth - (node.children && node.children.length > 0 ? 1: 0)) *20 + 8 +'px',
                        paddingRight: '8px',
                        background: 'rgba(68,68,68,0.8)',
                        borderTop: '2px solid #4d4d4d',
                        borderBottom: '2px solid #333',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        color: state.selectedViewNode.id === nodeId ? '#53B2ED': '#bdbdbd',
                    },
                }, [
                    (nodeRef.ref === 'vNodeBox' || nodeRef.ref === 'vNodeList' || nodeRef.ref === 'vNodeIf') && node.children.length > 0  ? arrowIcon(true): h('span', {key: '_fakeSpan'+nodeId}),
                    nodeRef.ref === 'vNodeBox' ? boxIcon() :
                        nodeRef.ref === 'vNodeList' ? listIcon() :
                            nodeRef.ref === 'vNodeIf' ? ifIcon():
                                nodeRef.ref === 'vNodeInput' ? inputIcon() :
                                    nodeRef.ref === 'vNodeImage' ? imageIcon() :
                                        textIcon(),
                    h('span', {style: {flex: '1', color: state.selectedViewNode.id === nodeId ? '#53B2ED': 'white', transition: 'color 0.2s', paddingLeft: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}, node.title),
                ]
            )
        }

        function generateEditNodeComponent() {
            const styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'flex', 'justifyContent', 'alignItems', 'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'right', 'position', 'overflow', 'font', 'margin', 'padding']
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
                    return h('div', {style: {overflow: 'auto'}, attrs: {"class": 'better-scrollbar'}}, [
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
                if (state.selectedViewNode.ref === 'vNodeImage') {
                    return h('div', {style: {overflow: 'auto'}, attrs: {"class": 'better-scrollbar'}}, [
                        h('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [
                            h('span', {style: {flex: '1'}}, 'source (url)'),
                            h('div', {style: {flex: '0', cursor: 'default', color: '#bdbdbd'}}, 'text')
                        ]),
                        h('div', {style: {padding: '5px 10px'}}, [emberEditor(selectedNode.src, 'text')])
                    ])
                }
                if (state.selectedViewNode.ref === 'vNodeInput') {
                    return h('div', {style: {overflow: 'auto'}, attrs: {"class": 'better-scrollbar'}}, [
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
                    return h('div', {style: {overflow: 'auto'}, attrs: {"class": 'better-scrollbar'}}, [
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
                    return h('div', {style: {overflow: 'auto'}, attrs: {"class": 'better-scrollbar'}}, [
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
                                return h('div', {on: {mouseover: [EVENT_HOVERED, selectedNode[eventDesc.propertyName]], mouseout: [EVENT_UNHOVERED]}}, [
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
                                            return h('div', {style: {marginTop: '10px', display: 'flex', alignItems: 'center'}}, [
                                                h('span', {style: {flex: '0 0 auto', display: 'inline-block', position: 'relative', transform: 'translateZ(0)', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === mutator.state.id ? '#eab65c': '#828282') , background: '#444', padding: '4px 7px',}}, [
                                                    h('span', {style: {color: 'white', display: 'inline-block'}, on: {click: [STATE_NODE_SELECTED, mutator.state.id]}}, stateDef.title),
                                                ]),
                                                h('span', {style: {color: '#8e8e8e', fontSize: '1.2em'}}, '‹–'),
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

            const fullVNode = ['vNodeBox','vNodeText', 'vNodeImage', 'vNodeInput'].includes(state.selectedViewNode.ref)

            return h('div', {
                style: {
                    position: 'fixed',
                    font: "300 1.2em 'Open Sans'",
                    lineHeight: '1.2em',
                    color: 'white',
                    left: state.componentEditorPosition.x + 'px',
                    top: state.componentEditorPosition.y + 'px',
                    height: '50%',
                    display: 'flex',
                    zIndex: '3000',
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
                        }, on: {
                            mousedown: [COMPONENT_VIEW_DRAGGED],
                            touchstart: [COMPONENT_VIEW_DRAGGED],
                        },}, [
                            h('span', {style: {flex: '0 0 auto', margin: '0 2px 0 5px', display: 'inline-flex'}}, [
                                state.selectedViewNode.id === '_rootNode' ? appIcon() :
                                    state.selectedViewNode.ref === 'vNodeBox' ? boxIcon() :
                                        state.selectedViewNode.ref === 'vNodeList' ? listIcon() :
                                            state.selectedViewNode.ref === 'vNodeList' ? ifIcon() :
                                                state.selectedViewNode.ref === 'vNodeInput' ? inputIcon() :
                                                    state.selectedViewNode.ref === 'vNodeImage' ? imageIcon() :
                                                        textIcon(),
                            ]),
                            h('span', {style: {flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '0.8em'}}, selectedNode.title),
                            h('span', {style: {flex: '0 0 auto', marginLeft: 'auto', cursor: 'pointer', marginRight: '5px', color: 'white', display: 'inline-flex'}, on: {mousedown: [UNSELECT_VIEW_NODE, false, true], touchstart: [UNSELECT_VIEW_NODE, false, true]}}, [clearIcon()]),
                        ])
                    ]),
                    fullVNode ? h('div', {style: { display: 'flex', flex: '0 0 auto', fontFamily: "'Comfortaa', sans-serif"}}, [propsComponent, styleComponent, eventsComponent]) : h('span'),
                    dragSubComponentRight,
                    dragSubComponentLeft,
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
            //h('span', {on: {click: [ADD_STATE, '_rootNameSpace', 'table']}}, [listIcon()]),
        ])


        const addViewNodeComponent = h('div', {style: { flex: '0 auto', marginLeft: state.rightOpen ? '-10px': '0', border: '3px solid #222', borderRight: 'none', background: '#333', height: '40px', display: 'flex', alignItems: 'center'}}, [
            h('span', {style: { fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', padding: '0 10px'}}, 'add component: '),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'box']}}, [boxIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'input']}}, [inputIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'text']}}, [textIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'image']}}, [imageIcon()]),
            h('span', {on: {click: [ADD_NODE, state.selectedViewNode, 'if']}}, [ifIcon()]),
        ])

        const viewComponent = h('div', {attrs: {class: 'better-scrollbar'}, style: {overflow: 'auto', position: 'relative', flex: '1', fontSize: '0.8em'}}, [
            listNode({ref: 'vNodeBox', id:'_rootNode'}, {}, 0),
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
                openComponentRight,
                addStateComponent,
                stateComponent,
                addViewNodeComponent,
                viewComponent,
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
            openComponentLeft,
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
                                h('span', {style: {flex: '0 0 auto', margin: '0 0 0 5px', display: 'inline-flex'}}, [
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
                //backgroundImage: 'radial-gradient(black 15%, transparent 16%), radial-gradient(black 15%, transparent 16%), radial-gradient(rgba(255, 255, 255, 0.0980392) 15%, transparent 20%), radial-gradient(rgba(255, 255, 255, 0.0980392) 15%, transparent 20%)',
                backgroundPositionX: '0px, 8px, 0px, 8px',
                backgroundPositionY: '0px, 8px, 1px, 9px',
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
                    zIndex: state.fullScreen ? '2000' : '100',
                    boxShadow: 'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',
                    position: 'fixed',
                    transition: 'all 0.5s',
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
            rightComponent,
            state.selectedViewNode.ref ? generateEditNodeComponent(): h('span')
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
            state.draggedComponentView ? h('div', {style: {fontFamily: "Open Sans", pointerEvents: 'none', position: 'fixed', top: state.mousePosition.y + 'px', left: state.mousePosition.x + 'px', lineHeight: '1.2em', fontSize: '1.2em', zIndex: '99999', width: state.editorRightWidth + 'px'}}, [h('div', {style: {overflow: 'auto', position: 'relative', flex: '1', fontSize: '0.8em'}}, [fakeComponent(state.draggedComponentView, state.hoveredViewNode ? state.hoveredViewNode.depth : state.draggedComponentView.depth)])]): h('span'),
            state.draggedComponentStateId ? h('div', {style: {fontFamily: "Open Sans", pointerEvents: 'none', position: 'fixed', top: state.mousePosition.y + 'px', left: state.mousePosition.x + 'px', lineHeight: '1.2em', fontSize: '16px', zIndex: '99999', width: state.editorRightWidth + 'px'}}, [fakeState(state.draggedComponentStateId)]): h('span'),
        ])

        node = patch(node, vnode)
        currentAnimationFrameRequest = null;
    }

    render()
}