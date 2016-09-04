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
    
    const magic = (def)=> {
        if (def.type === 'conditional'){
            return magic(def.statement) ? magic(def.then) : magic(def.else)
        }
        if (def.type === 'equals'){
            return magic(def.first) === magic(def.second)
        }
        if (def.type === 'sum'){
            return magic(def.first) + magic(def.second)
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
        if (def.type === 'state'){
            return currentState[def.stateName]
        }
        throw new Error(def.type)
    }
    
    function emmit(actionName){
        return (e)=> {
            actions[actionName].states.forEach((key)=>{
                currentState[key] = magic(mutators[state[key].mutators[actionName]], currentState)
            })
            rerender()
        }
    }
    
    function toNode(node) {
        const sel = node.type === 'box' ? 'div' : 'span'
        const children = node.children ? magic(node.children, currentState).map((node) => toNode(node)) : undefined
        const data = {
            style: node.style,
            on: node.onClick ? { click: emmit(node.onClick)} : undefined,
        }
        const text = node.type === 'text' ? magic(node.value, currentState) : undefined
        
        return {sel, data, children, text};
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
