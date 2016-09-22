//TODO remove snabbdom
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

import definitions from './def.js'
import devtools from './devtools.js'

const render = ({view, state, actions, mutators}, node)=> {
    let currentState = Object.keys(state).reduce((acc, val)=> {acc[val] = state[val].defaultValue; return acc}, {})
    
    const devtool = devtools(definitions, currentState, rerender)
    // global state for resolver
    let currentEvent = null
    let actionData = null
    let currentMapValue = {}
    let currentMapIndex = {};
    
    const resolve = (def)=> {
        // static value
        if(def === undefined || def._type === 'noop'){
            return;
        }
        if(def._type === undefined){
            return def;
        }
        if (def._type === 'conditional'){
            return resolve(def.statement) ? resolve(def.then) : resolve(def.else)
        }
        if (def._type === 'equals'){
            return resolve(def.first) === resolve(def.second)
        }
        if (def._type === 'sum'){
            return resolve(def.first) + resolve(def.second)
        }
        // array
        if (def._type === 'length'){
            return resolve(def.value).length
        }
        if (def._type === 'filter'){
            const data = resolve(def.data).filter((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return resolve(def.filter)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'map'){
            const data = resolve(def.data).map((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return resolve(def.map)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'list'){
            const data = resolve(def.data).map((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return toNode(def.node)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'nodeArray'){
            return def.value.map((value)=> toNode(resolve(value)))
        }
        if (def._type === 'actionName'){
            return { actionName: def.actionName, data: resolve(def.data)}
        }
        if (def._type === 'mapValue'){
            return currentMapValue[def.value]
        }
        if (def._type === 'mapIndex'){
            return currentMapIndex[def.value]
        }
        if (def._type === 'string'){
            return def.value
        }
        if (def._type === 'boolean'){
            return def.value
        }
        if (def._type === 'not'){
            return !resolve(def.value)
        }
        if (def._type === 'number'){
            return def.value
        }
        if (def._type === 'array'){
            return def.value
        }
        if (def._type === 'push'){
            return resolve(def.data).concat(resolve(def.value))
        }
        if (def._type === 'object'){
            return Object.keys(def.value).reduce((acc, val)=> {acc[val] = resolve(def.value[val]); return acc}, {})
        }
        if (def._type === 'merge'){ // maybe call it "set" but it would actually be an immutable merge?
            return Object.assign({}, resolve(def.first), resolve(def.second))
        }
        if (def._type === 'set'){ // why not both?
            return Object.assign({}, resolve(def.data), {[resolve(def.name)]: resolve(def.value)})
        }
        if (def._type === 'objectValue'){
            return resolve(def.object)[resolve(def.value)]
        }
        if (def._type === 'state'){
            return currentState[def.value]
        }
        if (def._type === 'actionData'){
            return actionData
        }
        if (def._type === 'actionData'){
            return actionData
        }
        if (def._type === 'eventValue'){
            return currentEvent.target.value
        }
        throw Error(def._type)
    }
    
    function onEnter(actionName, data, e){
        if (e.keyCode == 13){
            emmitAction(actionName, data, e)
        }
    }
    
    function emmitAction(actionName, data, e){
        currentEvent = e
        actionData = data
        let mutations = {};
        actions[actionName].forEach((key)=> {
            mutations[key] = resolve(mutators[state[key].mutators[actionName]])
        })
        currentState = Object.assign({}, currentState, mutations)
        currentEvent = null
        actionData = null
        devtool.emit(actionName, data, e, currentState, mutations)
        rerender()
    }
    
    function toNode(node) {
        if(node === undefined){
            return; // noop
        }
        
        let sel = node.nodeType === 'box' ? 'div'
            : node.nodeType === 'text' ? 'span'
            : node.nodeType === 'input' ? 'input'
            : node.nodeType === 'list' ? 'div'
            : 'error'
        const children = node.children ? resolve(node.children).filter((val)=>val !== undefined) : undefined
        const on = {
            click: node.onClick ? [emmitAction, node.onClick.actionName, resolve(node.onClick.data)] : undefined,
            change: node.onChange ? [emmitAction, node.onChange.actionName, resolve(node.onChange.data)] : undefined,
            input: node.onInput ? [emmitAction, node.onInput.actionName, resolve(node.onInput.data)] : undefined,
            keydown: node.onEnter ? [onEnter, node.onEnter.actionName, resolve(node.onEnter.data)] : undefined
        }
        const data = {
            style: node.style ? resolve(node.style): undefined,
            on,
            props: node.nodeType === 'input' ? { value: resolve(node.value), placeholder: node.placeholder} : undefined,
        }
        const text = node.nodeType === 'text' ? node.value && resolve(node.value) : undefined

        // devtools
        if(devtool.state.highlight && node === devtool.state.selectedComponent){
            sel += '.glow'
        }
        
        return {sel, data, children, text}
    }
    
    let vdom = toNode(view)
    
    patch(node, vdom) // first render
    
    function rerender(){
        const newvdom = toNode(view)
        patch(vdom, newvdom)
        vdom = newvdom
    }
}

render(definitions, document.getElementById('app'))
