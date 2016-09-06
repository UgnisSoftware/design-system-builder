//TODO remove snabbdom
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

const render = ({view, state, actions, mutators}, node)=> {
    const currentState = Object.keys(state).reduce((acc, val)=> {acc[val] = state[val].defaultValue; return acc}, {})
    let currentEvent = null
    let currentMapValue = {}
    
    const resolve = (def)=> {
        if(def.type === 'noop'){
            return;
        }
        if (def.type === 'conditional'){
            return resolve(def.statement) ? resolve(def.then) : resolve(def.else)
        }
        if (def.type === 'equals'){
            return resolve(def.first) === resolve(def.second)
        }
        if (def.type === 'sum'){
            return resolve(def.first) + resolve(def.second)
        }
        if (def.type === 'list'){
            const data = resolve(def.data).map((value)=> {
                currentMapValue[def.identifier] = value
                return toNode(def.node)
            })
            delete currentMapValue[def.identifier]
            return data
        }
        if (def.type === 'nodeArray'){
            return def.value.map((value)=> toNode(resolve(value)))
        }
        if (def.type === 'mapValue'){
            return currentMapValue[def.value]
        }
        if (def.type === 'string'){
            return def.value
        }
        if (def.type === 'boolean'){
            return def.value
        }
        if (def.type === 'number'){
            return def.value
        }
        if (def.type === 'array'){
            return def.value
        }
        if (def.type === 'object'){
            return def.value
        }
        if (def.type === 'objectValue'){
            return resolve(def.object)[resolve(def.value)]
        }
        if (def.type === 'state'){
            return currentState[def.value]
        }
        if (def.type === 'eventValue'){
            return currentEvent.target.value
        }
        throw Error(def.type)
    }
    
    function emmitAction(actionName, e){
        currentEvent = e
        actions[actionName].forEach((key)=> {
            currentState[key] = resolve(mutators[state[key].mutators[actionName]])
        })
        currentEvent = null
        rerender()
    }
    
    function toNode(node) {
        if(node === undefined){
            return; // noop
        }
        
        const sel = node.type === 'box' ? 'div'
            : node.type === 'text' ? 'span'
            : node.type === 'input' ? 'input'
            : 'error'
        const children = node.children ? resolve(node.children).filter((val)=>val !== undefined) : undefined
        const on = {
            click: node.onClick ? [emmitAction, node.onClick] : undefined,
            change: node.onChange ? [emmitAction, node.onChange] : undefined,
            input: node.onInput ? [emmitAction, node.onInput] : undefined,
        }
        const data = {
            style: node.style,
            on,
            props: node.type === 'input' ? { value: resolve(node.value), placeholder: node.placeholder} : undefined,
        }
        const text = node.type === 'text' ? resolve(node.value) : undefined

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

import definitions from './def.js'

render(definitions, document.getElementById('app'))
