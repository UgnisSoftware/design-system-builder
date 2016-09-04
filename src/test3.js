const actions2 = [
    {
        name: 'ADD_TODO',
        state: [0, 2]
    },
    {
        name: 'CLEAR_COMPLEATED',
        state: [0]
    },
    {
        name: 'MARK_ALL_AS_COMPLETED',
        state: [0]
    },
    {
        name: 'MARK_ONE_AS_COMPLETED',
        state: [0]
    },
    {
        name: 'SET_FLAG_TO_ALL',
        state: [1]
    },
    {
        name: 'SET_FLAG_TO_ACTIVE',
        state: [1]
    },
    {
        name: 'SET_FLAG_TO_COMPLETED',
        state: [1]
    },
]

const state2 = [
    {
        name: 'todos',
        defaultValue: [],
        actions: [ 0, 1, 2, 3 ]
    },
    {
        name: 'flag',
        defaultValue: 'all',
        actions: [ 4, 5, 6 ]
    },
    {
        name: 'input value',
        defaultValue: '',
        actions: [ 0, 7 ]
    }
]

const view2 = [
    {
        type: 'box',
        children: [1, x]
    },
    {
        type: 'box',
        children: [2, 3]
    },
    {
        type: 'box, show only if list of active is more than 0',
        onClick: 'mark all as complete'
    },
    {
        type: 'input',
        value: state[3],
        onKeyDown: 'if "enter" && value not empty - emmit ADD_TODO with this value, empty this value',
        placeholder: "What needs to be done?",
    },
]


const component = {
    type: 'box',
    deps: [],
    render: ()=>{
        
    }
}










































// if [state. input value] equals [string. hello] then [[string. hi, node. 1]]


var aDef = {
    type: 'box',
    children: [ // must return array
        {
            type: 'conditional',
            statement: '', // must return boolean
            then: '', // must return array
            else: '' // must return array
        }
    ]
}

var a = {
    type: 'box',
    children: [
        {
            type: 'input',
        },
        {
            type: 'text',
        }
    ]
}



const obj = {
    
}

const secObj = {
    
}
















































/*
 
 types:
 string
 number
 boolean
 array
 object
 conditional
 state
 
 */

const mutation =
{
    type: 'conditional',
    statement: {
        type: 'equals',
        first: {
            type: 'number',
            value: 42
        },
        second: {
            type: 'number',
            value: 42
        },
    }, // must return boolean
    then: {
        type: 'string',
        value: 'this should not have happened'
    },
    else: {
        type: 'string',
        value: 'you are a genius, Harry'
    },
}

// do magic
const magic = (def, state)=> {
    if (def.type === 'conditional'){
        return magic(def.statement) ? magic(def.then) : magic(def.else)
    }
    if (def.type === 'equals'){
        return magic(def.first) === magic(def.second)
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
        return state[def.stateName]
    }
    throw new Error(def.type)
}

console.log(magic(mutation))


// state on action use mutation, are used by mutators and views
// view emits actions that have mutation on states, can internally use state
// mutations are used by state and emmited by actions, can internally use state
// actions are used by views and emmit mutations on state

/*
 view:
 styles: [state]
 onclick: actions(abcd) - state.1 mutator, state.2 mutator
 
 state listened
 actions used
 
 state:
 defaultValue
 actions: mutations
 
 actions listened
 mutations used
 views that are using this state
 
 action:
 emited by: views
 used by: states
 
 mutators:
 can use state, but does not listen
 used by states
 
 */

const mutators = {
    COUNT_PLUS_ONE: {
        type: 'sum',
        first: {
            type: 'state',
            stateId: 0,
        },
        second: {
            type: 'number',
            value: 1
        },
    },
}

const actions = {
    ADD_ONE: {
        states: [0]
    }
}

const state = {
    Count: {
        type: 'number',
        defaultValue: 0,
        mutators: {
            ADD_ONE: 'COUNT_PLUS_ONE' // mutatorName
        }
    }
}

const view = {
    root: {
        type: 'box',
        children: {
            type: 'array',
            value: ['text0', 'text1']
        }
    },
    text0: {
        type: 'text',
        value: {
            type: 'state',
            stateName: 'Count',
        }
    },
    text1: {
        type: 'text',
        value: '+',
        onClick: 'ADD_ONE' // actionId
    },
}

const render = (view, state, actions, mutators, node) =>{
    function emmit(actionName){
        return (e) => console.log(actionName, e)
    }
    
    const currentState = Object.keys(state).reduce((acc, val)=> {acc[val] = state.defaultValue; return acc}, {})
    
    console.log(currentState)
    
    function toNode(node) {
        const sel = node.type === 'box' ? 'div' : 'span'
        const children = node.children ? magic(node.children, currentState).map((id) => toNode(nodes[id])) : undefined
        const data = {
            style: node.style,
            on: node.onClick ? { click: emmit(node.onClick)} : undefined
        }
        const text = node.type === 'text' ? node.value : undefined
        
        return {sel, data, children: children, text};
    }
    
    const vdom = toNode(view.root)
    
    
    patch(htmlNode, node) // first render
}

render(view, state, actions, mutators)
