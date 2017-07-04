import snabbdom from 'snabbdom'
const patch = snabbdom.init([require('snabbdom/modules/class'), require('snabbdom/modules/props'), require('snabbdom/modules/style'), require('snabbdom/modules/eventlisteners'), require('snabbdom/modules/attributes')])
import h from 'snabbdom/h'

function flatten(arr) {
    return arr.reduce(function(flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
    }, [])
}

export default definition => {
    let currentState = createDefaultState()

    // Allows stoping application in development. This is not an application state
    let frozen = false
    let frozenCallback = null
    let selectHoverActive = false
    let selectedNodeInDevelopment = {}

    function selectNodeHover(ref, e) {
        e.stopPropagation()
        selectedNodeInDevelopment = ref
        frozenCallback(ref)
        render()
    }
    function selectNodeClick(ref, e) {
        e.stopPropagation()
        selectHoverActive = false
        selectedNodeInDevelopment = ref
        frozenCallback(ref)
        render()
    }

    // global state for resolver
    let currentEvent = null
    let currentMapValue = {}
    let currentMapIndex = {}
    let eventData = {}
    function resolve(ref) {
        if (ref === undefined) {
            return
        }
        // static value (string/number)
        if (ref.ref === undefined) {
            return ref
        }
        const def = definition[ref.ref][ref.id]
        if (ref.ref === 'pipe') {
            return pipe(ref)
        }
        if (ref.ref === 'conditional') {
            return resolve(def.predicate) ? resolve(def.then) : resolve(def.else)
        }
        if (ref.ref === 'state') {
            return currentState[ref.id]
        }
        if (ref.ref === 'vNodeBox') {
            return boxNode(ref)
        }
        if (ref.ref === 'vNodeText') {
            return textNode(ref)
        }
        if (ref.ref === 'vNodeInput') {
            return inputNode(ref)
        }
        if (ref.ref === 'vNodeList') {
            return listNode(ref)
        }
        if (ref.ref === 'vNodeIf') {
            return ifNode(ref)
        }
        if (ref.ref === 'vNodeImage') {
            return imageNode(ref)
        }
        if (ref.ref === 'style') {
            return Object.keys(def).reduce((acc, val) => {
                acc[val] = resolve(def[val])
                return acc
            }, {})
        }
        if (ref.ref === 'eventData') {
            return eventData[ref.id]
        }
        if (ref.ref === 'listValue') {
            return currentMapValue[def.list.id][def.property]
        }
        throw Error(ref)
    }

    function transformValue(value, transformations) {
        for (let i = 0; i < transformations.length; i++) {
            const ref = transformations[i]
            const transformer = definition[ref.ref][ref.id]
            if (ref.ref === 'equal') {
                value = value === resolve(transformer.value)
            }
            if (ref.ref === 'add') {
                value = value + resolve(transformer.value)
            }
            if (ref.ref === 'subtract') {
                value = value - resolve(transformer.value)
            }
            if (ref.ref === 'multiply') {
                value = value * resolve(transformer.value)
            }
            if (ref.ref === 'divide') {
                value = value / resolve(transformer.value)
            }
            if (ref.ref === 'remainder') {
                value = value % resolve(transformer.value)
            }
            if (ref.ref === 'join') {
                value = value.toString().concat(resolve(transformer.value))
            }
            if (ref.ref === 'toUpperCase') {
                value = value.toUpperCase()
            }
            if (ref.ref === 'toLowerCase') {
                value = value.toLowerCase()
            }
            if (ref.ref === 'length') {
                value = value.length
            }
            if (ref.ref === 'and') {
                value = value && resolve(transformer.value)
            }
            if (ref.ref === 'or') {
                value = value || resolve(transformer.value)
            }
            if (ref.ref === 'not') {
                value = !value
            }
        }
        return value
    }

    function pipe(ref) {
        const def = definition[ref.ref][ref.id]
        return transformValue(resolve(def.value), def.transformations)
    }

    const frozenShadow = 'inset 0 0 0 3px #53d486'

    function boxNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        const data = {
            key: ref.id,
            style: frozen && selectedNodeInDevelopment.id === ref.id
                ? {
                      ...style,
                      transition: 'box-shadow 0.2s',
                      boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow,
                  }
                : style,
            on: frozen
                ? {
                      mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                      click: [selectNodeClick, ref],
                  }
                : {
                      click: node.click ? [emitEvent, node.click] : undefined,
                      dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                      mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                      mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined,
                  },
        }
        return h('div', data, flatten(node.children.map(resolve)))
    }

    function ifNode(ref) {
        const node = definition[ref.ref][ref.id]
        return resolve(node.value) ? node.children.map(resolve) : []
    }

    function textNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        const data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id
                ? {
                      ...style,
                      transition: 'box-shadow 0.2s',
                      boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow,
                  }
                : style,
            on: frozen
                ? {
                      mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                      click: [selectNodeClick, ref],
                  }
                : {
                      click: node.click ? [emitEvent, node.click] : undefined,
                      dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                      mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                      mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined,
                  },
        }
        return h('span', data, resolve(node.value))
    }

    function imageNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        const data = {
            attrs: {
                src: resolve(node.src),
            },
            style: frozen && selectedNodeInDevelopment.id === ref.id
                ? {
                      ...style,
                      transition: 'box-shadow 0.2s',
                      boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow,
                  }
                : style,
            on: frozen
                ? {
                      mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                      click: [selectNodeClick, ref],
                  }
                : {
                      click: node.click ? [emitEvent, node.click] : undefined,
                      dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                      mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                      mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined,
                  },
        }
        return h('img', data)
    }

    function inputNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        const data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id
                ? {
                      ...style,
                      transition: 'box-shadow 0.2s',
                      boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow,
                  }
                : style,
            on: frozen
                ? {
                      mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                      click: [selectNodeClick, ref],
                  }
                : {
                      click: node.click ? [emitEvent, node.click] : undefined,
                      input: node.input ? [emitEvent, node.input] : undefined,
                      dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                      mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                      mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined,
                      focus: node.focus ? [emitEvent, node.focus] : undefined,
                      blur: node.blur ? [emitEvent, node.blur] : undefined,
                  },
            props: {
                value: resolve(node.value),
                placeholder: node.placeholder,
            },
        }
        return h('input', data)
    }

    function listNode(ref) {
        const node = definition[ref.ref][ref.id]
        const list = resolve(node.value)

        const children = Object.keys(list).map(key => list[key]).map((value, index) => {
            currentMapValue[ref.id] = value
            currentMapIndex[ref.id] = index

            return node.children.map(resolve)
        })
        delete currentMapValue[ref.id]
        delete currentMapIndex[ref.id]

        return children
    }

    const listeners = []

    function addListener(callback) {
        const length = listeners.push(callback)

        // for unsubscribing
        return () => listeners.splice(length - 1, 1)
    }

    function emitEvent(eventRef, e) {
        const eventId = eventRef.id
        const event = definition.event[eventId]
        currentEvent = e
        event.data.forEach(ref => {
            if (ref.id === '_input') {
                eventData[ref.id] = e.target.value
            }
        })
        const previousState = currentState
        let mutations = {}
        definition.event[eventId].mutators.forEach(ref => {
            const mutator = definition.mutator[ref.id]
            const state = mutator.state
            mutations[state.id] = resolve(mutator.mutation)
        })
        currentState = Object.assign({}, currentState, mutations)
        listeners.forEach(callback => callback(eventId, eventData, e, previousState, currentState, mutations))
        currentEvent = {}
        eventData = {}
        if (Object.keys(mutations).length) {
            render()
        }
    }

    let vdom = resolve({ ref: 'vNodeBox', id: '_rootNode' })
    function render(newDefinition) {
        if (newDefinition) {
            if (definition.state !== newDefinition.state) {
                definition = newDefinition
                const newState = Object.keys(definition.state).map(key => definition.state[key]).reduce((acc, def) => {
                    acc[def.ref] = def.defaultValue
                    return acc
                }, {})
                currentState = { ...newState, ...currentState }
            } else {
                definition = newDefinition
            }
        }
        const newvdom = resolve({ ref: 'vNodeBox', id: '_rootNode' })
        patch(vdom, newvdom)
        vdom = newvdom
    }

    function _freeze(isFrozen, callback, nodeId) {
        frozenCallback = callback
        selectedNodeInDevelopment = nodeId
        if (frozen === false && isFrozen === true) {
            selectHoverActive = true
        }
        if (frozen || frozen !== isFrozen) {
            frozen = isFrozen
            render()
        }
    }

    function getCurrentState() {
        return currentState
    }

    function setCurrentState(newState) {
        currentState = newState
        render()
    }

    function createDefaultState() {
        return Object.keys(definition.state).map(key => definition.state[key]).reduce((acc, def) => {
            acc[def.ref] = def.defaultValue
            return acc
        }, {})
    }

    return {
        definition,
        vdom,
        getCurrentState,
        setCurrentState,
        render,
        emitEvent,
        addListener,
        _freeze,
        _resolve: resolve,
        createDefaultState,
    }
}
