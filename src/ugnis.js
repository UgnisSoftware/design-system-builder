/*
 Ugnis Interpreter
 Copyright (C) 2017  Karolis Masiulis

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


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
    let currentEventNode = null
    // used for lists so snabbdom wouldn't conflict
    let currentKey = ''
    let eventData = {}
    function resolve(ref) {
        if (ref === undefined) {
            return
        }
        // static value (string/number)
        if (ref.ref === undefined) {
            return ref
        }
        if (ref.ref === 'eventData') {
            if(ref.id === 'value') return currentEvent.target.value
            if(ref.id === 'keyPressed') return currentEvent.key
            if(ref.id === 'keyPressedCode') return currentEvent.keyCode
            const initialX = currentEvent.touches ? currentEvent.touches[0].clientX : currentEvent.clientX
            const initialY = currentEvent.touches ? currentEvent.touches[0].clientY : currentEvent.clientY
            // fix offsets in dev
            const root = getVDom().elm.getBoundingClientRect()
            const screenX = initialX - root.left
            const screenY = initialY - root.top
            if(ref.id === 'screenX') return screenX
            if(ref.id === 'screenY') return screenY
            const position = currentEventNode.getBoundingClientRect()
            const offsetX = initialX - position.left
            const offsetY = initialY - position.top
            if(ref.id === 'layerX') return offsetX
            if(ref.id === 'layerY') return offsetY
        }
        const def = definition[ref.ref][ref.id]
        if (ref.ref === 'pipe') {
            return pipe(ref)
        }
        if (ref.ref === 'conditional') {
            return resolve(def.predicate) ? resolve(def.then) : resolve(def.else)
        }
        if (ref.ref === 'state') {
            if(ref.parent) return currentState[ref.parent.id + '.' + ref.id]
            return currentState[ref.id]
        }
        if (ref.ref === 'table') {
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
            if(ref.id === 'value') return currentEvent.target.value
            if(ref.id === 'keyPressed') return currentEvent.key
            if(ref.id === 'keyPressedCode') return currentEvent.keyCode
            const initialX = currentEvent.touches ? currentEvent.touches[0].clientX : currentEvent.clientX
            const initialY = currentEvent.touches ? currentEvent.touches[0].clientY : currentEvent.clientY
            // fix offsets in dev
            const root = getVDom().elm.getBoundingClientRect()
            const screenX = initialX - root.left
            const screenY = initialY - root.top
            if(ref.id === 'screenX') return screenX
            if(ref.id === 'screenY') return screenY
            const position = currentEventNode.getBoundingClientRect()
            const offsetX = initialX - position.left
            const offsetY = initialY - position.top
            if(ref.id === 'layerX') return offsetX
            if(ref.id === 'layerY') return offsetY
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

    function preventFrozenInputs(e) {
        e.preventDefault()
        return false
    }

    function generateEvents(ref){
        const node = definition[ref.ref][ref.id]
        if (frozen){
            return {
                keydown: preventFrozenInputs,
                mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                click: [selectNodeClick, ref],
            }
        }
        return node.events.reduce((acc, eventRef)=> {
            const event = definition[eventRef.ref][eventRef.id]
            acc[event.type] = [emitEvent, eventRef]
            return acc
        }, {})
    }

    const frozenShadow = 'inset 0 0 0 3px #53d486'

    function generateStyles(ref){
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        return (frozen && selectedNodeInDevelopment.id === ref.id) ? {
            ...style,
            transition: 'box-shadow 0.2s',
            boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow,
        } : style
    }

    function generateAttrs(ref){
        const node = definition[ref.ref][ref.id]
        return {
            src: resolve(node.src),
            'class': resolve(node['class']),
            id: resolve(node.id),
        }
    }

    function boxNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            key: ref.id+definition.id+currentKey,
            attrs: generateAttrs(ref),
            style: generateStyles(ref),
            on: generateEvents(ref),
        }
        return h('div', data, flatten(node.children.map(resolve)))
    }

    function textNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            attrs: generateAttrs(ref),
            style: generateStyles(ref),
            on: generateEvents(ref),
        }
        return h('span', data, resolve(node.value))
    }

    function imageNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        const data = {
            attrs: generateAttrs(ref),
            style: generateStyles(ref),
            on: generateEvents(ref),
        }
        return h('img', data)
    }

    function inputNode(ref) {
        const node = definition[ref.ref][ref.id]
        const style = resolve(node.style)
        const data = {
            attrs: generateAttrs(ref),
            style: generateStyles(ref),
            on: generateEvents(ref),
            props: {
                value: resolve(node.value),
                placeholder: node.placeholder,
            },
        }
        return h('input', data)
    }

    function ifNode(ref) {
        const node = definition[ref.ref][ref.id]
        return resolve(node.value) ? node.children.map(resolve) : []
    }

    function listNode(ref) {
        const node = definition[ref.ref][ref.id]
        const list = resolve(node.value)

        const cache = currentState
        const children = list
            .map((value, index) => {
                const nameSpacedValues = Object.keys(value).reduce((acc, key) => {acc[ref.id + '.' + key] = value[key]; return acc}, {})
                currentState = {...currentState, ...nameSpacedValues}
                currentKey = value.id
                return node.children.map(resolve)
            })
        currentState = cache
        currentKey = ''
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
        currentEventNode = this.elm
        currentEvent = e
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
            if (definition.nameSpace !== newDefinition.nameSpace) {
                definition = newDefinition
                const newState = createDefaultState()
                currentState = { ...newState, ...currentState }
            } else {
                definition = newDefinition
            }
        }
        const newvdom = resolve({ ref: 'vNodeBox', id: '_rootNode' })
        if(vdom.elm){
            patch(vdom, newvdom)
        }
        vdom = newvdom
    }

    function _freeze(isFrozen, callback, nodeId) {
        frozenCallback = callback
        selectedNodeInDevelopment = nodeId
        if (frozen === false && isFrozen === true) {
            //selectHoverActive = true
        }
        if (frozen || frozen !== isFrozen) {
            frozen = isFrozen
            render()
        }
    }

    function getCurrentDefinition() {
        return definition
    }

    function getVDom() {
        return vdom
    }

    function getCurrentState() {
        return currentState
    }

    function setCurrentState(newState) {
        currentState = newState
        render()
    }

    function createDefaultState() {
        return definition.nameSpace['_rootNameSpace'].children.reduce((acc, ref) => {
            const def = definition[ref.ref][ref.id]
            acc[ref.id] = def.defaultValue
            return acc
        }, {})
    }

    return {
        getCurrentDefinition,
        getVDom,
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
