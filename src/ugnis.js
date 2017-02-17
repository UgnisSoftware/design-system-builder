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
    function resolve(ref){
        if(ref === undefined){
            return
        }
        // static value (string/number)
        if(ref.ref === undefined){
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
        if (ref.ref === 'style') {
            return Object.keys(def).reduce((acc, val)=> {
                acc[val] = resolve(def[val])
                return acc
            }, {})
        }
        if (ref.ref === 'eventValue') {
            return currentEvent.target.value
        }
        throw Error(ref)
    }

    function transformValue(value, transformations){
        for(let i = transformations.length-1; i >= 0; i--) {
            const ref = transformations[i];
            const transformer = definition[ref.ref][ref.id]
            if (ref.ref === 'equal') {
                value = value === resolve(transformer.value)
            }
            if (ref.ref === 'add') {
                value = value + resolve(transformer.value)
            }
            if (ref.ref === 'branch') {
                if(resolve(transformer.predicate)){
                    value = transformValue(value, transformer.then)
                } else {
                    value = transformValue(value, transformer.else)
                }
            }
            if (ref.ref === 'join') {
                value = value.concat(resolve(transformer.value))
            }
            if (ref.ref === 'toUpperCase') {
                value = value.toUpperCase()
            }
            if (ref.ref === 'toLowerCase') {
                value = value.toLowerCase()
            }
        }
        return value;
    }

    function pipe(ref) {
        const def = definition[ref.ref][ref.id]
        return transformValue(resolve(def.value), def.transformations)
    }

    function boxNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            style: resolve(node.style),
            on: frozen ?
                {
                    mouseover: selectHoverActive ? [selectNodeHover, ref]: undefined,
                    click: [selectNodeClick, ref]
                }:{
                    click: node.click ? [emitEvent, node.click.id, node.clickData] : undefined,
                },
        }
        // wrap in a border
        if(frozen && selectedNodeInDevelopment.id === ref.id){
            return {sel: 'div', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [h('div', data, node.children.map(resolve))]}
        }
        return h('div', data, node.children.map(resolve))
    }

    function textNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            style: resolve(node.style),
            on: frozen ?
                {
                    mouseover: selectHoverActive ? [selectNodeHover, ref]: undefined,
                    click: [selectNodeClick, ref]
                }:{
                    click: node.click ? [emitEvent, node.click.id, node.clickData] : undefined,
                },
        }
        // wrap in a border
        if(frozen && selectedNodeInDevelopment.id === ref.id){
            return {sel: 'span', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [h('span', data, resolve(node.value))]}
        }
        return h('span', data, resolve(node.value))
    }

    function inputNode(ref) {
        const node = definition[ref.ref][ref.id]
        const data = {
            style: resolve(node.style),
            on: frozen ?
                {
                    mouseover: selectHoverActive ? [selectNodeHover, ref]: undefined,
                    click: [selectNodeClick, ref]
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
        if(frozen && selectedNodeInDevelopment.id === ref.id){
            return {sel: 'span', data: {style: { transition:'outline 0.1s',outline: '3px solid #3590df', borderRadius: '2px', boxSizing: 'border-box'}},children: [h('input', data)]}
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
        if(definition.event[eventName]){
            definition.event[eventName].mutators.forEach((ref)=> {
                const mutator = definition.mutator[ref.id]
                const state = mutator.state
                mutations[state.id] = resolve(mutator.mutation)
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

    let vdom = resolve({ref:'vNodeBox', id:'_rootNode'})
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
        const newvdom = resolve({ref:'vNodeBox', id:'_rootNode'})
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

    function setCurrentState(newState) {
        currentState = newState
        render()
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
    }
}

export default (node, definition) => {
    const app = component(definition)
    patch(node, app.vdom)
    return app
}