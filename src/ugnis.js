//TODO remove snabbdom
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
])

const uuid = require('node-uuid')

export const component = (definition) => {
    function toState(id, acc = {}){
        const current = definition.state[id]
        if(current.stateType === 'nameSpace'){
            current.childrenIds.forEach((id)=> toState(id, acc))
        } else {
            acc[id] = current.defaultValue
            return acc
        }
        return acc
    }
    let currentState = toState('_rootState')

    // Allows stoping application in development. This is not an application state
    let frozen = false
    let frozenCallback = null
    let selectHoverActive = false
    let selectedNodeInDevelopment = ''

    function selectNodeHover(nodeId, e) {
        e.stopPropagation()
        selectedNodeInDevelopment = nodeId
        frozenCallback(nodeId)
        render()
    }
    function selectNodeClick(nodeId, e) {
        e.stopPropagation()
        selectHoverActive = false
        selectedNodeInDevelopment = nodeId
        frozenCallback(nodeId)
        render()
    }

    // global state for resolver
    let currentEvent = null
    let eventData = null
    let currentMapValue = {}
    let currentMapIndex = {}
    let currentRepeaters = {}
    const resolve = (def)=> {
        if (def === undefined) {
            return
        }
        // static value
        if (def._type === undefined) {
            return def
        }
        if (def._type === 'conditional') {
            return resolve(def.condition) ? resolve(def.then) : resolve(def.else)
        }
        if (def._type === 'equals') {
            return resolve(def.first) === resolve(def.second)
        }
        if (def._type === 'sum') {
            return resolve(def.first) + resolve(def.second)
        }
        if (def._type === 'ifExists') {
            return resolve(def.data)[resolve(def.key)] || resolve(def.else)
        }
        if (def._type === 'uuid') {
            return uuid.v4()
        }
        if (def._type === 'randomColor') {
            return "#"+((1<<24)*Math.random()|0).toString(16)
        }
        if (def._type === 'length') {
            return resolve(def.value).length
        }
        if (def._type === 'filter') {
            const data = resolve(def.data).filter((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return resolve(def.filter)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'list') {
            const data = resolve(def.data).map((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return resolve(def.list)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'listObj') {
            const mapData = resolve(def.data)
            const data = Object.keys(mapData).map((index)=> {
                currentMapValue[def.identifier] = mapData[index]
                currentMapIndex[def.identifier] = index
                return resolve(def.list)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'repeater') {
            currentRepeaters[def.identifier] = def.value
            currentMapValue[def.identifier] = resolve(def.data)
            const data = resolve(def.value)
            delete currentRepeaters[def.identifier]
            delete currentMapValue[def.identifier]
            return data
        }
        if (def._type === 'repeat') {
            // I should really stop using global state,
            // it would be embarrassing if anyone ever asked why didn't I just pass data through every resolve
            // good thing no one is ever going to read this code
            const previous = currentMapValue[def.identifier]
            currentMapValue[def.identifier] = resolve(def.data)
            const data = resolve(currentRepeaters[def.identifier])
            currentMapValue[def.identifier] = previous
            return data
        }
        if (def._type === 'eventName') {
            return {eventName: def.eventName, data: resolve(def.data)}
        }
        if (def._type === 'listValue') {
            return currentMapValue[def.value]
        }
        if (def._type === 'listIndex') {
            return currentMapIndex[def.value]
        }
        if (def._type === 'string') {
            return def.value
        }
        if (def._type === 'boolean') {
            return def.value
        }
        if (def._type === 'not') {
            return !resolve(def.value)
        }
        if (def._type === 'number') {
            return def.value
        }
        if (def._type === 'array') {
            return def.value
        }
        if (def._type === 'push') {
            return resolve(def.data).concat(resolve(def.value))
        }
        if (def._type === 'object') {
            return Object.keys(def.value).reduce((acc, val)=> {
                acc[val] = resolve(def.value[val])
                return acc
            }, {})
        }
        if (def._type === 'merge') { // maybe call it "set" but it would actually be an immutable merge?
            return Object.assign({}, resolve(def.first), resolve(def.second))
        }
        if (def._type === 'set') { // why not both?
            return Object.assign({}, resolve(def.data), {[resolve(def.name)]: resolve(def.value)})
        }
        if (def._type === 'objectValue') {
            return resolve(def.object)[resolve(def.value)]
        }
        if (def._type === 'state') {
            return currentState[def.value]
        }
        if (def._type === 'eventData') {
            return eventData
        }
        if (def._type === 'eventValue') {
            return currentEvent.target.value
        }
        throw Error(def._type)
    }

    function toNode(nodeId) {
        const node = definition.nodes[resolve(nodeId)]
        if (node === undefined) {
            return // noop
        }
        let sel = node.nodeType === 'box' ? 'div'
            : node.nodeType === 'text' ? 'span'
                : node.nodeType === 'input' ? 'input'
                    : 'error'
        let children
        if (node.childrenIds) {
            children = []
            for (let i = 0; i < node.childrenIds.length; i++) {
                const child = toNode(node.childrenIds[i])
                if(child === undefined){
                    continue
                }
                //flatten (let's hope no one is imitating array with object)
                if (child.constructor === Array) {
                    for (let j = 0; j < child.length; j++) {
                        children.push(child[j])
                    }
                } else {
                    children.push(child)
                }
            }
        }
        // when application is frozen, no events are captured, except for mouseover that constantly selects nodes
        let on = frozen ?
            {
                mouseover: selectHoverActive ? [selectNodeHover, nodeId]: undefined,
                click: [selectNodeClick, nodeId]
            }:{
                click: node.onClick ? [onClick, node.onClick.eventName, resolve(node.onClick.data), node] : undefined,
                change: node.onChange ? [emitEvent, node.onChange.eventName, resolve(node.onChange.data)] : undefined,
                input: node.onInput ? [emitEvent, node.onInput.eventName, resolve(node.onInput.data)] : undefined,
                keydown: node.onEnter ? [onEnter, node.onEnter.eventName, resolve(node.onEnter.data)] : undefined,
                mouseover: frozen ? [emitEvent, '$_HOVERED_FROZEN', {nodeId: nodeId}] : undefined
            }

        const data = {
            style: node.styleId ? resolve({_type: 'object', value: definition.styles[node.styleId]}) : undefined,
            on,
            props: node.nodeType === 'input' ? {
                    value: resolve(node.value),
                    placeholder: node.placeholder
                } : undefined,
        }
        const text = node.nodeType === 'text' ? node.value && resolve(node.value) : undefined

        // wrap in a border
        if(frozen && selectedNodeInDevelopment === nodeId){
            return {sel: sel === 'div' ? 'div': 'span', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [{sel, data, children, text}]}
        }
        return {sel, data, children, text}
    }

    function onClick(eventName, data, node, e) {
        emitEvent(eventName, data, e)
    }

    function onEnter(eventName, data, e) {
        if (e.keyCode == 13) {
            emitEvent(eventName, data, e)
        }
    }

    const listeners = []

    function addListener(callback) {
        const length = listeners.push(callback)

        // for unsubscribing
        return () => listeners.splice(length - 1, 1)
    }

    function emitEvent(eventName, data, e) {
        currentEvent = e
        eventData = data
        const previousState = currentState
        let mutations = {}
        if(definition.events[eventName]){
            definition.events[eventName].forEach((key)=> {
                mutations[key] = resolve(definition.mutators[definition.state[key].mutators[eventName]])
            })
            currentState = Object.assign({}, currentState, mutations)
        } else {
            console.warn('No event named: ' + eventName)
        }
        currentEvent = null
        eventData = null
        listeners.forEach(callback => callback(eventName, data, e, previousState, currentState, mutations))
        if(Object.keys(mutations).length){
            render()
        }
    }

    let vdom = toNode('_rootNode')
    function render(newDefinition) {
        if(newDefinition){
            if(definition.state !== newDefinition.state){
                definition = newDefinition
                const newState = toState('_rootState')
                currentState = {...newState, ...currentState}
            } else {
                definition = newDefinition
            }
        }
        const newvdom = toNode('_rootNode')
        patch(vdom, newvdom)
        vdom = newvdom
    }

    function _freeze(isFrozen, callback, nodeId) {
        frozenCallback = callback
        selectedNodeInDevelopment = nodeId
        if(frozen === false && isFrozen === true){
            selectHoverActive = true
        }
        if(frozen || frozen !== isFrozen){
            frozen = isFrozen
            render()
        }
    }

    function getCurrentState() {
        return currentState
    }

    return {
        definition,
        vdom,
        getCurrentState,
        render,
        emitEvent,
        addListener,
        _freeze,
        _resolve: resolve,
    }
}

export default (node, definition) => {
    const app = component(definition)
    patch(node, app.vdom)
    return app
}