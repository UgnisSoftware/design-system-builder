var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // Init patch function with choosen modules
    require('snabbdom/modules/class'), // makes it easy to toggle classes
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

const virtualState = [
    {
        type: 'number',
        name: 'Count',
        defaultValue: 0,
        value: 0,
        actions: [0, 1],
        nodes: [0],
    },
]

const actualState = (stateDefinition) =>{
    let state = {}
    stateDefinition.forEach((def)=>{
        state[def.name] = def.defaultValue
    })
    return state
}

console.log(actualState(virtualState))

// static
const vdom = (state) =>
    [
        {
            type: 'box',
            children: state.showChild === true ? [1] : [2],
            on: {
                click: actions['onShowChild']
            }

        },
        {
            type: 'text',
            value: state.text,
        },
        {
            type: 'text',
            value: 'No hi',
        }
    ]

let htmlNode = document.getElementById('app')

function nodesToHTML(nodes){
    // TODO rewrite to your own vdom
    function toNode(node) {
        return {sel: node.type === 'box' ? 'div' : 'span', data: {style: node.style, on: node.on}, children: node.children ? node.children.map((id) => toNode(nodes[id])) : undefined, text: node.type === 'text' ? node.value : undefined};
    }
    const vdom = toNode(nodes[0])
    patch(htmlNode, vdom)
    htmlNode = vdom;
}

nodesToHTML(vdom(state()));
