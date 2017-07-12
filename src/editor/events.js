import emptyApp from '../_empty.json'
import { state, setState} from './state'

function moveInArray(array, moveIndex, toIndex) {
    let item = array[moveIndex]
    let length = array.length
    let diff = moveIndex - toIndex

    if (diff > 0) {
        return [...array.slice(0, toIndex), item, ...array.slice(toIndex, moveIndex), ...array.slice(moveIndex + 1, length)]
    } else if (diff < 0) {
        return [...array.slice(0, moveIndex), ...array.slice(moveIndex + 1, toIndex + 1), item, ...array.slice(toIndex + 1, length)]
    }
    return array
}

function uuid() {
    return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function() {
        return (0 | (Math.random() * 16)).toString(16)
    })
}

function generateEmptyApp(){
    return {...emptyApp, id: uuid()}
}

document.addEventListener('click', e => {
    // clicked outside
    if (state.editingTitleNodeId && !e.target.dataset.istitleeditor) {
        setState({ ...state, editingTitleNodeId: '' })
    }
})


document.addEventListener('keydown', e => {
    // 83 - s
    // 90 - z
    // 89 - y
    // 32 - space
    // 13 - enter
    // 27 - escape
    if (e.which === 32 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        FREEZER_CLICKED()
    }
    if (e.which === 13) {
        setState({ ...state, editingTitleNodeId: '' })
    }
    if (e.which === 27) {
        FULL_SCREEN_CLICKED(false)
    }
})

// Actions
let openBoxTimeout = null
export function VIEW_DRAGGED(nodeRef, parentRef, initialDepth, e) {
    e.preventDefault()
    const isArrow = e.target.dataset.closearrow
    const isTrashcan = e.target.dataset.trashcan
    const initialX = e.touches ? e.touches[0].pageX : e.pageX
    const initialY = e.touches ? e.touches[0].pageY : e.pageY
    const position = this.elm.getBoundingClientRect()
    const offsetX = initialX - position.left
    const offsetY = initialY - position.top
    function drag(e) {
        e.preventDefault()
        const x = e.touches ? e.touches[0].pageX : e.pageX
        const y = e.touches ? e.touches[0].pageY : e.pageY
        if (!state.draggedComponentView) {
            if (Math.abs(initialY - y) > 3) {
                setState({
                    ...state,
                    draggedComponentView: {
                        ...nodeRef,
                        depth: initialDepth,
                    },
                    mousePosition: { x: x - offsetX, y: y - offsetY },
                })
            }
        } else {
            setState({
                ...state,
                mousePosition: { x: x - offsetX, y: y - offsetY },
            })
        }
        return false
    }
    window.addEventListener('mousemove', drag)
    window.addEventListener('touchmove', drag)
    function stopDragging(event) {
        event.preventDefault()
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('touchmove', drag)
        window.removeEventListener('mouseup', stopDragging)
        window.removeEventListener('touchend', stopDragging)
        if (openBoxTimeout) {
            clearTimeout(openBoxTimeout)
            openBoxTimeout = null
        }
        if (!state.draggedComponentView) {
            if (event.target === e.target && isArrow) {
                return VIEW_FOLDER_CLICKED(nodeRef.id)
            }
            if (event.target === e.target && isTrashcan) {
                return DELETE_SELECTED_VIEW(nodeRef, parentRef)
            }
            return VIEW_NODE_SELECTED(nodeRef)
        }
        if (!state.hoveredViewNode) {
            return setState({ ...state, draggedComponentView: null })
        }
        const newParentRef = state.hoveredViewNode.parent
        // frame this somewhere on how not to write code
        const fixedParents = {
            ...state,
            draggedComponentView: null,
            hoveredViewNode: null,
            definition: parentRef.id === newParentRef.id
                ? {
                // moving in the same parent
                ...state.definition,
                [parentRef.ref]: {
                    ...state.definition[parentRef.ref],
                    [parentRef.id]: {
                        ...state.definition[parentRef.ref][parentRef.id],
                        children: moveInArray(state.definition[parentRef.ref][parentRef.id].children, state.definition[parentRef.ref][parentRef.id].children.findIndex(ref => ref.id === nodeRef.id), state.hoveredViewNode.position),
                    },
                },
            }
                : parentRef.ref === newParentRef.ref
                ? {
                // moving in the similar parent (same type)
                ...state.definition,
                [parentRef.ref]: {
                    ...state.definition[parentRef.ref],
                    [parentRef.id]: {
                        ...state.definition[parentRef.ref][parentRef.id],
                        children: state.definition[parentRef.ref][parentRef.id].children.filter(ref => ref.id !== nodeRef.id),
                    },
                    [newParentRef.id]: {
                        ...state.definition[newParentRef.ref][newParentRef.id],
                        children: state.definition[newParentRef.ref][newParentRef.id].children
                            .slice(0, state.hoveredViewNode.position)
                            .concat(nodeRef, state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position)),
                    },
                },
            }
                : {
                // moving to a new type parent
                ...state.definition,
                [parentRef.ref]: {
                    ...state.definition[parentRef.ref],
                    [parentRef.id]: {
                        ...state.definition[parentRef.ref][parentRef.id],
                        children: state.definition[parentRef.ref][parentRef.id].children.filter(ref => ref.id !== nodeRef.id),
                    },
                },
                [newParentRef.ref]: {
                    ...state.definition[newParentRef.ref],
                    [newParentRef.id]: {
                        ...state.definition[newParentRef.ref][newParentRef.id],
                        children: state.definition[newParentRef.ref][newParentRef.id].children
                            .slice(0, state.hoveredViewNode.position)
                            .concat(nodeRef, state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position)),
                    },
                },
            },
        }
        setState({
            ...fixedParents,
            definition: {
                ...fixedParents.definition,
                [nodeRef.ref]: {
                    ...fixedParents.definition[nodeRef.ref],
                    [nodeRef.id]: {
                        ...fixedParents.definition[nodeRef.ref][nodeRef.id],
                        parent: newParentRef,
                    },
                },
            },
        })
        return false
    }
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)
    return false
}

export function HOVER_MOBILE(e) {
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

export function VIEW_UNHOVERED() {
    setState({ ...state, hoveredViewWithoutDrag: '' })
}

export function VIEW_HOVERED(nodeRef, parentRef, depth, e) {
    if (!state.draggedComponentView) {
        return setState({ ...state, hoveredViewWithoutDrag: nodeRef.id })
    }

    const target = e.target || e.srcElement
    const rect = target.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left) / rect.width
    const offsetY = (e.clientY - rect.top) / rect.height

    const insertBefore = () =>
        setState({
            ...state,
            hoveredViewNode: {
                parent: parentRef,
                depth,
                position: state.definition[parentRef.ref][parentRef.id].children.filter(ref => ref.id !== state.draggedComponentView.id).findIndex(ref => ref.id === nodeRef.id),
            },
        })
    const insertAfter = () =>
        setState({
            ...state,
            hoveredViewNode: {
                parent: parentRef,
                depth,
                position: state.definition[parentRef.ref][parentRef.id].children.filter(ref => ref.id !== state.draggedComponentView.id).findIndex(ref => ref.id === nodeRef.id) + 1,
            },
        })
    const insertAsFirst = () =>
        setState({
            ...state,
            hoveredViewNode: {
                parent: nodeRef,
                depth: depth + 1,
                position: 0,
            },
        })
    const insertAsLast = () =>
        setState({
            ...state,
            hoveredViewNode: {
                parent: { ref: 'vNodeBox', id: '_rootNode' },
                depth: 1,
                position: state.definition['vNodeBox']['_rootNode'].children.length,
            },
        })
    const insertAt = (toPutRef, index) =>
        setState({
            ...state,
            hoveredViewNode: {
                parent: toPutRef,
                depth: depth - 1,
                position: index + 1,
            },
        })
    if (nodeRef.id === state.draggedComponentView.id) {
        const parent = state.definition[parentRef.ref][parentRef.id]
        // check if the last child, if yes, go to grandparent and drop there after parent
        if (parent.children[parent.children.length - 1].id === nodeRef.id) {
            if (parentRef.id !== '_rootNode') {
                const grandparent = state.definition[parent.parent.ref][parent.parent.id]
                const parentPosition = grandparent.children.findIndex(childRef => childRef.id === parentRef.id)
                return insertAt(parent.parent, parentPosition)
            }
        }
        return setState({ ...state, hoveredViewNode: null })
    }
    if (nodeRef.id === '_rootNode') {
        return insertAsFirst()
    }
    if (nodeRef.id === '_lastNode') {
        return insertAsLast()
    }
    // pray to god that you did not make a mistake here
    if (state.definition[nodeRef.ref][nodeRef.id].children) {
        // if box
        if (state.viewFoldersClosed[nodeRef.id] || state.definition[nodeRef.ref][nodeRef.id].children.length === 0) {
            // if closed or empty box
            if (offsetY < 0.3) {
                insertBefore()
            } else {
                if (!openBoxTimeout) {
                    openBoxTimeout = setTimeout(() => VIEW_FOLDER_CLICKED(nodeRef.id, false), 500)
                }
                insertAsFirst()
                return
            }
        } else {
            // open box
            if (offsetY < 0.5) {
                insertBefore()
            } else {
                insertAsFirst()
            }
        }
    } else {
        // simple node
        if (offsetY < 0.5) {
            insertBefore()
        } else {
            insertAfter()
        }
    }
    if (openBoxTimeout) {
        clearTimeout(openBoxTimeout)
        openBoxTimeout = null
    }
}

export function PIPE_HOVERED(pipeRef, e) {
    if (!state.draggedComponentStateId) {
        return
    }
    setState({ ...state, hoveredPipe: pipeRef })
}

function PIPE_UNHOVERED() {
    if (state.hoveredPipe) {
        setState({
            ...state,
            hoveredPipe: null,
        })
    }
}

export function COMPONENT_VIEW_DRAGGED(e) {
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
            componentEditorPosition: { x: x - offsetX, y: y - offsetY },
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

export function WIDTH_DRAGGED(widthName, e) {
    e.preventDefault()
    function resize(e) {
        e.preventDefault()
        // TODO refactor
        let newWidth = window.innerWidth - (e.touches ? e.touches[0].pageX : e.pageX)
        if (widthName === 'editorLeftWidth') {
            newWidth = e.touches ? e.touches[0].pageX : e.pageX
        }
        if (widthName === 'subEditorWidth') {
            newWidth = (e.touches ? e.touches[0].pageX : e.pageX) - state.componentEditorPosition.x
        }
        if (widthName === 'subEditorWidthLeft') {
            newWidth = state.componentEditorPosition.x + state.subEditorWidth - (e.touches ? e.touches[0].pageX : e.pageX)
            if (newWidth < 250) {
                return
            }
            return setState({
                ...state,
                subEditorWidth: newWidth,
                componentEditorPosition: {
                    ...state.componentEditorPosition,
                    x: e.touches ? e.touches[0].pageX : e.pageX,
                },
            })
        }
        // I probably was drunk // it turns out I was
        // if(widthName !== 'subEditorWidth' && widthName !== 'subEditorWidth' && ( (widthName === 'editorLeftWidth' ? state.leftOpen: state.rightOpen) ? newWidth < 180: newWidth > 180)){
        //     if(widthName === 'editorLeftWidth'){
        //         return setState({...state, leftOpen: !state.leftOpen})
        //     }
        //     return setState({...state, rightOpen: !state.rightOpen})
        // }
        if (newWidth < 250) {
            newWidth = 250
        }
        setState({ ...state, [widthName]: newWidth })
        return false
    }
    window.addEventListener('mousemove', resize)
    window.addEventListener('touchmove', resize)
    function stopDragging(e) {
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

export function STATE_DRAGGED(stateId, e) {
    e.preventDefault()
    const initialX = e.touches ? e.touches[0].pageX : e.pageX
    const initialY = e.touches ? e.touches[0].pageY : e.pageY
    const position = this.elm.getBoundingClientRect()
    const offsetX = initialX - position.left
    const offsetY = initialY - position.top
    function drag(e) {
        e.preventDefault()
        const x = e.touches ? e.touches[0].pageX : e.pageX
        const y = e.touches ? e.touches[0].pageY : e.pageY
        if (!state.draggedComponentView) {
            if (Math.abs(initialY - y) > 3) {
                setState({
                    ...state,
                    draggedComponentStateId: stateId,
                    mousePosition: { x: x - offsetX, y: y - offsetY },
                })
            }
        } else {
            setState({
                ...state,
                mousePosition: { x: x - offsetX, y: y - offsetY },
            })
        }
        return false
    }
    window.addEventListener('mousemove', drag)
    window.addEventListener('touchmove', drag)
    function stopDragging(event) {
        event.preventDefault()
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('touchmove', drag)
        window.removeEventListener('mouseup', stopDragging)
        window.removeEventListener('touchend', stopDragging)
        if (!state.draggedComponentStateId) {
            return STATE_NODE_SELECTED(stateId)
        }
        if (!state.hoveredPipe && !state.hoveredEvent) {
            return setState({
                ...state,
                draggedComponentStateId: null,
                hoveredPipe: null,
            })
        }
        if (state.hoveredEvent) {
            // check if event already changes the state
            if (state.definition.state[state.draggedComponentStateId].mutators.map(mutatorRef => state.definition.mutator[mutatorRef.id].event.id).filter(eventid => eventid === state.hoveredEvent.id).length) {
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
                            value: {
                                ref: 'state',
                                id: state.draggedComponentStateId,
                            },
                            transformations: [],
                        },
                    },
                    state: {
                        ...state.definition.state,
                        [state.draggedComponentStateId]: {
                            ...state.definition.state[state.draggedComponentStateId],
                            mutators: state.definition.state[state.draggedComponentStateId].mutators.concat({
                                ref: 'mutator',
                                id: mutatorId,
                            }),
                        },
                    },
                    mutator: {
                        ...state.definition.mutator,
                        [mutatorId]: {
                            event: state.hoveredEvent,
                            state: {
                                ref: 'state',
                                id: state.draggedComponentStateId,
                            },
                            mutation: { ref: 'pipe', id: pipeId },
                        },
                    },
                    event: {
                        ...state.definition.event,
                        [state.hoveredEvent.id]: {
                            ...state.definition.event[state.hoveredEvent.id],
                            mutators: state.definition.event[state.hoveredEvent.id].mutators.concat({
                                ref: 'mutator',
                                id: mutatorId,
                            }),
                        },
                    },
                },
            })
        }
        const pipeDropped = state.definition.pipe[state.hoveredPipe.id]
        if (pipeDropped.type === 'text') {
            if (state.definition.pipe[state.hoveredPipe.id].value.ref && state.definition.pipe[state.hoveredPipe.id].value.ref === 'state') {
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition: {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                value: {
                                    ref: 'state',
                                    id: state.draggedComponentStateId,
                                },
                                transformations: [],
                            },
                        },
                    },
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
                definition: {
                    ...state.definition,
                    pipe: {
                        ...state.definition.pipe,
                        [state.hoveredPipe.id]: {
                            ...state.definition.pipe[state.hoveredPipe.id],
                            transformations: [{ ref: 'join', id: joinIdState }, { ref: 'join', id: joinIdText }].concat(state.definition.pipe[state.hoveredPipe.id].transformations),
                        },
                        [pipeIdState]: {
                            type: 'text',
                            value: {
                                ref: 'state',
                                id: state.draggedComponentStateId,
                            },
                            transformations: [],
                        },
                        [pipeIdText]: {
                            type: 'text',
                            value: '',
                            transformations: [],
                        },
                    },
                    join: {
                        ...state.definition.join,
                        [joinIdState]: {
                            value: { ref: 'pipe', id: pipeIdState },
                        },
                        [joinIdText]: {
                            value: { ref: 'pipe', id: pipeIdText },
                        },
                    },
                },
            })
        }
        if (pipeDropped.type === 'number') {
            // you can't drop boolean into number
            if (state.definition.state[state.draggedComponentStateId].type === 'boolean') {
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                })
            }
            if (state.definition.state[state.draggedComponentStateId].type === 'text') {
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition: {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                value: {
                                    ref: 'state',
                                    id: state.draggedComponentStateId,
                                },
                                transformations: [
                                    {
                                        ref: 'length',
                                        id: 'noop',
                                    },
                                ],
                            },
                        },
                    },
                })
            }
            setState({
                ...state,
                draggedComponentStateId: null,
                hoveredPipe: null,
                definition: {
                    ...state.definition,
                    pipe: {
                        ...state.definition.pipe,
                        [state.hoveredPipe.id]: {
                            ...state.definition.pipe[state.hoveredPipe.id],
                            value: {
                                ref: 'state',
                                id: state.draggedComponentStateId,
                            },
                        },
                    },
                },
            })
        }
        if (pipeDropped.type === 'boolean') {
            if (state.definition.state[state.draggedComponentStateId].type === 'number') {
                const eqId = uuid()
                const pipeId = uuid()
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition: {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                value: {
                                    ref: 'state',
                                    id: state.draggedComponentStateId,
                                },
                                transformations: [
                                    {
                                        ref: 'equal',
                                        id: eqId,
                                    },
                                ],
                            },
                            [pipeId]: {
                                type: 'number',
                                value: 0,
                                transformations: [],
                            },
                        },
                        equal: {
                            ...state.definition.equal,
                            [eqId]: {
                                value: {
                                    ref: 'pipe',
                                    id: pipeId,
                                },
                            },
                        },
                    },
                })
            }
            if (state.definition.state[state.draggedComponentStateId].type === 'text') {
                const eqId = uuid()
                const pipeId = uuid()
                return setState({
                    ...state,
                    draggedComponentStateId: null,
                    hoveredPipe: null,
                    definition: {
                        ...state.definition,
                        pipe: {
                            ...state.definition.pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definition.pipe[state.hoveredPipe.id],
                                value: {
                                    ref: 'state',
                                    id: state.draggedComponentStateId,
                                },
                                transformations: [
                                    {
                                        ref: 'equal',
                                        id: eqId,
                                    },
                                ],
                            },
                            [pipeId]: {
                                type: 'text',
                                value: 'Default text',
                                transformations: [],
                            },
                        },
                        equal: {
                            ...state.definition.equal,
                            [eqId]: {
                                value: {
                                    ref: 'pipe',
                                    id: pipeId,
                                },
                            },
                        },
                    },
                })
            }
            setState({
                ...state,
                draggedComponentStateId: null,
                hoveredPipe: null,
                definition: {
                    ...state.definition,
                    pipe: {
                        ...state.definition.pipe,
                        [state.hoveredPipe.id]: {
                            ...state.definition.pipe[state.hoveredPipe.id],
                            value: {
                                ref: 'state',
                                id: state.draggedComponentStateId,
                            },
                            transformations: [], // TODO leave for state
                        },
                    },
                },
            })
        }
    }
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)
}

export function OPEN_SIDEBAR(side) {
    if (side === 'left') {
        return setState({ ...state, leftOpen: !state.leftOpen })
    }
    if (side === 'right') {
        return setState({ ...state, rightOpen: !state.rightOpen })
    }
}
export function FREEZER_CLICKED() {
    setState({ ...state, appIsFrozen: !state.appIsFrozen })
}
export function VIEW_FOLDER_CLICKED(nodeId, forcedValue) {
    setState({
        ...state,
        viewFoldersClosed: {
            ...state.viewFoldersClosed,
            [nodeId]: forcedValue !== undefined ? forcedValue : !state.viewFoldersClosed[nodeId],
        },
    })
}
export function VIEW_NODE_SELECTED(ref) {
    setState({ ...state, selectedViewNode: ref })
}
export function UNSELECT_VIEW_NODE(selfOnly, stopPropagation, e) {
    if (stopPropagation) {
        e.stopPropagation()
    }
    if (selfOnly && e.target !== this.elm) {
        return
    }
    setState({ ...state, selectedViewNode: {} })
}
export function STATE_NODE_SELECTED(nodeId) {
    setState({ ...state, selectedStateNodeId: nodeId })
}
export function UNSELECT_STATE_NODE(e) {
    if (e.target === this.elm) {
        setState({ ...state, selectedStateNodeId: '' })
    }
}
export function ADD_NODE(nodeRef, type) {
    if (!nodeRef.ref || !state.definition[nodeRef.ref][nodeRef.id] || !state.definition[nodeRef.ref][nodeRef.id].children) {
        if (state.selectedViewNode.id && state.selectedViewNode.id !== '_rootNode') {
            nodeRef = state.definition[state.selectedViewNode.ref][state.selectedViewNode.id].parent
        } else {
            nodeRef = { ref: 'vNodeBox', id: '_rootNode' }
        }
    }
    const nodeId = nodeRef.id
    const newNodeId = uuid()
    const newStyleId = uuid()
    // style: ['background', 'border', 'borderRadius', 'outline', 'cursor', 'color', 'transition', 'display', 'top', 'bottom', 'left', 'flex', 'justifyContent', 'alignItems', 'width', 'height', 'maxWidth',
    // 'maxHeight', 'minWidth', 'minHeight', 'right', 'position', 'overflow', 'font', 'margin', 'padding'],
    const styleIds = {
        flex: uuid(),
        display: uuid(),
        height: uuid(),
        maxHeight: uuid(),
        minHeight: uuid(),
        width: uuid(),
        maxWidth: uuid(),
        minWidth: uuid(),
        marginTop: uuid(),
        marginBottom: uuid(),
        marginLeft: uuid(),
        marginRight: uuid(),
        paddingTop: uuid(),
        paddingBottom: uuid(),
        paddingLeft: uuid(),
        paddingRight: uuid(),
        zIndex: uuid(),
        position: uuid(),
        top: uuid(),
        bottom: uuid(),
        left: uuid(),
        right: uuid(),
        alignItems: uuid(),
        justifyContent: uuid(),
        flexDirection: uuid(),
        flexWrap: uuid(),
        borderTop: uuid(),
        borderBottom: uuid(),
        borderLeft: uuid(),
        borderRight: uuid(),
        borderRadius: uuid(),
        backgroundColor: uuid(),
        opacity: uuid(),
        overflow: uuid(),
        boxShadow: uuid(),
        cursor: uuid(),
    }
    const boxStylePipes = {
        [styleIds.flex]: {
            type: 'text',
            value: '1',
            transformations: [],
        },
        [styleIds.display]: {
            type: 'text',
            value: 'flex',
            transformations: [],
        },
        [styleIds.zIndex]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.height]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.maxHeight]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.minHeight]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.width]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.maxWidth]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.minWidth]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.marginTop]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.marginBottom]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.marginLeft]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.marginRight]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.paddingTop]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.paddingBottom]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.paddingLeft]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.paddingRight]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.position]: {
            type: 'text',
            value: 'relative',
            transformations: [],
        },
        [styleIds.top]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.bottom]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.left]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.right]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.alignItems]: {
            type: 'text',
            value: 'flex-start',
            transformations: [],
        },
        [styleIds.justifyContent]: {
            type: 'text',
            value: 'flex-start',
            transformations: [],
        },
        [styleIds.flexDirection]: {
            type: 'text',
            value: 'row',
            transformations: [],
        },
        [styleIds.flexWrap]: {
            type: 'text',
            value: 'wrap',
            transformations: [],
        },
        [styleIds.backgroundColor]: {
            type: 'text',
            value: 'none',
            transformations: [],
        },
        [styleIds.opacity]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.overflow]: {
            type: 'text',
            value: 'visible',
            transformations: [],
        },
        [styleIds.boxShadow]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.borderTop]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.borderBottom]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.borderLeft]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.borderRight]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.borderRadius]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.cursor]: {
            type: 'text',
            value: '',
            transformations: [],
        },
    }
    const textStyleIds = {
        ...styleIds,
        color: uuid(),
        fontFamily: uuid(),
        fontStyle: uuid(),
        fontSize: uuid(),
        fontWeight: uuid(),
        lineHeight: uuid(),
        textDecorationLine: uuid(),
        letterSpacing: uuid(),
    }
    const textStylePipes = {
        ...boxStylePipes,
        [textStyleIds.color]: {
            type: 'text',
            value: '#000000',
            transformations: [],
        },
        [textStyleIds.fontFamily]: {
            type: 'text',
            value: 'inherit',
            transformations: [],
        },
        [textStyleIds.fontStyle]: {
            type: 'text',
            value: 'normal',
            transformations: [],
        },
        [textStyleIds.fontWeight]: {
            type: 'text',
            value: 'normal',
            transformations: [],
        },
        [textStyleIds.fontSize]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [textStyleIds.textDecorationLine]: {
            type: 'text',
            value: 'none',
            transformations: [],
        },
        [textStyleIds.lineHeight]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [textStyleIds.letterSpacing]: {
            type: 'text',
            value: '',
            transformations: [],
        },
    }
    const newStyle = type === 'text' || type === 'input'
        ? Object.keys(textStyleIds).reduce((acc, val) => {
        acc[val] = { ref: 'pipe', id: textStyleIds[val] }
        return acc
    }, {})
        : Object.keys(styleIds).reduce((acc, val) => {
        acc[val] = { ref: 'pipe', id: styleIds[val] }
        return acc
    }, {})

    if (type === 'box') {
        const newNode = {
            title: 'box',
            parent: nodeRef,
            style: { ref: 'style', id: newStyleId },
            children: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeBox', id: newNodeId },
            definition: nodeRef.ref === 'vNodeBox'
                ? {
                ...state.definition,
                pipe: { ...state.definition.pipe, ...boxStylePipes },
                vNodeBox: {
                    ...state.definition.vNodeBox,
                    [nodeId]: {
                        ...state.definition.vNodeBox[nodeId],
                        children: state.definition.vNodeBox[nodeId].children.concat({
                            ref: 'vNodeBox',
                            id: newNodeId,
                        }),
                    },
                    [newNodeId]: newNode,
                },
                style: {
                    ...state.definition.style,
                    [newStyleId]: newStyle,
                },
            }
                : {
                ...state.definition,
                [nodeRef.ref]: {
                    ...state.definition[nodeRef.ref],
                    [nodeId]: {
                        ...state.definition[nodeRef.ref][nodeId],
                        children: state.definition[nodeRef.ref][nodeId].children.concat({
                            ref: 'vNodeBox',
                            id: newNodeId,
                        }),
                    },
                },
                pipe: { ...state.definition.pipe, ...boxStylePipes },
                vNodeBox: {
                    ...state.definition.vNodeBox,
                    [newNodeId]: newNode,
                },
                style: {
                    ...state.definition.style,
                    [newStyleId]: newStyle,
                },
            },
        })
    }
    if (type === 'text') {
        const pipeId = uuid()
        const newNode = {
            title: 'text',
            parent: nodeRef,
            style: { ref: 'style', id: newStyleId },
            value: { ref: 'pipe', id: pipeId },
        }
        const newPipe = {
            type: 'text',
            value: 'Default Text',
            transformations: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeText', id: newNodeId },
            definition: {
                ...state.definition,
                pipe: {
                    ...state.definition.pipe,
                    [pipeId]: newPipe,
                    ...textStylePipes,
                },
                [nodeRef.ref]: {
                    ...state.definition[nodeRef.ref],
                    [nodeId]: {
                        ...state.definition[nodeRef.ref][nodeId],
                        children: state.definition[nodeRef.ref][nodeId].children.concat({
                            ref: 'vNodeText',
                            id: newNodeId,
                        }),
                    },
                },
                vNodeText: {
                    ...state.definition.vNodeText,
                    [newNodeId]: newNode,
                },
                style: {
                    ...state.definition.style,
                    [newStyleId]: newStyle,
                },
            },
        })
    }
    if (type === 'image') {
        const pipeId = uuid()
        const newNode = {
            title: 'image',
            parent: nodeRef,
            style: { ref: 'style', id: newStyleId },
            src: { ref: 'pipe', id: pipeId },
        }
        const newPipe = {
            type: 'text',
            value: 'https://www.ugnis.com/images/logo_new256x256.png',
            transformations: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeImage', id: newNodeId },
            definition: {
                ...state.definition,
                pipe: {
                    ...state.definition.pipe,
                    [pipeId]: newPipe,
                    ...boxStylePipes,
                },
                [nodeRef.ref]: {
                    ...state.definition[nodeRef.ref],
                    [nodeId]: {
                        ...state.definition[nodeRef.ref][nodeId],
                        children: state.definition[nodeRef.ref][nodeId].children.concat({
                            ref: 'vNodeImage',
                            id: newNodeId,
                        }),
                    },
                },
                vNodeImage: {
                    ...state.definition.vNodeImage,
                    [newNodeId]: newNode,
                },
                style: {
                    ...state.definition.style,
                    [newStyleId]: newStyle,
                },
            },
        })
    }
    if (type === 'if') {
        const pipeId = uuid()
        const newNode = {
            title: 'conditional',
            parent: nodeRef,
            value: { ref: 'pipe', id: pipeId },
            children: [],
        }
        const newPipe = {
            type: 'boolean',
            value: true,
            transformations: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeIf', id: newNodeId },
            definition: nodeRef.ref === 'vNodeIf'
                ? {
                ...state.definition,
                pipe: { ...state.definition.pipe, [pipeId]: newPipe },
                vNodeIf: {
                    ...state.definition.vNodeIf,
                    [nodeId]: {
                        ...state.definition.vNodeIf[nodeId],
                        children: state.definition.vNodeIf[nodeId].children.concat({
                            ref: 'vNodeIf',
                            id: newNodeId,
                        }),
                    },
                    [newNodeId]: newNode,
                },
            }
                : {
                ...state.definition,
                pipe: { ...state.definition.pipe, [pipeId]: newPipe },
                [nodeRef.ref]: {
                    ...state.definition[nodeRef.ref],
                    [nodeId]: {
                        ...state.definition[nodeRef.ref][nodeId],
                        children: state.definition[nodeRef.ref][nodeId].children.concat({
                            ref: 'vNodeIf',
                            id: newNodeId,
                        }),
                    },
                },
                vNodeIf: {
                    ...state.definition.vNodeIf,
                    [newNodeId]: newNode,
                },
            },
        })
    }
    if (type === 'input') {
        const stateId = uuid()
        const eventId = uuid()
        const mutatorId = uuid()
        const pipeInputId = uuid()
        const pipeMutatorId = uuid()
        const newNode = {
            title: 'input',
            parent: nodeRef,
            style: { ref: 'style', id: newStyleId },
            value: { ref: 'pipe', id: pipeInputId },
            input: { ref: 'event', id: eventId },
        }
        const newPipeInput = {
            type: 'text',
            value: { ref: 'state', id: stateId },
            transformations: [],
        }
        const newPipeMutator = {
            type: 'text',
            value: { ref: 'eventData', id: '_input' },
            transformations: [],
        }
        const newState = {
            title: 'input value',
            type: 'text',
            ref: stateId,
            defaultValue: 'Default text',
            mutators: [{ ref: 'mutator', id: mutatorId }],
        }
        const newMutator = {
            event: { ref: 'event', id: eventId },
            state: { ref: 'state', id: stateId },
            mutation: { ref: 'pipe', id: pipeMutatorId },
        }
        const newEvent = {
            type: 'input',
            title: 'update input',
            mutators: [{ ref: 'mutator', id: mutatorId }],
            emitter: {
                ref: 'vNodeInput',
                id: newNodeId,
            },
            data: [{ ref: 'eventData', id: '_input' }],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeInput', id: newNodeId },
            definition: {
                ...state.definition,
                pipe: {
                    ...state.definition.pipe,
                    [pipeInputId]: newPipeInput,
                    [pipeMutatorId]: newPipeMutator,
                    ...textStylePipes,
                },
                [nodeRef.ref]: {
                    ...state.definition[nodeRef.ref],
                    [nodeId]: {
                        ...state.definition[nodeRef.ref][nodeId],
                        children: state.definition[nodeRef.ref][nodeId].children.concat({
                            ref: 'vNodeInput',
                            id: newNodeId,
                        }),
                    },
                },
                vNodeInput: {
                    ...state.definition.vNodeInput,
                    [newNodeId]: newNode,
                },
                style: {
                    ...state.definition.style,
                    [newStyleId]: newStyle,
                },
                nameSpace: {
                    ...state.definition.nameSpace,
                    ['_rootNameSpace']: {
                        ...state.definition.nameSpace['_rootNameSpace'],
                        children: state.definition.nameSpace['_rootNameSpace'].children.concat({ ref: 'state', id: stateId }),
                    },
                },
                state: { ...state.definition.state, [stateId]: newState },
                mutator: {
                    ...state.definition.mutator,
                    [mutatorId]: newMutator,
                },
                event: { ...state.definition.event, [eventId]: newEvent },
            },
        })
    }
}
export function ADD_STATE(namespaceId, type) {
    const newStateId = uuid()
    let newState
    if (type === 'text') {
        newState = {
            title: 'new text',
            ref: newStateId,
            type: 'text',
            defaultValue: 'Default text',
            mutators: [],
        }
    }
    if (type === 'number') {
        newState = {
            title: 'new number',
            ref: newStateId,
            type: 'number',
            defaultValue: 0,
            mutators: [],
        }
    }
    if (type === 'boolean') {
        newState = {
            title: 'new boolean',
            type: 'boolean',
            ref: newStateId,
            defaultValue: true,
            mutators: [],
        }
    }
    if (type === 'table') {
        newState = {
            title: 'new table',
            type: 'table',
            ref: newStateId,
            defaultValue: {},
            mutators: [],
        }
    }
    if (type === 'folder') {
        newState = {
            title: 'new folder',
            children: [],
        }
        return setState({
            ...state,
            definition: {
                ...state.definition,
                nameSpace: {
                    ...state.definition.nameSpace,
                    [namespaceId]: {
                        ...state.definition.nameSpace[namespaceId],
                        children: state.definition.nameSpace[namespaceId].children.concat({
                            ref: 'nameSpace',
                            id: newStateId,
                        }),
                    },
                    [newStateId]: newState,
                },
            },
        })
    }
    setState({
        ...state,
        definition: {
            ...state.definition,
            nameSpace: {
                ...state.definition.nameSpace,
                [namespaceId]: {
                    ...state.definition.nameSpace[namespaceId],
                    children: state.definition.nameSpace[namespaceId].children.concat({
                        ref: 'state',
                        id: newStateId,
                    }),
                },
            },
            state: { ...state.definition.state, [newStateId]: newState },
        },
    })
}
export function SELECT_VIEW_SUBMENU(newId) {
    setState({ ...state, selectedViewSubMenu: newId })
}
export function EDIT_VIEW_NODE_TITLE(nodeId) {
    setState({ ...state, editingTitleNodeId: nodeId })
}
export function DELETE_SELECTED_VIEW(nodeRef, parentRef) {
    // remove all events from state
    const events = getAvailableEvents(nodeRef.ref)
    let newState = state.definition.state
    events.forEach(event => {
        const eventRef = state.definition[nodeRef.ref][nodeRef.id][event.propertyName]
        if (eventRef) {
            // event -> mutators -> states
            state.definition[eventRef.ref][eventRef.id].mutators.forEach(mutatorRef => {
                const stateRef = state.definition[mutatorRef.ref][mutatorRef.id].state
                newState = {
                    ...newState,
                    [stateRef.id]: {
                        ...newState[stateRef.id],
                        mutators: newState[stateRef.id].mutators.filter(mutator => mutator.id !== mutatorRef.id),
                    },
                }
            })
        }
    })
    setState({
        ...state,
        definition: {
            ...state.definition,
            [parentRef.ref]: {
                ...state.definition[parentRef.ref],
                [parentRef.id]: {
                    ...state.definition[parentRef.ref][parentRef.id],
                    children: state.definition[parentRef.ref][parentRef.id].children.filter(ref => ref.id !== nodeRef.id),
                },
            },
            state: newState,
        },
        selectedViewNode: {},
    })
}
export function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
    e.preventDefault()
    const nodeId = nodeRef.id
    const nodeType = nodeRef.ref
    setState({
        ...state,
        definition: {
            ...state.definition,
            [nodeType]: {
                ...state.definition[nodeType],
                [nodeId]: {
                    ...state.definition[nodeType][nodeId],
                    title: e.target.value,
                },
            },
        },
    })
}
export function CHANGE_STATE_NODE_TITLE(nodeId, e) {
    e.preventDefault()
    setState({
        ...state,
        definition: {
            ...state.definition,
            state: {
                ...state.definition.state,
                [nodeId]: {
                    ...state.definition.state[nodeId],
                    title: e.target.value,
                },
            },
        },
    })
}
export function CHANGE_NAMESPACE_TITLE(nodeId, e) {
    e.preventDefault()
    setState({
        ...state,
        definition: {
            ...state.definition,
            nameSpace: {
                ...state.definition.nameSpace,
                [nodeId]: {
                    ...state.definition.nameSpace[nodeId],
                    title: e.target.value,
                },
            },
        },
    })
}
export function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e) {
    app.setCurrentState({
        ...app.getCurrentState(),
        [stateId]: e.target.value,
    })
    render()
}
export function CHANGE_CURRENT_STATE_BOOLEAN_VALUE(stateId, e) {
    app.setCurrentState({
        ...app.getCurrentState(),
        [stateId]: e.target.value === 'true',
    })
    render()
}
export function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId, e) {
    if (e.target.value.toString() !== app.getCurrentState()[stateId].toString()) {
        app.setCurrentState({
            ...app.getCurrentState(),
            [stateId]: Number(e.target.value),
        })
        render()
    }
}
export function CHANGE_STATIC_VALUE(ref, propertyName, type, e) {
    let value = e.target.value
    if (type === 'number') {
        value = Number(e.target.value)
    }
    if (type === 'boolean') {
        value = value === true || value === 'true'
    }
    setState({
        ...state,
        definition: {
            ...state.definition,
            [ref.ref]: {
                ...state.definition[ref.ref],
                [ref.id]: {
                    ...state.definition[ref.ref][ref.id],
                    [propertyName]: value,
                },
            },
        },
    })
}
export function ADD_EVENT(propertyName, node) {
    const ref = state.selectedViewNode
    const eventId = uuid()
    setState({
        ...state,
        definition: {
            ...state.definition,
            [ref.ref]: {
                ...state.definition[ref.ref],
                [ref.id]: {
                    ...state.definition[ref.ref][ref.id],
                    [propertyName]: { ref: 'event', id: eventId },
                },
            },
            event: {
                ...state.definition.event,
                [eventId]: {
                    type: propertyName,
                    emitter: node,
                    mutators: [],
                    data: [],
                },
            },
        },
    })
}
export function SELECT_PIPE(pipeId, e) {
    e.stopPropagation()
    setState({ ...state, selectedPipeId: pipeId })
}
export function ADD_DEFAULT_TRANSFORMATION(pipeId) {
    const defaultTransformations = {
        text: 'toUpperCase',
        number: 'add',
        boolean: 'and',
    }
    const defaultValues = {
        text: 'Default text',
        number: 0,
        boolean: true,
    }
    const pipe = state.definition.pipe[pipeId]
    const stateInPipe = state.definition.state[pipe.value.id]
    const transformation = defaultTransformations[stateInPipe.type]
    const value = defaultValues[stateInPipe.type]
    const newPipeId = uuid()
    const newId = uuid()

    const oldTransformations = state.definition.pipe[pipeId].transformations
    const newPipeTransformations = pipe.type === 'text' || pipe.type === stateInPipe.type
        ? oldTransformations.concat({ ref: transformation, id: newId })
        : oldTransformations.slice(0, oldTransformations.length - 1).concat({ ref: transformation, id: newId }).concat(oldTransformations.slice(oldTransformations.length - 1))
    setState({
        ...state,
        definition: {
            ...state.definition,
            [transformation]: {
                ...state.definition[transformation],
                [newId]: {
                    value: { ref: 'pipe', id: newPipeId },
                },
            },
            pipe: {
                ...state.definition.pipe,
                [newPipeId]: {
                    type: pipe.type,
                    value: value,
                    transformations: [],
                },
                [pipeId]: {
                    ...state.definition.pipe[pipeId],
                    transformations: newPipeTransformations,
                },
            },
        },
    })
}
export function FULL_SCREEN_CLICKED(value) {
    if (value !== state.fullScreen) {
        setState({ ...state, fullScreen: value })
    }
}
export function SAVE_DEFAULT(stateId) {
    setState({
        ...state,
        definition: {
            ...state.definition,
            state: {
                ...state.definition.state,
                [stateId]: {
                    ...state.definition.state[stateId],
                    defaultValue: app.getCurrentState()[stateId],
                },
            },
        },
    })
}
export function DELETE_STATE(stateId) {
    let removedPipeState = state
    Object.keys(state.definition.pipe).forEach(pipeid => {
        if (state.definition.pipe[pipeid].value.id === stateId) {
            removedPipeState = resetPipeFunc(pipeid, removedPipeState)
        }
    })
    const { [stateId]: deletedState, ...newState } = removedPipeState.definition.state
    let events = removedPipeState.definition.event
    deletedState.mutators.forEach(mutatorRef => {
        const mutator = removedPipeState.definition[mutatorRef.ref][mutatorRef.id]
        const event = mutator.event
        events = {
            ...events,
            [event.id]: {
                ...events[event.id],
                mutators: events[event.id].mutators.filter(mutRef => mutRef.id !== mutatorRef.id),
            },
        }
    })
    setState({
        ...removedPipeState,
        selectedStateNodeId: '',
        definition: {
            ...removedPipeState.definition,
            state: newState,
            nameSpace: {
                ...removedPipeState.definition.nameSpace,
                _rootNameSpace: {
                    ...removedPipeState.definition.nameSpace['_rootNameSpace'],
                    children: removedPipeState.definition.nameSpace['_rootNameSpace'].children.filter(ref => ref.id !== stateId),
                },
            },
            event: events,
        },
    })
}
export function EVENT_HOVERED(eventRef) {
    setState({
        ...state,
        hoveredEvent: eventRef,
    })
}
export function EVENT_UNHOVERED() {
    if (state.hoveredEvent) {
        setState({
            ...state,
            hoveredEvent: null,
        })
    }
}
export function resetPipeFunc(pipeId, state) {
    const defaultValues = {
        text: 'Default text',
        number: 0,
        boolean: true,
    }
    let parentJoinId
    Object.keys(state.definition.join).forEach(joinId => {
        if (state.definition.join[joinId].value.id === pipeId) {
            parentJoinId = joinId
        }
    })
    if (parentJoinId) {
        const pipes = Object.keys(state.definition.pipe)
        for (let i = 0; i < pipes.length; i++) {
            const parentPipeId = pipes[i]
            for (let index = 0; index < state.definition.pipe[parentPipeId].transformations.length; index++) {
                const ref = state.definition.pipe[parentPipeId].transformations[index]
                if (ref.id === parentJoinId) {
                    const joinRef = state.definition.pipe[parentPipeId].transformations[index + 1]
                    const secondPipeRef = state.definition.join[joinRef.id].value
                    const text = state.definition.pipe[secondPipeRef.id].value
                    return {
                        ...state,
                        selectedPipeId: '',
                        definition: {
                            ...state.definition,
                            pipe: {
                                ...state.definition.pipe,
                                [parentPipeId]: {
                                    ...state.definition.pipe[parentPipeId],
                                    value: state.definition.pipe[parentPipeId].value + text,
                                    transformations: state.definition.pipe[parentPipeId].transformations
                                        .slice(0, index)
                                        .concat(state.definition.pipe[secondPipeRef.id].transformations)
                                        .concat(state.definition.pipe[parentPipeId].transformations.slice(index + 2)),
                                },
                            },
                        },
                    }
                }
            }
        }
    } else {
        return {
            ...state,
            selectedPipeId: '',
            definition: {
                ...state.definition,
                pipe: {
                    ...state.definition.pipe,
                    [pipeId]: {
                        ...state.definition.pipe[pipeId],
                        value: defaultValues[state.definition.pipe[pipeId].type],
                        transformations: [],
                    },
                },
            },
        }
    }
}
export function RESET_PIPE(pipeId, e) {
    e.stopPropagation()

    setState(resetPipeFunc(pipeId, state))
}
export function CHANGE_TRANSFORMATION(pipeRef, transformationRef, index, e) {
    if (transformationRef.ref === e.target.value) {
        return
    }
    const { [transformationRef.id]: actualTransform, ...left } = state.definition[transformationRef.ref]
    setState({
        ...state,
        definition: {
            ...state.definition,
            pipe: {
                ...state.definition.pipe,
                [pipeRef.id]: {
                    ...state.definition.pipe[pipeRef.id],
                    transformations: state.definition.pipe[pipeRef.id].transformations.map(
                        transf =>
                            transf.id === transformationRef.id
                                ? {
                                ref: e.target.value,
                                id: transformationRef.id,
                            }
                                : transf
                    ),
                },
            },
            [transformationRef.ref]: left,
            [e.target.value]: {
                ...state.definition[e.target.value],
                [transformationRef.id]: actualTransform,
            },
        },
    })
}
export function CHANGE_MENU(type) {
    setState({ ...state, selectedMenu: type })
}
export function COMPONENT_HOVERED(id) {
    setState({ ...state, hoveredComponent: id })
}
export function COMPONENT_UNHOVERED() {
    setState({ ...state, hoveredComponent: '' })
}
export function ADD_NEW_COMPONENT() {
    const newApp = generateEmptyApp()
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [newApp.id]: newApp,
        },
        currentDefinition: newApp.id,
        definition: newApp,
        selectedViewNode: {},
        selectedPipeId: '',
        selectedStateNodeId: '',
    })
}
export function SELECT_COMPONENT(name) {
    setState({
        ...state,
        currentDefinition: name,
        definition: state.definitionList[name],
        selectedViewNode: {},
        selectedPipeId: '',
        selectedStateNodeId: '',
    })
}
export function CHANGE_COMPONENT_PATH(name, e) {
    setState({
        ...state,
        definition: { ...state.definition, [name]: e.target.value },
    })
}