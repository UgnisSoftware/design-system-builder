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
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/attributes'),
    livePropsPlugin
]);
import h from 'snabbdom/h';

export const component = (definition) => {

    let currentState = Object.keys(definition.state).map(key=>definition.state[key]).reduce((acc, def)=> {
        acc[def.ref] = def.defaultValue
        return acc
    }, {})

    // Allows stoping application in development. This is not an application state
    let frozen = false
    let frozenCallback = null
    let selectHoverActive = false
    let selectedNodeInDevelopment = {}

    function selectNodeHover(node, e) {
        e.stopPropagation()
        selectedNodeInDevelopment = node
        frozenCallback(node)
        render()
    }
    function selectNodeClick(node, e) {
        e.stopPropagation()
        selectHoverActive = false
        selectedNodeInDevelopment = node
        frozenCallback(node)
        render()
    }

    // global state for resolver
    let currentEvent = null
    let eventData = {}
    let currentMapValue = {}
    let currentMapIndex = {}
    function resolve(def){
        if (def === undefined) {
            return
        }
        // static value
        if (def._type === undefined) {
            return def
        }
        if (def._type === 'ref') {
            return resolve(definition[def.ref][def.id])
        }
        if (def._type === 'conditional') {
            return resolve(def.predicate) ? resolve(def.then) : resolve(def.else)
        }
        if (def._type === 'equal') {
            return resolve(def.a) === resolve(def.b)
        }
        if (def._type === 'add') {
            return resolve(def.a) + resolve(def.b)
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
        if (def._type === 'listValue') {
            return currentMapValue[def.value]
        }
        if (def._type === 'listIndex') {
            return currentMapIndex[def.value]
        }
        if (def._type === 'not') {
            return !resolve(def.value)
        }
        if (def._type === 'push') {
            return resolve(def.data).concat(resolve(def.value))
        }
        if (def._type === 'merge') { // maybe call it "set" but it would actually be an immutable merge?
            return Object.assign({}, resolve(def.a), resolve(def.b))
        }
        if (def._type === 'set') { // why not both?
            return Object.assign({}, resolve(def.data), {[resolve(def.name)]: resolve(def.value)})
        }
        if (def._type === 'get') {
            return currentState[def.stateId]
        }
        if (def._type === 'eventData') {
            return eventData
        }
        if (def._type === 'eventValue') {
            return currentEvent.target.value
        }
        if (def._type === 'vNodeBox') {
            return boxNode(def)
        }
        if (def._type === 'vNodeText') {
            return textNode(def)
        }
        if (def._type === 'vNodeInput') {
            return inputNode(def)
        }
        if (def._type === 'vNodeLink') {
            // TODO
        }
        if (def._type === 'style') {
            return Object.keys(def).reduce((acc, val)=> {
                acc[val] = resolve(def[val])
                return acc
            }, {})
        }
        throw Error(def._type)
    }

    function boxNode(node) {
        const data = {
            style: resolve(node.style),
            on: frozen ?
                {
                    mouseover: selectHoverActive ? [selectNodeHover, node]: undefined,
                    click: [selectNodeClick, node]
                }:{
                    click: node.click ? [emitEvent, node.click.id, node.clickData] : undefined,
                },
        }
        // wrap in a border
        if(frozen && selectedNodeInDevelopment === node){
            return {sel: sel === 'div' ? 'div': 'span', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [{sel, data, children, text}]}
        }
        return h('div', data, node.children.map(resolve))
    }

    function textNode(node) {
        const data = {
            style: resolve(node.style),
            on: frozen ?
                {
                    mouseover: selectHoverActive ? [selectNodeHover, node]: undefined,
                    click: [selectNodeClick, node]
                }:{
                    click: node.click ? [emitEvent, node.click.id, node.clickData] : undefined,
                },
        }
        // wrap in a border
        if(frozen && selectedNodeInDevelopment === node){
            return {sel: sel === 'div' ? 'div': 'span', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [{sel, data, children, text}]}
        }
        return h('span', data, resolve(node.value))
    }

    function inputNode(node) {
        const data = {
            style: resolve(node.style),
            on: frozen ?
                {
                    mouseover: selectHoverActive ? [selectNodeHover, node]: undefined,
                    click: [selectNodeClick, node]
                }:{
                    click: node.click ? [emitEvent, node.click.id, node.clickData] : undefined,
                    input: node.input ? [emitEvent, node.input.id, node.inputData] : undefined,
                },
            props: {
                value: resolve(node.value),
                placeholder: node.placeholder
            }
        }
        // wrap in a border
        if(frozen && selectedNodeInDevelopment === node){
            return {sel: sel === 'div' ? 'div': 'span', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [{sel, data, children, text}]}
        }
        return h('input', data)
    }

    const listeners = []

    function addListener(callback) {
        const length = listeners.push(callback)

        // for unsubscribing
        return () => listeners.splice(length - 1, 1)
    }

    function emitEvent(eventName, data, e) {
        currentEvent = e
        eventData = resolve(data)
        const previousState = currentState
        let mutations = {}
        if(definition.events[eventName]){
            definition.events[eventName].mutators.forEach((ref)=> {
                const mutator = resolve(ref)
                const state = resolve(mutator.state)
                mutations[state.ref] = resolve(mutator.mutation)
            })
            currentState = Object.assign({}, currentState, mutations)
        } else {
            console.warn('No event named: ' + eventName) // todo list available
        }
        currentEvent = null
        eventData = null
        listeners.forEach(callback => callback(eventName, data, e, previousState, currentState, mutations))
        if(Object.keys(mutations).length){
            render()
        }
    }

    let vdom = resolve(definition.vNodeBox['_rootNode'])
    function render(newDefinition) {
        if(newDefinition){
            if(definition.state !== newDefinition.state){
                definition = newDefinition
                const newState = Object.keys(definition.state).map(key=>definition.state[key]).reduce((acc, def)=> {
                    acc[def.ref] = def.defaultValue
                    return acc
                }, {})
                currentState = {...newState, ...currentState}
            } else {
                definition = newDefinition
            }
        }
        const newvdom = resolve(definition.vNodeBox['_rootNode'])
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