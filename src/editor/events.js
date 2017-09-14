import emptyApp from '../_empty.json'
import { state, setState } from 'lape'
import R from 'ramda'

function getAvailableEvents(type) {
    let availableEvents = [
        {
            description: 'on click',
            propertyName: 'click',
        },
        {
            description: 'double clicked',
            propertyName: 'dblclick',
        },
        {
            description: 'mouse over',
            propertyName: 'mouseover',
        },
        {
            description: 'mouse out',
            propertyName: 'mouseout',
        },
    ]
    if (type === 'vNodeInput') {
        availableEvents = availableEvents.concat([
            {
                description: 'input',
                propertyName: 'input',
            },
            {
                description: 'focus',
                propertyName: 'focus',
            },
            {
                description: 'blur',
                propertyName: 'blur',
            },
        ])
    }
    return availableEvents
}

const eventDataTypes = {
    screenX: {
        type: 'number',
    },
    screenY: {
        type: 'number',
    },
    layerX: {
        type: 'number',
    },
    layerY: {
        type: 'number',
    },
    value: {
        type: 'text',
    },
    keyPressed: {
        type: 'text',
    },
    keyPressedCode: {
        type: 'number',
    },
}

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
    //return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function() {
    return ('' + 1e7).replace(/[10]/g, function() {
        return (0 | (Math.random() * 16)).toString(16)
    })
}

function generateEmptyApp() {
    return { ...emptyApp, id: uuid() }
}

export function createDefaultState(definition) {
    return definition.nameSpace['_rootNameSpace'].children.reduce((acc, ref) => {
        const def = definition[ref.ref][ref.id]
        acc[ref.id] = def.defaultValue
        return acc
    }, {})
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
    if (e.which === 32 && e.ctrlKey) {
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
    e.persist()
    if (nodeRef.id === '_rootNode') {
        return
    }
    const isArrow = e.target.dataset.closearrow
    const isTrashcan = e.target.dataset.trashcan
    const initialX = e.touches ? e.touches[0].pageX : e.pageX
    const initialY = e.touches ? e.touches[0].pageY : e.pageY
    const position = e.target.getBoundingClientRect()
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
            definitionList:
                parentRef.id === newParentRef.id
                    ? {
                          ...state.definitionList,
                          [state.currentDefinitionId]: {
                              // moving in the same parent
                              ...state.definitionList[state.currentDefinitionId],
                              [parentRef.ref]: {
                                  ...state.definitionList[state.currentDefinitionId][parentRef.ref],
                                  [parentRef.id]: {
                                      ...state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id],
                                      children: moveInArray(
                                          state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id].children,
                                          state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id].children.findIndex(
                                              ref => ref.id === nodeRef.id
                                          ),
                                          state.hoveredViewNode.position
                                      ),
                                  },
                              },
                          },
                      }
                    : parentRef.ref === newParentRef.ref
                      ? {
                            ...state.definitionList,
                            [state.currentDefinitionId]: {
                                // moving in the similar parent (same type)
                                ...state.definitionList[state.currentDefinitionId],
                                [parentRef.ref]: {
                                    ...state.definitionList[state.currentDefinitionId][parentRef.ref],
                                    [parentRef.id]: {
                                        ...state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id],
                                        children: state.definitionList[state.currentDefinitionId][parentRef.ref][
                                            parentRef.id
                                        ].children.filter(ref => ref.id !== nodeRef.id),
                                    },
                                    [newParentRef.id]: {
                                        ...state.definitionList[state.currentDefinitionId][newParentRef.ref][newParentRef.id],
                                        children: state.definitionList[state.currentDefinitionId][newParentRef.ref][
                                            newParentRef.id
                                        ].children
                                            .slice(0, state.hoveredViewNode.position)
                                            .concat(
                                                nodeRef,
                                                state.definitionList[state.currentDefinitionId][newParentRef.ref][
                                                    newParentRef.id
                                                ].children.slice(state.hoveredViewNode.position)
                                            ),
                                    },
                                },
                            },
                        }
                      : {
                            ...state.definitionList,
                            [state.currentDefinitionId]: {
                                // moving to a new type parent
                                ...state.definitionList[state.currentDefinitionId],
                                [parentRef.ref]: {
                                    ...state.definitionList[state.currentDefinitionId][parentRef.ref],
                                    [parentRef.id]: {
                                        ...state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id],
                                        children: state.definitionList[state.currentDefinitionId][parentRef.ref][
                                            parentRef.id
                                        ].children.filter(ref => ref.id !== nodeRef.id),
                                    },
                                },
                                [newParentRef.ref]: {
                                    ...state.definitionList[state.currentDefinitionId][newParentRef.ref],
                                    [newParentRef.id]: {
                                        ...state.definitionList[state.currentDefinitionId][newParentRef.ref][newParentRef.id],
                                        children: state.definitionList[state.currentDefinitionId][newParentRef.ref][
                                            newParentRef.id
                                        ].children
                                            .slice(0, state.hoveredViewNode.position)
                                            .concat(
                                                nodeRef,
                                                state.definitionList[state.currentDefinitionId][newParentRef.ref][
                                                    newParentRef.id
                                                ].children.slice(state.hoveredViewNode.position)
                                            ),
                                    },
                                },
                            },
                        },
        }
        setState({
            ...fixedParents,
            definitionList: {
                ...fixedParents.definitionList,
                [state.currentDefinitionId]: {
                    ...fixedParents.definitionList[state.currentDefinitionId],
                    [nodeRef.ref]: {
                        ...fixedParents.definitionList[state.currentDefinitionId][nodeRef.ref],
                        [nodeRef.id]: {
                            ...fixedParents.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id],
                            parent: newParentRef,
                        },
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
                position: state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id].children
                    .filter(ref => ref.id !== state.draggedComponentView.id)
                    .findIndex(ref => ref.id === nodeRef.id),
            },
        })
    const insertAfter = () =>
        setState({
            ...state,
            hoveredViewNode: {
                parent: parentRef,
                depth,
                position:
                    state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id].children
                        .filter(ref => ref.id !== state.draggedComponentView.id)
                        .findIndex(ref => ref.id === nodeRef.id) + 1,
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
                position: state.definitionList[state.currentDefinitionId]['vNodeBox']['_rootNode'].children.length,
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
        const parent = state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id]
        // check if the last child, if yes, go to grandparent and drop there after parent
        if (parent.children[parent.children.length - 1].id === nodeRef.id) {
            if (parentRef.id !== '_rootNode') {
                const grandparent = state.definitionList[state.currentDefinitionId][parent.parent.ref][parent.parent.id]
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
    if (state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id].children) {
        // if box
        if (
            state.viewFoldersClosed[nodeRef.id] ||
            state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id].children.length === 0
        ) {
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
    if (!state.draggedComponentState.id) {
        return
    }
    setState({ ...state, hoveredPipe: pipeRef })
}

export function PIPE_UNHOVERED() {
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
    const position = e.target.getBoundingClientRect()
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
    e.persist()
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

export function STATE_DRAGGED(stateRef, e) {
    e.preventDefault()
    const initialX = e.touches ? e.touches[0].pageX : e.pageX
    const initialY = e.touches ? e.touches[0].pageY : e.pageY
    const position = e.target.getBoundingClientRect()
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
                    draggedComponentState: stateRef,
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
        if (!state.draggedComponentState.id) {
            return STATE_NODE_SELECTED(stateRef)
        }
        if (!state.hoveredPipe && !state.hoveredEvent) {
            return setState({
                ...state,
                draggedComponentState: {},
                hoveredPipe: null,
            })
        }
        if (state.hoveredEvent) {
            const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
            let eventRef = selectedNode.events.find(
                eventRef => state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].type === state.hoveredEvent.type
            )
            // check if event already changes the state
            if (
                eventRef &&
                state.definitionList[state.currentDefinitionId][state.draggedComponentState.ref][state.draggedComponentState.id].mutators
                    .map(mutatorRef => state.definitionList[state.currentDefinitionId].mutator[mutatorRef.id].event.id)
                    .find(eventId => eventId === eventRef.id)
            ) {
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredEvent: null,
                })
            }
            const eventId = uuid()
            const mutatorId = uuid()
            const pipeId = uuid()

            // add event if it didn't exist before
            const fixedEvents =
                eventRef !== undefined
                    ? state.definitionList[state.currentDefinitionId].event
                    : {
                          ...state.definitionList[state.currentDefinitionId].event,
                          [eventId]: {
                              type: state.hoveredEvent.type,
                              emitter: state.selectedViewNode,
                              mutators: [],
                          },
                      }
            const fixedNode =
                eventRef !== undefined
                    ? state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref]
                    : {
                          ...state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref],
                          [state.selectedViewNode.id]: {
                              ...state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id],
                              events: state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][
                                  state.selectedViewNode.id
                              ].events.concat({ ref: 'event', id: eventId }),
                          },
                      }
            eventRef = eventRef || { ref: 'event', id: eventId }
            return setState({
                ...state,
                draggedComponentState: {},
                hoveredEvent: null,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: {
                        ...state.definitionList[state.currentDefinitionId],
                        pipe: {
                            ...state.definitionList[state.currentDefinitionId].pipe,
                            [pipeId]: {
                                type:
                                    state.definitionList[state.currentDefinitionId][state.draggedComponentState.ref][
                                        state.draggedComponentState.id
                                    ].type,
                                value: state.draggedComponentState,
                                transformations: [],
                            },
                        },
                        [state.draggedComponentState.ref]: {
                            ...state.definitionList[state.currentDefinitionId][state.draggedComponentState.ref],
                            [state.draggedComponentState.id]: {
                                ...state.definitionList[state.currentDefinitionId][state.draggedComponentState.ref][
                                    state.draggedComponentState.id
                                ],
                                mutators: state.definitionList[state.currentDefinitionId][state.draggedComponentState.ref][
                                    state.draggedComponentState.id
                                ].mutators.concat({
                                    ref: 'mutator',
                                    id: mutatorId,
                                }),
                            },
                        },
                        [state.selectedViewNode.ref]: {
                            ...fixedNode,
                        },
                        mutator: {
                            ...state.definitionList[state.currentDefinitionId].mutator,
                            [mutatorId]: {
                                event: eventRef,
                                state: state.draggedComponentState,
                                mutation: { ref: 'pipe', id: pipeId },
                            },
                        },
                        event: {
                            ...fixedEvents,
                            [eventRef.id]: {
                                ...fixedEvents[eventRef.id],
                                mutators: fixedEvents[eventRef.id].mutators.concat({
                                    ref: 'mutator',
                                    id: mutatorId,
                                }),
                            },
                        },
                    },
                },
            })
        }
        const pipeDropped = state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id]
        const typeDropped =
            state.draggedComponentState.ref === 'eventData'
                ? eventDataTypes[state.draggedComponentState.id].type
                : state.definitionList[state.currentDefinitionId][state.draggedComponentState.ref][state.draggedComponentState.id].type
        if (pipeDropped.type === 'text') {
            if (state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id].value.ref) {
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredPipe: null,
                    definitionList: {
                        ...state.definitionList,
                        [state.currentDefinitionId]: {
                            ...state.definitionList[state.currentDefinitionId],
                            pipe: {
                                ...state.definitionList[state.currentDefinitionId].pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                    value: state.draggedComponentState,
                                    transformations: [],
                                },
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
                draggedComponentState: {},
                hoveredPipe: null,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: {
                        ...state.definitionList[state.currentDefinitionId],
                        pipe: {
                            ...state.definitionList[state.currentDefinitionId].pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                transformations: [{ ref: 'join', id: joinIdState }, { ref: 'join', id: joinIdText }].concat(
                                    state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id].transformations
                                ),
                            },
                            [pipeIdState]: {
                                type: typeDropped,
                                value: state.draggedComponentState,
                                transformations: [],
                            },
                            [pipeIdText]: {
                                type: 'text',
                                value: '',
                                transformations: [],
                            },
                        },
                        join: {
                            ...state.definitionList[state.currentDefinitionId].join,
                            [joinIdState]: {
                                value: { ref: 'pipe', id: pipeIdState },
                            },
                            [joinIdText]: {
                                value: { ref: 'pipe', id: pipeIdText },
                            },
                        },
                    },
                },
            })
        }
        if (pipeDropped.type === 'number') {
            // you can't drop boolean into number
            if (typeDropped === 'boolean') {
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredPipe: null,
                })
            }
            if (typeDropped === 'text') {
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredPipe: null,
                    definitionList: {
                        ...state.definitionList,
                        [state.currentDefinitionId]: {
                            ...state.definitionList[state.currentDefinitionId],
                            pipe: {
                                ...state.definitionList[state.currentDefinitionId].pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                    value: state.draggedComponentState,
                                    transformations: [
                                        {
                                            ref: 'length',
                                            id: 'noop',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                })
            }
            setState({
                ...state,
                draggedComponentState: {},
                hoveredPipe: null,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: {
                        ...state.definitionList[state.currentDefinitionId],
                        pipe: {
                            ...state.definitionList[state.currentDefinitionId].pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                value: state.draggedComponentState,
                            },
                        },
                    },
                },
            })
        }
        if (pipeDropped.type === 'boolean') {
            if (typeDropped === 'number') {
                const eqId = uuid()
                const pipeId = uuid()
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredPipe: null,
                    definitionList: {
                        ...state.definitionList,
                        [state.currentDefinitionId]: {
                            ...state.definitionList[state.currentDefinitionId],
                            pipe: {
                                ...state.definitionList[state.currentDefinitionId].pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                    value: state.draggedComponentState,
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
                                ...state.definitionList[state.currentDefinitionId].equal,
                                [eqId]: {
                                    value: {
                                        ref: 'pipe',
                                        id: pipeId,
                                    },
                                },
                            },
                        },
                    },
                })
            }
            if (typeDropped === 'text') {
                const eqId = uuid()
                const pipeId = uuid()
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredPipe: null,
                    definitionList: {
                        ...state.definitionList,
                        [state.currentDefinitionId]: {
                            ...state.definitionList[state.currentDefinitionId],
                            pipe: {
                                ...state.definitionList[state.currentDefinitionId].pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                    value: state.draggedComponentState,
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
                                ...state.definitionList[state.currentDefinitionId].equal,
                                [eqId]: {
                                    value: {
                                        ref: 'pipe',
                                        id: pipeId,
                                    },
                                },
                            },
                        },
                    },
                })
            }
            setState({
                ...state,
                draggedComponentState: {},
                hoveredPipe: null,
                definitionList: {
                    ...state.definitionList,
                    [state.currentDefinitionId]: {
                        ...state.definitionList[state.currentDefinitionId],
                        pipe: {
                            ...state.definitionList[state.currentDefinitionId].pipe,
                            [state.hoveredPipe.id]: {
                                ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                value: state.draggedComponentState,
                                transformations: [],
                            },
                        },
                    },
                },
            })
        }
        if (pipeDropped.type === 'table') {
            if (typeDropped === 'table') {
                return setState({
                    ...state,
                    draggedComponentState: {},
                    hoveredPipe: null,
                    definitionList: {
                        ...state.definitionList,
                        [state.currentDefinitionId]: {
                            ...state.definitionList[state.currentDefinitionId],
                            pipe: {
                                ...state.definitionList[state.currentDefinitionId].pipe,
                                [state.hoveredPipe.id]: {
                                    ...state.definitionList[state.currentDefinitionId].pipe[state.hoveredPipe.id],
                                    value: state.draggedComponentState,
                                },
                            },
                        },
                    },
                })
            }
            setState({
                ...state,
                draggedComponentState: {},
                hoveredPipe: null,
            })
        }
    }
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)
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
    if (selfOnly && e.target !== this) {
        return
    }
    setState({ ...state, selectedViewNode: {} })
}
export function STATE_NODE_SELECTED(ref) {
    setState({ ...state, selectedStateNode: ref })
}
export function UNSELECT_STATE_NODE(e) {
    if (e.target === this) {
        setState({ ...state, selectedStateNode: {} })
    }
}
export function ADD_NODE(nodeRef, type) {
    if (
        !nodeRef.ref ||
        !state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id] ||
        !state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id].children
    ) {
        if (
            state.selectedViewNode.ref &&
            state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id] &&
            state.selectedViewNode.id !== '_rootNode'
        ) {
            nodeRef = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id].parent
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
        width: uuid(),
        margin: uuid(),
        padding: uuid(),
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
        border: uuid(),
        borderRadius: uuid(),
        background: uuid(),
        opacity: uuid(),
        overflow: uuid(),
        boxShadow: uuid(),
        cursor: uuid(),
        transition: uuid(),
    }
    const boxStylePipes = {
        [styleIds.flex]: {
            type: 'text',
            value: '0',
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
        [styleIds.width]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.margin]: {
            type: 'text',
            value: '',
            transformations: [],
        },
        [styleIds.padding]: {
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
        [styleIds.background]: {
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
        [styleIds.border]: {
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
        [styleIds.transition]: {
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
    const newStyle =
        type === 'text' || type === 'input'
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
            events: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeBox', id: newNodeId },
            definitionList:
                nodeRef.ref === 'vNodeBox'
                    ? {
                          ...state.definitionList,
                          [state.currentDefinitionId]: {
                              ...state.definitionList[state.currentDefinitionId],
                              pipe: { ...state.definitionList[state.currentDefinitionId].pipe, ...boxStylePipes },
                              vNodeBox: {
                                  ...state.definitionList[state.currentDefinitionId].vNodeBox,
                                  [nodeId]: {
                                      ...state.definitionList[state.currentDefinitionId].vNodeBox[nodeId],
                                      children: state.definitionList[state.currentDefinitionId].vNodeBox[nodeId].children.concat({
                                          ref: 'vNodeBox',
                                          id: newNodeId,
                                      }),
                                  },
                                  [newNodeId]: newNode,
                              },
                              style: {
                                  ...state.definitionList[state.currentDefinitionId].style,
                                  [newStyleId]: newStyle,
                              },
                          },
                      }
                    : {
                          ...state.definitionList,
                          [state.currentDefinitionId]: {
                              ...state.definitionList[state.currentDefinitionId],
                              [nodeRef.ref]: {
                                  ...state.definitionList[state.currentDefinitionId][nodeRef.ref],
                                  [nodeId]: {
                                      ...state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId],
                                      children: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId].children.concat({
                                          ref: 'vNodeBox',
                                          id: newNodeId,
                                      }),
                                  },
                              },
                              pipe: { ...state.definitionList[state.currentDefinitionId].pipe, ...boxStylePipes },
                              vNodeBox: {
                                  ...state.definitionList[state.currentDefinitionId].vNodeBox,
                                  [newNodeId]: newNode,
                              },
                              style: {
                                  ...state.definitionList[state.currentDefinitionId].style,
                                  [newStyleId]: newStyle,
                              },
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
            events: [],
        }
        const newPipe = {
            type: 'text',
            value: 'Default Text',
            transformations: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeText', id: newNodeId },
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    pipe: {
                        ...state.definitionList[state.currentDefinitionId].pipe,
                        [pipeId]: newPipe,
                        ...textStylePipes,
                    },
                    [nodeRef.ref]: {
                        ...state.definitionList[state.currentDefinitionId][nodeRef.ref],
                        [nodeId]: {
                            ...state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId],
                            children: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId].children.concat({
                                ref: 'vNodeText',
                                id: newNodeId,
                            }),
                        },
                    },
                    vNodeText: {
                        ...state.definitionList[state.currentDefinitionId].vNodeText,
                        [newNodeId]: newNode,
                    },
                    style: {
                        ...state.definitionList[state.currentDefinitionId].style,
                        [newStyleId]: newStyle,
                    },
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
            events: [],
        }
        const newPipe = {
            type: 'text',
            value: 'https://www.ugnis.com/images/logo_new256x256.png',
            transformations: [],
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeImage', id: newNodeId },
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    pipe: {
                        ...state.definitionList[state.currentDefinitionId].pipe,
                        [pipeId]: newPipe,
                        ...boxStylePipes,
                    },
                    [nodeRef.ref]: {
                        ...state.definitionList[state.currentDefinitionId][nodeRef.ref],
                        [nodeId]: {
                            ...state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId],
                            children: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId].children.concat({
                                ref: 'vNodeImage',
                                id: newNodeId,
                            }),
                        },
                    },
                    vNodeImage: {
                        ...state.definitionList[state.currentDefinitionId].vNodeImage,
                        [newNodeId]: newNode,
                    },
                    style: {
                        ...state.definitionList[state.currentDefinitionId].style,
                        [newStyleId]: newStyle,
                    },
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
            definitionList:
                nodeRef.ref === 'vNodeIf'
                    ? {
                          ...state.definitionList,
                          [state.currentDefinitionId]: {
                              ...state.definitionList[state.currentDefinitionId],
                              pipe: { ...state.definitionList[state.currentDefinitionId].pipe, [pipeId]: newPipe },
                              vNodeIf: {
                                  ...state.definitionList[state.currentDefinitionId].vNodeIf,
                                  [nodeId]: {
                                      ...state.definitionList[state.currentDefinitionId].vNodeIf[nodeId],
                                      children: state.definitionList[state.currentDefinitionId].vNodeIf[nodeId].children.concat({
                                          ref: 'vNodeIf',
                                          id: newNodeId,
                                      }),
                                  },
                                  [newNodeId]: newNode,
                              },
                          },
                      }
                    : {
                          ...state.definitionList,
                          [state.currentDefinitionId]: {
                              ...state.definitionList[state.currentDefinitionId],
                              pipe: { ...state.definitionList[state.currentDefinitionId].pipe, [pipeId]: newPipe },
                              [nodeRef.ref]: {
                                  ...state.definitionList[state.currentDefinitionId][nodeRef.ref],
                                  [nodeId]: {
                                      ...state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId],
                                      children: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId].children.concat({
                                          ref: 'vNodeIf',
                                          id: newNodeId,
                                      }),
                                  },
                              },
                              vNodeIf: {
                                  ...state.definitionList[state.currentDefinitionId].vNodeIf,
                                  [newNodeId]: newNode,
                              },
                          },
                      },
        })
    }
    if (type === 'list') {
        const pipeId = uuid()
        // search for a table in state, if none found create a new table
        const existingTableId = Object.keys(state.definitionList[state.currentDefinitionId].table)[0]
        const tableId = existingTableId || uuid()
        const newNode = {
            title: 'list',
            parent: nodeRef,
            value: { ref: 'pipe', id: pipeId },
            children: [],
        }
        const newPipe = {
            type: 'table',
            value: { ref: 'table', id: tableId },
            transformations: [],
        }
        const newTable = {
            title: 'table',
            type: 'table',
            defaultValue: [],
            columns: [],
            mutators: [],
        }
        const resolvedNodes =
            nodeRef.ref === 'vNodeList'
                ? {
                      vNodeList: {
                          ...state.definitionList[state.currentDefinitionId].vNodeList,
                          [nodeId]: {
                              ...state.definitionList[state.currentDefinitionId].vNodeList[nodeId],
                              children: state.definitionList[state.currentDefinitionId].vNodeList[nodeId].children.concat({
                                  ref: 'vNodeList',
                                  id: newNodeId,
                              }),
                          },
                          [newNodeId]: newNode,
                      },
                  }
                : {
                      [nodeRef.ref]: {
                          ...state.definitionList[state.currentDefinitionId][nodeRef.ref],
                          [nodeId]: {
                              ...state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId],
                              children: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId].children.concat({
                                  ref: 'vNodeList',
                                  id: newNodeId,
                              }),
                          },
                      },
                      vNodeList: {
                          ...state.definitionList[state.currentDefinitionId].vNodeList,
                          [newNodeId]: newNode,
                      },
                  }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeList', id: newNodeId },
            componentState: existingTableId
                ? state.componentState
                : {
                      ...state.componentState,
                      [tableId]: [],
                  },
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    nameSpace: {
                        ...state.definitionList[state.currentDefinitionId].nameSpace,
                        ['_rootNameSpace']: {
                            ...state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'],
                            children: existingTableId
                                ? state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'].children
                                : state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'].children.concat({
                                      ref: 'table',
                                      id: tableId,
                                  }),
                        },
                    },
                    table: existingTableId
                        ? state.definitionList[state.currentDefinitionId].table
                        : {
                              ...state.definitionList[state.currentDefinitionId].table,
                              [tableId]: newTable,
                          },
                    pipe: { ...state.definitionList[state.currentDefinitionId].pipe, [pipeId]: newPipe },
                    ...resolvedNodes,
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
            events: [{ ref: 'event', id: eventId }],
        }
        const newPipeInput = {
            type: 'text',
            value: { ref: 'state', id: stateId },
            transformations: [],
        }
        const newPipeMutator = {
            type: 'text',
            value: { ref: 'eventData', id: 'value' },
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
        }
        return setState({
            ...state,
            selectedViewNode: { ref: 'vNodeInput', id: newNodeId },
            componentState: {
                ...state.componentState,
                [stateId]: newState.defaultValue,
            },
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    pipe: {
                        ...state.definitionList[state.currentDefinitionId].pipe,
                        [pipeInputId]: newPipeInput,
                        [pipeMutatorId]: newPipeMutator,
                        ...textStylePipes,
                    },
                    [nodeRef.ref]: {
                        ...state.definitionList[state.currentDefinitionId][nodeRef.ref],
                        [nodeId]: {
                            ...state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId],
                            children: state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeId].children.concat({
                                ref: 'vNodeInput',
                                id: newNodeId,
                            }),
                        },
                    },
                    vNodeInput: {
                        ...state.definitionList[state.currentDefinitionId].vNodeInput,
                        [newNodeId]: newNode,
                    },
                    style: {
                        ...state.definitionList[state.currentDefinitionId].style,
                        [newStyleId]: newStyle,
                    },
                    nameSpace: {
                        ...state.definitionList[state.currentDefinitionId].nameSpace,
                        ['_rootNameSpace']: {
                            ...state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'],
                            children: state.definitionList[state.currentDefinitionId].nameSpace['_rootNameSpace'].children.concat({
                                ref: 'state',
                                id: stateId,
                            }),
                        },
                    },
                    state: { ...state.definitionList[state.currentDefinitionId].state, [stateId]: newState },
                    mutator: {
                        ...state.definitionList[state.currentDefinitionId].mutator,
                        [mutatorId]: newMutator,
                    },
                    event: { ...state.definitionList[state.currentDefinitionId].event, [eventId]: newEvent },
                },
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
            title: 'table',
            type: 'table',
            defaultValue: [],
            columns: [],
            mutators: [],
        }
        return setState({
            ...state,
            componentState: {
                ...state.componentState,
                [newStateId]: newState.defaultValue,
            },
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    nameSpace: {
                        ...state.definitionList[state.currentDefinitionId].nameSpace,
                        [namespaceId]: {
                            ...state.definitionList[state.currentDefinitionId].nameSpace[namespaceId],
                            children: state.definitionList[state.currentDefinitionId].nameSpace[namespaceId].children.concat({
                                ref: 'table',
                                id: newStateId,
                            }),
                        },
                    },
                    table: {
                        ...state.definitionList[state.currentDefinitionId].table,
                        [newStateId]: newState,
                    },
                },
            },
        })
    }
    if (type === 'folder') {
        newState = {
            title: 'new folder',
            children: [],
        }
        return setState({
            ...state,
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    nameSpace: {
                        ...state.definitionList[state.currentDefinitionId].nameSpace,
                        [namespaceId]: {
                            ...state.definitionList[state.currentDefinitionId].nameSpace[namespaceId],
                            children: state.definitionList[state.currentDefinitionId].nameSpace[namespaceId].children.concat({
                                ref: 'nameSpace',
                                id: newStateId,
                            }),
                        },
                        [newStateId]: newState,
                    },
                },
            },
        })
    }
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [newStateId]: newState.defaultValue,
        },
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                nameSpace: {
                    ...state.definitionList[state.currentDefinitionId].nameSpace,
                    [namespaceId]: {
                        ...state.definitionList[state.currentDefinitionId].nameSpace[namespaceId],
                        children: state.definitionList[state.currentDefinitionId].nameSpace[namespaceId].children.concat({
                            ref: 'state',
                            id: newStateId,
                        }),
                    },
                },
                state: { ...state.definitionList[state.currentDefinitionId].state, [newStateId]: newState },
            },
        },
    })
}
export function SELECT_VIEW_SUBMENU(newId) {
    setState({ ...state, selectedViewSubMenu: newId })
}
export function EDIT_VIEW_NODE_TITLE(nodeId) {
    setState({ ...state, editingTitleNodeId: nodeId })
}
function deleteView(nodeRef, parentRef, state) {
    // remove all events from state
    const events = getAvailableEvents(nodeRef.ref)
    let newState = state.definitionList[state.currentDefinitionId].state
    events.forEach(event => {
        const eventRef = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id][event.propertyName]
        if (eventRef) {
            // event -> mutators -> states
            state.definitionList[state.currentDefinitionId][eventRef.ref][eventRef.id].mutators.forEach(mutatorRef => {
                const stateRef = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id].state
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
    return {
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [parentRef.ref]: {
                    ...state.definitionList[state.currentDefinitionId][parentRef.ref],
                    [parentRef.id]: {
                        ...state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id],
                        children: state.definitionList[state.currentDefinitionId][parentRef.ref][parentRef.id].children.filter(
                            ref => ref.id !== nodeRef.id
                        ),
                    },
                },
                state: newState,
            },
        },
        selectedViewNode: {},
    }
}
export function DELETE_SELECTED_VIEW(nodeRef, parentRef) {
    setState(deleteView(nodeRef, parentRef, state))
}
export function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
    e.preventDefault()
    const nodeId = nodeRef.id
    const nodeType = nodeRef.ref
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [nodeType]: {
                    ...state.definitionList[state.currentDefinitionId][nodeType],
                    [nodeId]: {
                        ...state.definitionList[state.currentDefinitionId][nodeType][nodeId],
                        title: e.target.value,
                    },
                },
            },
        },
    })
}
export function CHANGE_STATE_NODE_TITLE(stateRef, e) {
    e.preventDefault()
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [stateRef.ref]: {
                    ...state.definitionList[state.currentDefinitionId][stateRef.ref],
                    [stateRef.id]: {
                        ...state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id],
                        title: e.target.value,
                    },
                },
            },
        },
    })
}

export function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e) {
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [stateId]: e.target.value,
        },
    })
}
export function CHANGE_CURRENT_STATE_TEXT_VALUE_TABLE(stateId, tableId, rowId, e) {
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [tableId]: state.componentState[tableId].map(row => (row.id !== rowId ? row : { ...row, [stateId]: e.target.value })),
        },
    })
}
export function CHANGE_CURRENT_STATE_BOOLEAN_VALUE(stateId, e) {
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [stateId]: e.target.value === 'true',
        },
    })
}
export function CHANGE_CURRENT_STATE_BOOLEAN_VALUE_TABLE(stateId, tableId, rowId, e) {
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [tableId]: state.componentState[tableId].map(
                row => (row.id !== rowId ? row : { ...row, [stateId]: e.target.value === 'true' })
            ),
        },
    })
}
export function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId, e) {
    if (e.target.value.toString() !== state.componentState[stateId].toString()) {
        setState({
            ...state,
            componentState: {
                ...state.componentState,
                [stateId]: Number(e.target.value),
            },
        })
    }
}
export function CHANGE_CURRENT_STATE_NUMBER_VALUE_TABLE(stateId, tableId, rowId, e) {
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [tableId]: state.componentState[tableId].map(row => (row.id !== rowId ? row : { ...row, [stateId]: Number(e.target.value) })),
        },
    })
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
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [ref.ref]: {
                    ...state.definitionList[state.currentDefinitionId][ref.ref],
                    [ref.id]: {
                        ...state.definitionList[state.currentDefinitionId][ref.ref][ref.id],
                        [propertyName]: value,
                    },
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
    const pipe = state.definitionList[state.currentDefinitionId].pipe[pipeId]
    const stateInPipe = state.definitionList[state.currentDefinitionId][pipe.value.ref][pipe.value.id]
    const transformation = defaultTransformations[stateInPipe.type]
    const value = defaultValues[stateInPipe.type]
    const newPipeId = uuid()
    const newId = uuid()

    const oldTransformations = state.definitionList[state.currentDefinitionId].pipe[pipeId].transformations
    const newPipeTransformations =
        pipe.type === 'text' || pipe.type === stateInPipe.type
            ? oldTransformations.concat({ ref: transformation, id: newId })
            : oldTransformations
                  .slice(0, oldTransformations.length - 1)
                  .concat({ ref: transformation, id: newId })
                  .concat(oldTransformations.slice(oldTransformations.length - 1))
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [transformation]: {
                    ...state.definitionList[state.currentDefinitionId][transformation],
                    [newId]: {
                        value: { ref: 'pipe', id: newPipeId },
                    },
                },
                pipe: {
                    ...state.definitionList[state.currentDefinitionId].pipe,
                    [newPipeId]: {
                        type: pipe.type,
                        value: value,
                        transformations: [],
                    },
                    [pipeId]: {
                        ...state.definitionList[state.currentDefinitionId].pipe[pipeId],
                        transformations: newPipeTransformations,
                    },
                },
            },
        },
    })
}

export function DELETE_TRANSFORMATION(pipeRef, transformationRef) {
    const currentDefinitionId = state.currentDefinitionId
    const pipeId = pipeRef.id
    const remainingTransformations = state.definitionList[state.currentDefinitionId].pipe[pipeId].transformations.filter(
        element => element.id !== transformationRef.id
    )
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [currentDefinitionId]: {
                ...state.definitionList[currentDefinitionId],
                pipe: {
                    ...state.definitionList[currentDefinitionId].pipe,
                    [pipeId]: {
                        ...state.definitionList[currentDefinitionId].pipe[pipeId],
                        transformations: remainingTransformations,
                    },
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
export function SAVE_DEFAULT(stateRef) {
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [stateRef.ref]: {
                    ...state.definitionList[state.currentDefinitionId][stateRef.ref],
                    [stateRef.id]: {
                        ...state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id],
                        defaultValue: state.componentState[stateRef.id],
                    },
                },
            },
        },
    })
}
export function DELETE_STATE(stateRef) {
    const stateId = stateRef.id
    let updatedState = state
    if (stateRef.ref === 'table') {
        // delete lists that use the state
        Object.keys(state.definitionList[state.currentDefinitionId].vNodeList).forEach(nodeId => {
            const node = state.definitionList[state.currentDefinitionId].vNodeList[nodeId]
            const pipeId = node.value.id
            if (state.definitionList[state.currentDefinitionId].pipe[pipeId].value.id === stateId) {
                updatedState = deleteView({ ref: 'vNodeList', id: nodeId }, node.parent, updatedState)
            }
        })
    } else {
        // fix all the broken pipes
        Object.keys(state.definitionList[state.currentDefinitionId].pipe).forEach(pipeId => {
            if (state.definitionList[state.currentDefinitionId].pipe[pipeId].value.id === stateId) {
                updatedState = resetPipeFunc(pipeId, updatedState)
            }
        })
    }
    // remove from table nameSpace
    Object.keys(state.definitionList[state.currentDefinitionId].table).forEach(tableId => {
        const table = state.definitionList[state.currentDefinitionId].table[tableId]
        const newColumns = table.columns.filter(columnRef => columnRef.id !== stateId)
        if (newColumns.length !== table.columns.length) {
            updatedState = {
                ...updatedState,
                definitionList: {
                    ...updatedState.definitionList,
                    [state.currentDefinitionId]: {
                        ...updatedState.definitionList[updatedState.currentDefinitionId],
                        table: {
                            ...updatedState.definitionList[updatedState.currentDefinitionId].table,
                            [tableId]: {
                                ...updatedState.definitionList[updatedState.currentDefinitionId].table[tableId],
                                columns: newColumns,
                            },
                        },
                    },
                },
            }
        }
    })

    const { [stateId]: deletedState, ...newState } = updatedState.definitionList[state.currentDefinitionId][stateRef.ref]
    let events = updatedState.definitionList[state.currentDefinitionId].event
    deletedState.mutators.forEach(mutatorRef => {
        const mutator = updatedState.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]
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
        ...updatedState,
        selectedStateNode: {},
        definitionList: {
            ...updatedState.definitionList,
            [state.currentDefinitionId]: {
                ...updatedState.definitionList[updatedState.currentDefinitionId],
                [stateRef.ref]: newState,
                nameSpace: {
                    ...updatedState.definitionList[updatedState.currentDefinitionId].nameSpace,
                    _rootNameSpace: {
                        ...updatedState.definitionList[updatedState.currentDefinitionId].nameSpace['_rootNameSpace'],
                        children: updatedState.definitionList[updatedState.currentDefinitionId].nameSpace['_rootNameSpace'].children.filter(
                            ref => ref.id !== stateId
                        ),
                    },
                },
                event: events,
            },
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
    Object.keys(state.definitionList[state.currentDefinitionId].join).forEach(joinId => {
        if (state.definitionList[state.currentDefinitionId].join[joinId].value.id === pipeId) {
            parentJoinId = joinId
        }
    })
    if (parentJoinId) {
        const pipes = Object.keys(state.definitionList[state.currentDefinitionId].pipe)
        for (let i = 0; i < pipes.length; i++) {
            const parentPipeId = pipes[i]
            for (
                let index = 0;
                index < state.definitionList[state.currentDefinitionId].pipe[parentPipeId].transformations.length;
                index++
            ) {
                const ref = state.definitionList[state.currentDefinitionId].pipe[parentPipeId].transformations[index]
                if (ref.id === parentJoinId) {
                    const joinRef = state.definitionList[state.currentDefinitionId].pipe[parentPipeId].transformations[index + 1]
                    const secondPipeRef = state.definitionList[state.currentDefinitionId].join[joinRef.id].value
                    const text = state.definitionList[state.currentDefinitionId].pipe[secondPipeRef.id].value
                    return {
                        ...state,
                        selectedPipeId: '',
                        definitionList: {
                            ...state.definitionList,
                            [state.currentDefinitionId]: {
                                ...state.definitionList[state.currentDefinitionId],
                                pipe: {
                                    ...state.definitionList[state.currentDefinitionId].pipe,
                                    [parentPipeId]: {
                                        ...state.definitionList[state.currentDefinitionId].pipe[parentPipeId],
                                        value: state.definitionList[state.currentDefinitionId].pipe[parentPipeId].value + text,
                                        transformations: state.definitionList[state.currentDefinitionId].pipe[parentPipeId].transformations
                                            .slice(0, index)
                                            .concat(state.definitionList[state.currentDefinitionId].pipe[secondPipeRef.id].transformations)
                                            .concat(
                                                state.definitionList[state.currentDefinitionId].pipe[parentPipeId].transformations.slice(
                                                    index + 2
                                                )
                                            ),
                                    },
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
            definitionList: {
                ...state.definitionList,
                [state.currentDefinitionId]: {
                    ...state.definitionList[state.currentDefinitionId],
                    pipe: {
                        ...state.definitionList[state.currentDefinitionId].pipe,
                        [pipeId]: {
                            ...state.definitionList[state.currentDefinitionId].pipe[pipeId],
                            value: defaultValues[state.definitionList[state.currentDefinitionId].pipe[pipeId].type],
                            transformations: [],
                        },
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
export function CHANGE_TRANSFORMATION(pipeRef, oldTransformationRef, index, e) {
    const newRefName = e.target.value

    if (oldTransformationRef.ref === newRefName) {
        return
    }
    // TODO should not be using the same old transform, because some transformations might have different parameters
    const oldTransform = state.definitionList[state.currentDefinitionId][oldTransformationRef.ref][oldTransformationRef.id]

    // finds value in an array and updates it
    const findAndAdjust = (findFn, adjustFn) => R.converge(R.adjust(adjustFn), [R.findIndex(findFn), R.identity])

    setState(
        R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    pipe: {
                        [pipeRef.id]: {
                            transformations: findAndAdjust(
                                transformation => transformation.id === oldTransformationRef.id,
                                R.assoc('ref', newRefName)
                            ),
                        },
                    },
                    [oldTransformationRef.ref]: R.omit(oldTransformationRef.id),
                    [newRefName]: R.assoc([oldTransformationRef.id], oldTransform),
                },
            },
        })(state)
    )
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
        currentDefinitionId: newApp.id,
        selectedViewNode: {},
        selectedPipeId: '',
        selectedStateNode: {},
    })
}
export function SELECT_COMPONENT(id) {
    setState({
        ...state,
        componentState: createDefaultState(state.definitionList[id]),
        eventStack: { [id]: [] },
        currentDefinitionId: id,
        selectedViewNode: {},
        selectedPipeId: '',
        selectedStateNode: {},
    })
}
export function CHANGE_COMPONENT_PATH(name, e) {
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                [name]: e.target.value,
            },
        },
    })
}

export function UPDATE_TABLE_DEFAULT_RECORD(tableId, e) {
    const table = state.definitionList[state.currentDefinitionId].table[tableId]
    let defaultRow = {}
    table.columns.forEach(stateRef => {
        defaultRow[stateRef.id] = state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id].defaultValue
    })
    defaultRow.id = uuid()
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [tableId]: state.componentState[tableId].concat(defaultRow),
        },
    })
}

export function UPDATE_TABLE_ADD_COLUMN(tableId, type) {
    // update table def
    // add new state
    // update running app
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
    let updatedTable = state.componentState[tableId].map(row => ({ ...row, [newStateId]: newState.defaultValue }))
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [tableId]: updatedTable,
        },
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                table: {
                    ...state.definitionList[state.currentDefinitionId].table,
                    [tableId]: {
                        ...state.definitionList[state.currentDefinitionId].table[tableId],
                        defaultValue: state.definitionList[state.currentDefinitionId].table[tableId].defaultValue.map(row => ({
                            ...row,
                            [newStateId]: newState.defaultValue,
                        })),
                        columns: state.definitionList[state.currentDefinitionId].table[tableId].columns.concat({
                            ref: 'state',
                            id: newStateId,
                        }),
                    },
                },
                state: {
                    ...state.definitionList[state.currentDefinitionId].state,
                    [newStateId]: newState,
                },
            },
        },
    })
}

export function DELETE_TABLE_ROW(tableId, rowId) {
    let updatedTable = state.componentState[tableId].filter(row => row.id !== rowId)
    setState({
        ...state,
        componentState: {
            ...state.componentState,
            [tableId]: updatedTable,
        },
    })
}

export function REMOVE_MUTATOR(mutatorRef) {
    const mutator = state.definitionList[state.currentDefinitionId][mutatorRef.ref][mutatorRef.id]

    const { [mutatorRef.id]: deletedMutator, ...mutatorsLeft } = state.definitionList[state.currentDefinitionId][mutatorRef.ref]
    setState({
        ...state,
        definitionList: {
            ...state.definitionList,
            [state.currentDefinitionId]: {
                ...state.definitionList[state.currentDefinitionId],
                state: {
                    ...state.definitionList[state.currentDefinitionId].state,
                    [mutator.state.id]: {
                        ...state.definitionList[state.currentDefinitionId].state[mutator.state.id],
                        mutators: state.definitionList[state.currentDefinitionId].state[mutator.state.id].mutators.filter(
                            ref => ref.id !== mutatorRef.id
                        ),
                    },
                },
                mutator: mutatorsLeft,
                event: {
                    ...state.definitionList[state.currentDefinitionId].event,
                    [mutator.event.id]: {
                        ...state.definitionList[state.currentDefinitionId].event[mutator.event.id],
                        mutators: state.definitionList[state.currentDefinitionId].event[mutator.event.id].mutators.filter(
                            ref => ref.id !== mutatorRef.id
                        ),
                    },
                },
            },
        },
    })
}
