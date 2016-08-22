var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // Init patch function with choosen modules
    require('snabbdom/modules/class'), // makes it easy to toggle classes
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

function createElement(tagName){
    return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName){
    return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text){
    return document.createTextNode(text);
}

function insertBefore(parentNode, newNode, referenceNode){
    parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child){
    node.removeChild(child);
}

function appendChild(node, child){
    node.appendChild(child);
}

function parentNode(node){
    return node.parentElement;
}

function nextSibling(node){
    return node.nextSibling;
}

function tagName(node){
    return node.tagName;
}

function setTextContent(node, text){
    node.textContent = text;
}

// /API

const emmiter = (action) => {
    return (e) => {
        nodesToHTML(vdom(state(action)))
    }
}

const defaultActons = [
    {
        componentIds: [1],
        sideEffects: [
            {
                type: 'updateState',
                stateId: 0,
                mutation: [
                    {
                        type: 'state',
                        stateId: 0,
                    },
                    {
                        type: 'function',
                        value: 'add',
                    },
                    {
                        type: 'number',
                        value: 1,
                    },
                ],
            }
        ],
    },
]

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

const actions = {
    onShowChild: emmiter('show child: false'),
}

const state = (action)=> {
    if(action === 'show child: false'){
        return {
            showChild: false,
            text: 'Hello'
        }
    }
    return {
        showChild: true,
        text: 'Hello'
    }
}

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
