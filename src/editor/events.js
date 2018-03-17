import emptyApp from '../_empty.json'
import { state, setState } from 'lape'
import R from 'ramda'

import { uuid } from './utils'

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
    const item = array[moveIndex]
    const length = array.length
    const diff = moveIndex - toIndex

    if (diff > 0) {
        return [...array.slice(0, toIndex), item, ...array.slice(toIndex, moveIndex), ...array.slice(moveIndex + 1, length)]
    } else if (diff < 0) {
        return [...array.slice(0, moveIndex), ...array.slice(moveIndex + 1, toIndex + 1), item, ...array.slice(toIndex + 1, length)]
    }
    return array
}

function generateEmptyApp() {
    return R.assoc('id', uuid(), emptyApp)
}

export function createDefaultState(definition) {
    return definition.nameSpace['_rootNameSpace'].children.reduce((acc, ref) => {
        const def = definition[ref.ref][ref.id]
        acc[ref.id] = def.defaultValue
        return acc
    }, {})
}

function findNode(ref) {
    return state.definitionList[state.currentDefinitionId][ref.ref][ref.id]
}

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
    setState(R.over(R.lensProp('hoveredViewWithoutDrag'), R.empty, state))
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

    setState(R.assoc('hoveredPipe', pipeRef, state))
}

export function PIPE_UNHOVERED() {
    if (state.hoveredPipe) {
        setState(R.assoc('hoveredPipe', null, state))
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
    setState(
        R.evolve({
            appIsFrozen: R.not,
            selectedViewNode: state.appIsFrozen ? R.empty : R.identity,
        })(state)
    )
}

export function VIEW_FOLDER_CLICKED(nodeId, forcedValue) {
    setState(
        R.assocPath(
            ['viewFoldersClosed', nodeId],
            forcedValue !== undefined ? forcedValue : !state.viewFoldersClosed[nodeId],
            state
        )
    )
}

export function VIEW_NODE_SELECTED(ref) {
    setState(R.assoc('selectedViewNode', ref, state))
}

export function UNSELECT_VIEW_NODE(selfOnly, stopPropagation, e) {
    if (stopPropagation) {
        e.stopPropagation()
    }
    if (selfOnly && e.target !== this) {
        return
    }
    setState(R.over(R.lensProp('selectedViewNode'), R.empty, state))
}

export function STATE_NODE_SELECTED(ref) {
    setState(R.assoc('selectedStateNode', ref, state))
}

export function UNSELECT_STATE_NODE(e) {
    if (e.target === this) {
        setState(R.over(R.lensProp('selectedStateNode'), R.empty, state))
    }
}

export function ADD_NODE(nodeRef, type) {
    const currentDefinition = state.definitionList[state.currentDefinitionId]

    if (
        !nodeRef.ref ||
        !currentDefinition[nodeRef.ref][nodeRef.id] ||
        !currentDefinition[nodeRef.ref][nodeRef.id].children
    ) {
        if (
            state.selectedViewNode.ref &&
            currentDefinition[state.selectedViewNode.ref][state.selectedViewNode.id] &&
            state.selectedViewNode.id !== '_rootNode'
        ) {
            nodeRef = currentDefinition[state.selectedViewNode.ref][state.selectedViewNode.id].parent
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
        transform: uuid(),
        transition: uuid(),
    }
    const boxStylePipes = {
        [styleIds.flex]: {
            type: 'text',
            value: '0 0 auto',
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
        [styleIds.transform]: {
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

        return setState(
            R.evolve({
                selectedViewNode: R.always({ ref: 'vNodeBox', id: newNodeId }),
                definitionList:
                    nodeRef.ref === 'vNodeBox'
                        ? R.evolve({
                            [state.currentDefinitionId]: {
                                pipe: R.merge(R.__, boxStylePipes),
                                vNodeBox: R.pipe(
                                    R.over(
                                        R.lensPath([nodeId, 'children']),
                                        R.append({ ref: 'vNodeBox', id: newNodeId })
                                    ),
                                    R.assoc(newNodeId, newNode)
                                ),
                                style: R.assoc(newStyleId, newStyle),
                            },
                        })
                        : R.evolve({
                            [state.currentDefinitionId]: {
                                pipe: R.merge(R.__, boxStylePipes),
                                vNodeBox: R.assoc(newNodeId, newNode),
                                style: R.assoc(newStyleId, newStyle),
                                [nodeRef.ref]: R.over(
                                    R.lensPath([nodeId, 'children']),
                                    R.append({ ref: 'vNodeBox', id: newNodeId })
                                ),
                            },
                        })
            })(state)
        )
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

        return setState(
            R.evolve({
                selectedViewNode: R.always({ ref: 'vNodeText', id: newNodeId }),
                definitionList: {
                    [state.currentDefinitionId]: {
                        pipe: R.pipe(
                            R.assoc(pipeId, newPipe),
                            R.merge(R.__, textStylePipes)
                        ),
                        [nodeRef.ref]: R.over(
                            R.lensPath([nodeId, 'children']),
                            R.append({ ref: 'vNodeText', id: newNodeId })
                        ),
                        vNodeText: R.assoc(newNodeId, newNode),
                        style: R.assoc(newStyleId, newStyle),
                    },
                },
            })(state)
        )
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
            value: 'http://www.ugnis.com/images/logo_new256x256.png',
            transformations: [],
        }

        return setState(
            R.evolve({
                selectedViewNode: R.always({ ref: 'vNodeImage', id: newNodeId }),
                definitionList: {
                    [state.currentDefinitionId]: {
                        pipe: R.pipe(
                            R.assoc(pipeId, newPipe),
                            R.merge(R.__, boxStylePipes)
                        ),
                        [nodeRef.ref]: R.over(
                            R.lensPath([nodeId, 'children']),
                            R.append({ ref: 'vNodeImage', id: newNodeId })
                        ),
                        vNodeImage: R.assoc(newNodeId, newNode),
                        style: R.assoc(newStyleId, newStyle),
                    },
                },
            })(state)
        )
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

        return setState(
            R.evolve({
                selectedViewNode: R.always({ ref: 'vNodeIf', id: newNodeId }),
                definitionList:
                    nodeRef.ref === 'vNodeIf'
                        ? R.evolve({
                            [state.currentDefinitionId]: {
                                pipe: R.assoc(pipeId, newPipe),
                                vNodeIf: R.pipe(
                                    R.over(
                                        R.lensPath([nodeId, 'children']),
                                        R.append({ ref: 'vNodeIf', id: newNodeId })
                                    ),
                                    R.assoc(newNodeId, newNode)
                                ),
                            },
                        })
                        : R.evolve({
                            [state.currentDefinitionId]: {
                                pipe: R.assoc(pipeId, newPipe),
                                vNodeIf: R.assoc(newNodeId, newNode),
                                [nodeRef.ref]: R.over(
                                    R.lensPath([nodeId, 'children']),
                                    R.append({ ref: 'vNodeIf', id: newNodeId })
                                ),
                            },
                        })
            })(state)
        )
    }

    if (type === 'list') {
        const pipeId = uuid()
        // search for a table in state, if none found create a new table
        const existingTableId = Object.keys(currentDefinition.table)[0]
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
                vNodeList: R.pipe(
                    R.over(
                        R.lensPath([nodeId, 'children']),
                        R.append({ ref: 'vNodeList', id: newNodeId })
                    ),
                    R.assoc(newNodeId, newNode)
                )(currentDefinition.vNodeList)
              }
            : {
                  [nodeRef.ref]: R.over(
                      R.lensPath([nodeId, 'children']),
                      R.append({ ref: 'vNodeList', id: newNodeId }),
                      currentDefinition[nodeRef.ref],
                  ),
                  vNodeList: R.assoc(newNodeId, newNode, currentDefinition.vNodeList),
              }

        return setState(
            R.evolve({
                selectedViewNode: R.always({ ref: 'vNodeList', id: newNodeId }),
                componentState: existingTableId ? R.identity : R.assoc(tableId, []),
                definitionList: {
                    [state.currentDefinitionId]: R.pipe(
                        R.evolve({
                            nameSpace: R.over(
                                R.lensPath(['_rootNameSpace', 'children']),
                                existingTableId ? R.identity : R.append({ ref: 'table', id: tableId })
                            ),
                            table: existingTableId ? R.identity : R.assoc(tableId, newTable),
                            pipe: R.assoc(pipeId, newPipe),
                        }),
                        R.merge(R.__, resolvedNodes)
                    ),
                },
            })(state)
        )
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

        return setState(
            R.evolve({
                selectedViewNode: R.always({ ref: 'vNodeInput', id: newNodeId }),
                componentState: R.assoc(stateId, newState.defaultValue),
                definitionList: {
                    [state.currentDefinitionId]: {
                        pipe: R.pipe(
                            R.assoc(pipeInputId, newPipeInput),
                            R.assoc(pipeMutatorId, newPipeMutator),
                            R.merge(R.__, textStylePipes)
                        ),
                        [nodeRef.ref]: R.over(
                            R.lensPath([nodeId, 'children']),
                            R.append({ ref: 'vNodeInput', id: newNodeId })
                        ),
                        vNodeInput: R.assoc(newNodeId, newNode),
                        style: R.assoc(newStyleId, newStyle),
                        nameSpace: R.over(
                            R.lensPath(['_rootNameSpace', 'children']),
                            R.append({ ref: 'state', id: stateId })
                        ),
                        state: R.assoc(stateId, newState),
                        mutator: R.assoc(mutatorId, newMutator),
                        event: R.assoc(eventId, newEvent),
                    },
                },
            })(state)
        )
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

        return setState(
            R.evolve({
                componentState: R.assoc(newStateId, newState.defaultValue),
                definitionList: {
                    [state.currentDefinitionId]: {
                        nameSpace: R.over(
                            R.lensPath([namespaceId, 'children']),
                            R.append({ ref: 'table', id: newStateId })
                        ),
                        table: R.assoc(newStateId, newState),
                    },
                },
            })(state)
        )
    }

    setState(
        R.evolve({
            componentState: R.assoc(newStateId, newState.defaultValue),
            definitionList: {
                [state.currentDefinitionId]: {
                    nameSpace: R.over(
                        R.lensPath([namespaceId, 'children']),
                        R.append({ ref: 'state', id: newStateId })
                    ),
                    state: R.assoc(newStateId, newState),
                },
            },
        })(state)
    )
}

export function SELECT_VIEW_SUBMENU(newId) {
    setState(R.assoc('selectedViewSubMenu', newId, state))
}

export function EDIT_VIEW_NODE_TITLE(nodeId) {
    setState(R.assoc('editingTitleNodeId', nodeId, state))
}

function deleteView(nodeRef, parentRef, state) {
    const currentDefinition = state.definitionList[state.currentDefinitionId]
    // remove all events from state
    const events = getAvailableEvents(nodeRef.ref)
    let newState = currentDefinition.state
    events.forEach(event => {
        const eventRef = currentDefinition[nodeRef.ref][nodeRef.id][event.propertyName]
        if (eventRef) {
            // event -> mutators -> states
            currentDefinition[eventRef.ref][eventRef.id].mutators.forEach(mutatorRef => {
                const stateRef = currentDefinition[mutatorRef.ref][mutatorRef.id].state
                newState = R.over(
                    R.lensPath([stateRef.id, 'mutators']),
                    R.filter(mutator => mutator.id !== mutatorRef.id),
                    newState
                )
            })
        }
    })

    return R.evolve({
        definitionList: {
            [state.currentDefinitionId]: {
                [parentRef.ref]: R.over(
                    R.lensPath([parentRef.id, 'children']),
                    R.filter(ref => ref.id !== nodeRef.id)
                ),
                state: R.always(newState),
            },
        },
        selectedViewNode: R.empty,
    })(state)
}

export function DELETE_SELECTED_VIEW(nodeRef, parentRef) {
    setState(deleteView(nodeRef, parentRef, state))
}

export function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
    e.preventDefault()
    const nodeId = nodeRef.id
    const nodeType = nodeRef.ref

    setState(
        R.assocPath(
            ['definitionList', state.currentDefinitionId, nodeType, nodeId, 'title'],
            e.target.value,
            state
        )
    )
}

export function CHANGE_STATE_NODE_TITLE(stateRef, e) {
    e.preventDefault()

    setState(
        R.assocPath(
            ['definitionList', state.currentDefinitionId, stateRef.ref, stateRef.id, 'title'],
            e.target.value,
            state
        )
    )
}

export function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e) {
    setState(R.assocPath(['componentState', stateId], e.target.value, state))
}

export function CHANGE_CURRENT_STATE_TEXT_VALUE_TABLE(stateId, tableId, rowId, e) {
    setState(
        R.over(
            R.lensPath(['componentState', tableId]),
            R.map(row => (row.id !== rowId ? row : R.assoc(stateId, e.target.value, row))),
            state
        )
    )
}

export function CHANGE_CURRENT_STATE_BOOLEAN_VALUE(stateId, e) {
    setState(R.assocPath(['componentState', stateId], e.target.value === 'true', state))
}

export function CHANGE_CURRENT_STATE_BOOLEAN_VALUE_TABLE(stateId, tableId, rowId, e) {
    setState(
        R.over(
            R.lensPath(['componentState', tableId]),
            R.map(row => (row.id !== rowId ? row : R.assoc(stateId, e.target.value === 'true', row))),
            state
        )
    )
}

export function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId, e) {
    const value = e.target.value
    if (value.toString() !== state.componentState[stateId].toString()) {
        setState(R.assocPath(['componentState', stateId], value, state))
    }
}

export function CHANGE_CURRENT_STATE_NUMBER_VALUE_TABLE(stateId, tableId, rowId, e) {
    setState(
        R.over(
            R.lensPath(['componentState', tableId]),
            R.map(row => (row.id !== rowId ? row : R.assoc(stateId, Number(e.target.value), row))),
            state
        )
    )
}

export function CHANGE_STATIC_VALUE(ref, propertyName, type, e) {
    let value = e.target.value

    if (type === 'number') {
        value = Number(e.target.value)
    }

    if (type === 'boolean') {
        value = value === true || value === 'true'
    }

    setState(
        R.assocPath(
            ['definitionList', state.currentDefinitionId, ref.ref, ref.id, propertyName],
            value,
            state
        )
    )
}

export function SELECT_PIPE(pipeId, e) {
    e.stopPropagation()
    setState(R.assoc('selectedPipeId', pipeId, state))
}

export function ADD_DEFAULT_TRANSFORMATION(pipeId) {
    // TODO this function has reached the maximum hack capacity
    const currentDefinition = state.definitionList[state.currentDefinitionId]
    const pipe = currentDefinition.pipe[pipeId]
    const stateInPipe = currentDefinition[pipe.value.ref][pipe.value.id]

    if (stateInPipe.type === 'table') {
        const rowId = uuid()
        const row = {
            table: pipe.value,
            columns: stateInPipe.columns.map(columneRef => {
                return {
                    ref: 'column',
                    id: uuid(),
                }
            }),
        }

        // fuck it, TODO BURN THIS CODE
        let pipes = {}
        const columns = stateInPipe.columns.reduce((acc, stateRef, index) => {
            const columnState = currentDefinition[stateRef.ref][stateRef.id]

            const pipeId = uuid()
            pipes[pipeId] = {
                type: columnState.type,
                value: columnState.defaultValue,
                transformations: [],
            }

            acc[row.columns[index].id] = {
                state: stateRef,
                value: {
                    ref: 'pipe',
                    id: pipeId,
                },
            }
            return acc
        }, {})

        const pushId = uuid()
        const push = {
            row: {
                ref: 'row',
                id: rowId,
            },
        }

        return setState(
            R.evolve({
                definitionList: {
                    [state.currentDefinitionId]: {
                        row: R.assoc(rowId, row),
                        column: R.merge(columns),
                        push: R.assoc(pushId, push),
                        pipe: R.pipe(
                            R.merge(pipes),
                            R.over(
                                R.lensPath([pipeId, 'transformations']),
                                R.append({ ref: 'push', id: pushId })
                            )
                        ),
                    },
                },
            })(state)
        )
    }

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
    const transformation = defaultTransformations[stateInPipe.type]
    const value = defaultValues[stateInPipe.type]
    const newPipeId = uuid()
    const newId = uuid()

    const oldTransformations = currentDefinition.pipe[pipeId].transformations
    const newPipeTransformations =
        pipe.type === 'text' || pipe.type === stateInPipe.type
            ? oldTransformations.concat({ ref: transformation, id: newId })
            : oldTransformations
                  .slice(0, oldTransformations.length - 1)
                  .concat({ ref: transformation, id: newId })
                  .concat(oldTransformations.slice(oldTransformations.length - 1))

    setState(
        R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    [transformation]: R.assocPath([newId, 'value'], { ref: 'pipe', id: newPipeId }),
                    pipe: R.pipe(
                        R.assoc(newPipeId, { value, type: pipe.type, transformations: [] }),
                        R.assocPath([pipeId, 'transformations'], newPipeTransformations)
                    ),
                },
            },
        })(state)
    )
}

export function DELETE_TRANSFORMATION(pipeRef, transformationRef) {
    setState(
        R.over(
            R.lensPath(['definitionList', state.currentDefinitionId, pipeRef.ref, pipeRef.id, 'transformations']),
            R.filter(element => element.id !== transformationRef.id),
            state
        )
    )
}

export function FULL_SCREEN_CLICKED(value) {
    if (value !== state.fullScreen) {
        setState(R.assoc('fullScreen', value, state))
    }
}

export function SAVE_DEFAULT(stateRef) {
    setState(
        R.assocPath(
            ['definitionList', state.currentDefinitionId, stateRef.ref, stateRef.id, 'defaultValue'],
            state.componentState[stateRef.id],
            state
        )
    )
}

export function DELETE_STATE(stateRef, tableState) {
    const stateId = stateRef.id
    let updatedState = state
    const currentDefinition = state.definitionList[state.currentDefinitionId]
    if (stateRef.ref === 'table') {
        // delete lists that use the state
        Object.keys(currentDefinition.vNodeList).forEach(nodeId => {
            const node = currentDefinition.vNodeList[nodeId]
            const pipeId = node.value.id
            if (currentDefinition.pipe[pipeId].value.id === stateId) {
                updatedState = deleteView({ ref: 'vNodeList', id: nodeId }, node.parent, updatedState)
            }
        })
    } else {
        // fix all the broken pipes
        Object.keys(currentDefinition.pipe).forEach(pipeId => {
            if (currentDefinition.pipe[pipeId].value.id === stateId) {
                updatedState = resetPipeFunc(pipeId, updatedState)
            }
        })
    }

    if (tableState) {
        updatedState = R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    row: R.map(row => {
                        if (row.table.id === tableState.id) {
                            const table = findNode(row.table)
                            const index = table.columns.findIndex(columnRef => columnRef.id === stateId)
                            return R.over(R.lensProp('columns'), R.remove(index, 1), row)
                        } else {
                            return row
                        }
                    }),
                    table: {
                        [tableState.id]: {
                            defaultValue: R.map(R.omit(stateRef.id)),
                        },
                    },
                },
            },
        })(updatedState)
    }

    // remove from table nameSpace
    Object.keys(currentDefinition.table).forEach(tableId => {
        const table = currentDefinition.table[tableId]
        const newColumns = table.columns.filter(columnRef => columnRef.id !== stateId)
        if (newColumns.length !== table.columns.length) {
            updatedState = R.assocPath(
                ['definitionList', updatedState.currentDefinitionId, 'table', tableId, 'columns'],
                newColumns,
                updatedState
            )
        }
    })

    const updatedDefinition = updatedState.definitionList[updatedState.currentDefinitionId]
    const { [stateId]: deletedState, ...newState } = updatedDefinition[stateRef.ref]
    let events = updatedDefinition.event
    deletedState.mutators.forEach(mutatorRef => {
        const mutator = updatedDefinition[mutatorRef.ref][mutatorRef.id]
        const event = mutator.event
        events = R.over(
            R.lensPath([event.id, 'mutators']),
            R.filter(mutRef => mutRef.id !== mutatorRef.id),
            events
        )
    })

    setState(
        R.evolve({
            selectedStateNode: R.empty,
            definitionList: {
                [state.currentDefinitionId]: {
                    [stateRef.ref]: R.always(newState),
                    nameSpace: {
                        _rootNameSpace: {
                            children: R.filter(ref => ref.id !== stateId),
                        },
                    },
                    event: R.always(events),
                },
            },
        })(updatedState)
    )
}

export function EVENT_HOVERED(eventRef) {
    setState(R.assoc('hoveredEvent', eventRef, state))
}

export function EVENT_UNHOVERED() {
    if (state.hoveredEvent) {
        setState(R.assoc('hoveredEvent', null, state))
    }
}

export function resetPipeFunc(pipeId, state) {
    const defaultValues = {
        text: 'Default text',
        number: 0,
        boolean: true,
    }
    let parentJoinId
    const currentDefinition = state.definitionList[state.currentDefinitionId]

    Object.keys(currentDefinition.join).forEach(joinId => {
        if (currentDefinition.join[joinId].value.id === pipeId) {
            parentJoinId = joinId
        }
    })

    if (parentJoinId) {
        const pipes = Object.keys(currentDefinition.pipe)
        for (let i = 0; i < pipes.length; i++) {
            const parentPipeId = pipes[i]
            for (
                let index = 0;
                index < currentDefinition.pipe[parentPipeId].transformations.length;
                index++
            ) {
                const ref = currentDefinition.pipe[parentPipeId].transformations[index]
                if (ref.id === parentJoinId) {
                    const joinRef = currentDefinition.pipe[parentPipeId].transformations[index + 1]
                    const secondPipeRef = currentDefinition.join[joinRef.id].value
                    const text = currentDefinition.pipe[secondPipeRef.id].value
                    return R.evolve({
                        selectedPipeId: R.empty,
                        definitionList: {
                            [state.currentDefinitionId]: {
                                pipe: {
                                    [parentPipeId]: {
                                        value: R.concat(R.__, text),
                                        transformations: R.pipe(
                                            R.slice(0, index),
                                            R.concat(R.__, currentDefinition.pipe[secondPipeRef.id].transformations),
                                            R.concat(R.__, currentDefinition.pipe[parentPipeId].transformations.slice(index + 2))
                                        ),
                                    },
                                },
                            },
                        },
                    })(state)
                }
            }
        }
    } else {
        return R.evolve({
            selectedPipeId: R.empty,
            definitionList: {
                [state.currentDefinitionId]: {
                    pipe: {
                        [pipeId]: {
                            value: R.always(defaultValues[currentDefinition.pipe[pipeId].type]),
                            transformations: R.empty,
                        },
                    },
                },
            },
        })(state)
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
                                R.assoc('ref', newRefName),
                            ),
                        },
                    },
                    [oldTransformationRef.ref]: R.omit(oldTransformationRef.id),
                    [newRefName]: R.assoc(oldTransformationRef.id, oldTransform),
                },
            },
        })(state)
    )
}

export function CHANGE_MENU(type) {
    setState(R.assoc('selectedMenu', type, state))
}

export function COMPONENT_HOVERED(id) {
    setState(R.assoc('hoveredComponent', id, state))
}

export function COMPONENT_UNHOVERED() {
    setState(R.assoc('hoveredComponent', '', state))
}

export function ADD_NEW_COMPONENT() {
    const newApp = generateEmptyApp()
    setState(
        R.evolve({
            definitionList: R.assoc(newApp.id, newApp),
            eventStack: R.always({ [newApp.id]: [] }),
            currentDefinitionId: R.always(newApp.id),
            selectedViewNode: R.empty,
            selectedPipeId: R.empty,
            selectedStateNode: R.empty,
        })(state)
    )
}

export function SELECT_COMPONENT(id) {
    setState(
        R.evolve({
            componentState: R.always(createDefaultState(state.definitionList[id])),
            eventStack: R.always({ [id]: [] }),
            currentDefinitionId: R.always(id),
            selectedViewNode: R.empty,
            selectedPipeId: R.empty,
            selectedStateNode: R.empty,
        })(state)
    )
}

export function CHANGE_COMPONENT_PATH(name, e) {
    setState(R.assocPath(['definitionList', state.currentDefinitionId, name], e.target.value, state))
}

export function UPDATE_TABLE_DEFAULT_RECORD(tableId, e) {
    const currentDefinition = state.definitionList[state.currentDefinitionId]
    const table = currentDefinition.table[tableId]
    let defaultRow = {}
    table.columns.forEach(stateRef => {
        defaultRow[stateRef.id] = currentDefinition[stateRef.ref][stateRef.id].defaultValue
    })
    defaultRow.id = uuid()
    setState(R.over(R.lensPath(['componentState', tableId]), R.append(defaultRow), state))
}

export function UPDATE_TABLE_ADD_COLUMN(tableId, type) {
    // update table def
    // add new state
    // update all rows that are used in table transforms
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

    const updatedTable = state.componentState[tableId].map(row => R.assoc(newStateId, newState.defaultValue, row))
    let addedPipes = {}
    let addedColumns = {}
    const updatedRows = R.mapObjIndexed((row, rowId) => {
        if (row.table.id === tableId) {
            const pipeId = uuid()
            const columnId = uuid()

            addedColumns = R.assoc(columnId, {
                state: { ref: 'state', id: newStateId },
                value: { ref: 'pipe', id: pipeId },
            })(addedColumns)
            addedPipes = R.assoc(pipeId, {
                type: newState.type,
                value: newState.defaultValue,
                transformations: [],
            })(addedPipes)
            return R.over(R.lensProp('columns'), R.append({ ref: 'column', id: columnId }), row)
        }
        return row
    })(state.definitionList[state.currentDefinitionId].row)

    setState(
        R.evolve({
            componentState: R.assoc(tableId, updatedTable),
            definitionList: {
                [state.currentDefinitionId]: {
                    table: {
                        [tableId]: {
                            defaultValue: R.map(R.assoc(newStateId, newState.defaultValue)),
                            columns: R.append({
                                ref: 'state',
                                id: newStateId,
                            }),
                        },
                    },
                    row: R.merge(R.__, updatedRows),
                    column: R.merge(addedColumns),
                    pipe: R.merge(addedPipes),
                    state: R.assoc(newStateId, newState),
                },
            },
        })(state)
    )
}

export function DELETE_TABLE_ROW(tableId, rowId) {
    const updatedTable = state.componentState[tableId].filter(row => row.id !== rowId)
    setState(R.assocPath(['componentState', tableId], updatedTable, state))
}

function returnRemovalFunction(mutatorRef, mutatorState, expectedStateRef) {
    return mutatorState.ref === expectedStateRef
        ? R.over(R.lensPath([mutatorState.id, 'mutators']), R.filter(ref => ref.id !== mutatorRef.id))
        : R.identity
}

export function REMOVE_MUTATOR(mutatorRef) {
    const currentDefinition = state.definitionList[state.currentDefinitionId]
    const mutator = currentDefinition[mutatorRef.ref][mutatorRef.id]
    const { [mutatorRef.id]: deletedMutator, ...mutatorsLeft } = currentDefinition[mutatorRef.ref]

    setState(
        R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    table: returnRemovalFunction(mutatorRef, mutator.state, 'table'),
                    state: returnRemovalFunction(mutatorRef, mutator.state, 'state'),
                    mutator: R.always(mutatorsLeft),
                    event: R.over(
                        R.lensPath([mutator.event.id, 'mutators']),
                        R.filter(ref => ref.id !== mutatorRef.id)
                    ),
                },
            },
        })(state)
    )
}
