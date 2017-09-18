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

import React, { PureComponent } from 'react'
import R from 'ramda'

const defaultStylesToRemove = {
    //alignItems: 'flex-start',
    //justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    background: 'none',
    overflow: 'visible',
    color: '#000000',
    fontFamily: 'inherit',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textDecorationLine: 'none',
}

const eventNames = {
    click: 'onClick',
    dblclick: 'onDoubleClick',
    mousedown: 'onMouseDown',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave',
    mousemove: 'onMouseMove',
    mouseout: 'onMouseOut',
    mouseover: 'onMouseOver',
    mouseup: 'onMouseUp',
    keydown: 'onKeyDown',
    keypress: 'onKeyPress',
    keyup: 'onKeyUp',
    focus: 'onFocus',
    blur: 'onBlur',
    change: 'onChange',
    input: 'onInput',
    submit: 'onSubmit',
}

// can't avoid global state for global listeners...
let eventCache = {
    keydown: null,
    keyup: null,
}

function addGlobalEvent(type, eventRef, callback) {
    if (eventCache[type] === null) {
        document.addEventListener(type, callback)
        eventCache[type] = { ...eventRef, callback }
    } else {
        document.removeEventListener(type, eventCache[type].callback)
        document.addEventListener(type, callback)
        eventCache[type] = { ...eventRef, callback }
    }
}

function resetGlobalEvent(type) {
    if (eventCache[type] === null) {
        return
    }
    if (eventCache[type].callback) {
        document.removeEventListener(type, eventCache[type].callback)
    }
    eventCache[type] = null
}

function oldRender(props) {
    const { definition, onEvent, frozen, frozenClick, selectedNode } = props
    let { state } = props

    function findNode(ref) {
        return definition[ref.ref][ref.id]
    }

    // global state for resolver
    let currentEvent = null
    let currentEventNode = null

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
            if (ref.id === 'value') return currentEvent.target.value
            if (ref.id === 'keyPressed') return currentEvent.key
            if (ref.id === 'keyPressedCode') return currentEvent.keyCode
            const initialX = currentEvent.touches ? currentEvent.touches[0].clientX : currentEvent.clientX
            const initialY = currentEvent.touches ? currentEvent.touches[0].clientY : currentEvent.clientY
            // fix offsets in dev
            //const root = getVDom().elm.getBoundingClientRect()
            const screenX = initialX - 65
            const screenY = initialY - 215
            if (ref.id === 'screenX') return screenX
            if (ref.id === 'screenY') return screenY
            const position = currentEventNode.getBoundingClientRect()
            const offsetX = initialX - position.left
            const offsetY = initialY - position.top
            if (ref.id === 'layerX') return offsetX
            if (ref.id === 'layerY') return offsetY
        }
        const def = findNode(ref)
        if (ref.ref === 'split') {
            // return last branch or defaultValue
            const correctBranch = R.findLast(branchRef => resolve(findNode(branchRef).test))(def.branches)

            return correctBranch ? resolve(findNode(correctBranch).value) : resolve(def.defaultValue)
        }
        if (ref.ref === 'pipe') {
            return pipe(ref)
        }
        if (ref.ref === 'conditional') {
            return resolve(def.predicate) ? resolve(def.then) : resolve(def.else)
        }
        if (ref.ref === 'state') {
            if (ref.parent) return state[ref.parent.id + '.' + ref.id]
            return state[ref.id]
        }
        if (ref.ref === 'table') {
            return state[ref.id]
        }
        if (ref.id === '_rootNode') {
            return rootNode(ref)
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

    function generateGlobalEvents(ref) {
        const node = definition[ref.ref][ref.id]
        let eventsToReset = ['keydown', 'keyup']
        node.events.forEach(eventRef => {
            const event = definition[eventRef.ref][eventRef.id]
            eventsToReset = eventsToReset.filter(e => e !== event.type)
            addGlobalEvent(event.type, eventRef, e => {
                emitEvent(eventRef, e)
            })
        })
        // reset what's left
        eventsToReset.forEach(resetGlobalEvent)
    }

    function generateEvents(ref) {
        const node = definition[ref.ref][ref.id]
        if (frozen) {
            return {
                onKeyDown: preventFrozenInputs,
                onClick: e => {
                    e.stopPropagation()
                    frozenClick(ref, e)
                },
            }
        }
        return node.events.reduce((acc, eventRef) => {
            const event = definition[eventRef.ref][eventRef.id]
            acc[eventNames[event.type]] = e => emitEvent(eventRef, e)
            return acc
        }, {})
    }

    const frozenShadow = 'inset 0 0 0 3px #53d486'

    function generateStyles(ref) {
        const node = definition[ref.ref][ref.id]
        let style = resolve(node.style)
        Object.keys(defaultStylesToRemove).forEach(key => {
            if (defaultStylesToRemove[key] === style[key]) {
                style[key] = ''
            }
        })
        if (frozen && style.pointerEvents) {
            style.pointerEvents = ''
        }
        return frozen && selectedNode.id === ref.id
            ? {
                  transition: 'box-shadow 0.2s',
                  ...style,
                  boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow,
              }
            : style
    }

    function generateAttrs(ref) {
        const node = definition[ref.ref][ref.id]
        return {
            src: resolve(node.src),
            className: resolve(node['class']),
            id: resolve(node.id),
            value: resolve(node.value),
            placeholder: node.placeholder,
        }
    }

    function rootNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            key: ref.id + definition.id,
            ...generateAttrs(ref),
            style: generateStyles(ref),
        }

        generateGlobalEvents(ref)

        return <div {...data}>{node.children.map(resolve)}</div>
    }

    function boxNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            key: ref.id + definition.id + currentKey,
            ...generateAttrs(ref),
            style: generateStyles(ref),
            ...generateEvents(ref),
        }
        return <div {...data}>{node.children.map(resolve)}</div>
    }

    function textNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            ...generateAttrs(ref),
            style: generateStyles(ref),
            ...generateEvents(ref),
        }
        const val = resolve(node.value)
        return <span {...data}>{val}</span>
    }

    function imageNode(ref) {
        const data = {
            ...generateAttrs(ref),
            style: generateStyles(ref),
            ...generateEvents(ref),
        }
        return <img {...data} />
    }

    function inputNode(ref) {
        const data = {
            ...generateAttrs(ref),
            style: generateStyles(ref),
            ...generateEvents(ref),
        }
        return <input {...data} />
    }

    function ifNode(ref) {
        const node = definition[ref.ref][ref.id]
        return resolve(node.value) ? node.children.map(resolve) : []
    }

    function listNode(ref) {
        const node = definition[ref.ref][ref.id]
        const list = resolve(node.value)

        const cache = state
        const children = list.map((value, index) => {
            const nameSpacedValues = Object.keys(value).reduce((acc, key) => {
                acc[ref.id + '.' + key] = value[key]
                return acc
            }, {})
            state = { ...state, ...nameSpacedValues }
            currentKey = value.id
            return node.children.map(resolve)
        })
        state = cache
        currentKey = ''
        return children
    }

    function emitEvent(eventRef, e) {
        if (frozen) {
            return
        }
        const eventId = eventRef.id
        const event = definition.event[eventId]
        currentEventNode = e.target
        currentEvent = e
        if (e.persist) {
            e.persist()
        }
        const previousState = state
        let mutations = {}
        definition.event[eventId].mutators.forEach(ref => {
            const mutator = definition.mutator[ref.id]
            mutations[mutator.state.id] = resolve(mutator.mutation)
        })
        const currentState = Object.assign({}, state, mutations)
        onEvent(eventId, eventData, e, previousState, currentState, mutations)
        currentEvent = {}
        eventData = {}
    }

    return resolve({ ref: 'vNodeBox', id: '_rootNode' })
}

export default class Ugnis extends PureComponent {
    render() {
        return oldRender(this.props)
    }
}
