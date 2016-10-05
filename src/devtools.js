import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

const styles = [
    'width',
    'height',
    'display',
    'padding',
    'margin',
    'position',
    'top',
    'bottom',
    'left',
    'right',
    'float',
    'border',
    'background',
    'boxShadow',
    'fontSize',
    'lineHeight',
    'fontWeight',
    'textAlign',
    'writingMode',
    'color',
    'alignItems',
    'cursor',
    'overflow',
    'transition',
]

export default function init(definitions, currentState, renderApp) {
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const state = {
        isOpen: false,
        currentState,
        selectedComponent: definitions.view,
        highlight: false,
        lastAction: '',
        addingStyle: false,
        addingState: false,
        showStateMinified: true,
    }
    
    let timeout;
    function clearLastAction(){
        state.lastAction = ''
        render()
    }
    function blinkAction(actionName){
        state.lastAction = actionName
        clearTimeout(timeout)
        timeout = setTimeout(clearLastAction, 500)
        render()
    }

    function startAddingStyle(){
        state.addingStyle = true;
        render();
    }
    
    function addChild(component, type){
        const empty = {
            box: {
                _type: 'vNode',
                nodeType: 'box',
                style: {},
                children: [],
            },
            text: {
                _type: 'vNode',
                nodeType: 'text',
                style: {},
                value: ''
            },
            input: {
                _type: 'vNode',
                nodeType: 'input',
                style: {},
                value: ''
            },
        }
        component.children.push(empty[type])
        render();
        renderApp();
    }
    
    function minifyState(){
        state.showStateMinified = !state.showStateMinified
        render()
    }
    
    function addStyle(event){
        state.addingStyle = false;
        state.selectedComponent.style[event.target.value] = ''
        render();
        renderApp();
    }
    
    function deleteStyle(name){
        const tempObj = Object.assign({}, state.selectedComponent.style)
        delete tempObj[name]
        state.selectedComponent.style = tempObj
        render();
        renderApp();
    }
    
    function removeNode(component, parent){
        if(parent){
            parent.children = parent.children.filter((child)=> child !== component)
        } else {
            component.children = []
        }
        render();
        renderApp();
    }
    
    function changeHighlight() {
        state.highlight = !state.highlight
        render();
        renderApp();
    }
    
    function openMenu() {
        state.isOpen = !state.isOpen
        state.highlight = state.isOpen
        render();
        renderApp();
    }
    
    function selectComponent(compoenent, e) {
        e.stopImmediatePropagation()
        state.selectedComponent = compoenent
        render();
        renderApp();
    }
    
    function generateChildTree(component, parent) {
        return {
            sel: 'div',
            data: {
                style: {
                    display: 'flex',
                    border: '1px solid #FFA273',
                    padding: '2px',
                },
            },
            children: [
                {
                    sel: 'div',
                    data: {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        },
                    },
                    children: [
                        component.nodeType ? {
                            sel: 'div',
                            data: {
                                style: {
                                    padding: '10px 0',
                                    textAlign: 'center',
                                    width: '106px', // check if node or map/if
                                    height: '34px',
                                    fontSize: '2em',
                                    backgroundColor: '#4d4d4d',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    boxShadow: state.selectedComponent === component ? '0 0 10px 2px #ffffff' : undefined,
                                },
                                on: {
                                    click: [selectComponent, component]
                                }
                            },
                            text: component.nodeType,
                        } :
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    padding: '10px',
                                    textAlign: 'center',
                                    transform: 'rotate(180deg)',
                                    writingMode: 'vertical-lr',
                                    width: '28px',
                                    height: '60px',
                                    fontSize: '2em',
                                    backgroundColor: '#4d4d4d',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    boxShadow: state.selectedComponent === component ? '0 0 10px 2px #ffffff' : undefined,
                                },
                            },
                            text: component._type,
                        },
                        component._type === 'map' && {
                            sel: 'div',
                            data: {
                                style: {
                                    padding: '10px 0',
                                    textAlign: 'center',
                                    width: '106px', // check if node or map/if
                                    height: '34px',
                                    fontSize: '2em',
                                    backgroundColor: '#4d4d4d',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    boxShadow: state.selectedComponent === component ? '0 0 10px 2px #ffffff' : undefined,
                                },
                                on: {
                                    click: [selectComponent, component.map]
                                }
                            },
                            text: component.map.nodeType,
                        },
                        state.selectedComponent === component && {
                            sel: 'div',
                            data: {
                                style: {
                                    textAlign: 'center',
                                    width: '30px',
                                    height: '30px',
                                    fontSize: '22px',
                                    backgroundColor: '#4d4d4d',
                                    border: '1px solid white',
                                    cursor: 'pointer',
                                    borderRadius: '15px',
                                    color: 'white',
                                    position: 'absolute',
                                    right: '0',
                                    margin: '-22px 0 0 0',
                                    fontWeight: '800',
                                    zIndex: '100',
                                },
                                on: {
                                    click: [removeNode, component, parent]
                                }
                            },
                            text: 'x',
                        },
                        state.selectedComponent === component && component.nodeType === 'box' && {
                            sel: 'div',
                            data: {
                                style: {
                                    paddingLeft: '6px',
                                    width: '100px',
                                    height: '30px',
                                    fontSize: '22px',
                                    backgroundColor: '#4d4d4d',
                                    cursor: 'pointer',
                                    color: 'white',
                                    position: 'absolute',
                                    right: '5px',
                                    margin: '38px 0 0 0',
                                    fontWeight: '800',
                                    borderTop: '1px solid white',
                                    zIndex: '101',
                                },
                                on: {
                                    click: [addChild, component, 'box']
                                }
                            },
                            text: '+ box',
                        },
                        state.selectedComponent === component && component.nodeType === 'box' && {
                            sel: 'div',
                            data: {
                                style: {
                                    paddingLeft: '6px',
                                    width: '100px',
                                    height: '30px',
                                    fontSize: '22px',
                                    backgroundColor: '#4d4d4d',
                                    cursor: 'pointer',
                                    color: 'white',
                                    position: 'absolute',
                                    right: '5px',
                                    margin: '68px 0 0 0',
                                    fontWeight: '800',
                                    borderTop: '1px solid white',
                                    zIndex: '102',
                                },
                                on: {
                                    click: [addChild, component, 'text']
                                }
                            },
                            text: '+ text',
                        },
                        state.selectedComponent === component && component.nodeType === 'box' && {
                            sel: 'div',
                            data: {
                                style: {
                                    paddingLeft: '6px',
                                    width: '100px',
                                    height: '30px',
                                    fontSize: '22px',
                                    backgroundColor: '#4d4d4d',
                                    cursor: 'pointer',
                                    borderRadius: '0 0 5px 5px',
                                    color: 'white',
                                    position: 'absolute',
                                    right: '5px',
                                    margin: '98px 0 0 0',
                                    fontWeight: '800',
                                    borderTop: '1px solid white',
                                    zIndex: '103',
                                },
                                on: {
                                    click: [addChild, component, 'input']
                                }
                            },
                            text: '+ input',
                        },
                    ].filter((val)=> val)
                },
                {
                    sel: 'div',
                    data: {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        },
                    },
                    children: component.children ? component.children.map((child)=>generateChildTree(child, component)) :  component.map ? component.map.children.map((child)=>generateChildTree(child, component)) : undefined,
                },
            ],
        }
    }
    
    function vdom() {
        return {
            sel: 'div',
            data: {
            },
            children: [
                {
                    sel: 'div',
                    data: {
                        style: {
                            position: 'absolute',
                            transform: 'rotate(180deg)',
                            writingMode: 'vertical-lr',
                            right: state.isOpen ? '700px' : '0px',
                            padding: '15px 5px 15px 5px',
                            borderRadius: '0px 5px 5px 0px',
                            top: '40px',
                            fontSize: '2em',
                            background: '#4d4d4d',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.5s',
                            zIndex: '1000',
                        },
                        on: {
                            click: openMenu
                        }
                    },
                    text: state.isOpen ? 'Close devtools' : 'Open devtools',
                },
                {
                    sel: 'div',
                    data: {
                        style: {
                            position: 'absolute',
                            display: 'flex',
                            right: '50%',
                            padding: '15px',
                            borderRadius: '5px',
                            bottom: state.isOpen ? '15px' : '-50px',
                            background: '#4d4d4d',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.5s',
                            zIndex: '2000',
                        },
                        on: {
                            click: changeHighlight
                        }
                    },
                    children: [
                        {
                            sel: 'input',
                            data: {
                                props: {
                                    type: 'checkbox',
                                    checked: state.highlight
                                },
                                style: {
                                    display: 'inline-block'
                                },
                            },
                        },
                        {
                            sel: 'span',
                            data: {
                                style: {
                                    userSelect: 'none',
                                    whiteSpace: 'nowrap',
                                    
                                },
                            },
                            text: 'Highlight live component'
                        },
                    ]
                },{
                    sel: 'div',
                    data: {
                        style: {
                            position: 'absolute',
                            left: '50px',
                            padding: '0 15px',
                            borderRadius: '5px',
                            bottom: '15px',
                            background: '#4d4d4d',
                            color: '#ffffff',
                            transition: 'all 0.5s',
                        },
                    },
                    children: [
                        {
                            sel: 'p',
                            data: {
                                style: {
                                },
                            },
                            children: [
                                {
                                    sel: 'span',
                                    data: {
                                    },
                                    text: 'This is an example'
                                },
                                {
                                    sel: 'a',
                                    data: {
                                        props: {
                                            href: 'http://todomvc.com/'
                                        },
                                        style: {
                                            color: 'inherit',
                                            marginLeft: '3px',
                                        },
                                    },
                                    text: 'TodoMVC application'
                                },
                            ]
                        },
                        {
                            sel: 'p',
                            data: {
                                style: {
                                },
                            },
                            children: [
                                {
                                    sel: 'span',
                                    data: {
                                        style: {
                                        },
                                    },
                                    text: 'It was build using the tool on the right - Ugnis v0.0.12-pre-alpha'
                                },
                            ],
                        },
                        {
                            sel: 'p',
                            data: {
                                style: {
                                },
                            },
                            children: [
                                {
                                    sel: 'span',
                                    data: {
                                    },
                                    text: 'Compare how this app would be implemented in code with React'
                                },
                                {
                                    sel: 'a',
                                    data: {
                                        props: {
                                            href: 'https://github.com/tastejs/todomvc/tree/gh-pages/examples/react/js'
                                        },
                                        style: {
                                            color: 'inherit',
                                            marginLeft: '3px',
                                            
                                        },
                                    },
                                    text: 'here'
                                },
                            ]
                        },
                    ]
                },
                {
                    sel: 'div',
                    data: {
                        style: {
                            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1)',
                            position: 'absolute',
                            right: state.isOpen ? '0px' : '-700px',
                            color: '#ffffff',
                            boxSizing: 'border-box',
                            borderLeft: '6px solid #4d4d4d',
                            width: '700px',
                            height: '100vh',
                            top: '0',
                            transition: 'all 0.5s',
                            overflow: 'hidden',
                        },
                    },
                    children: [
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    height: '50%',
                                    overflow: 'scroll',
                                },
                            },
                            children: [
                                {
                                    sel: 'div',
                                    data: {
                                        style: {
                                            backgroundImage: 'url(/images/blueprint.png)',
                                            backgroundSize: '16px',
                                            padding: '10px',
                                            // display: 'inline-block',
                                            // minWidth: '100%',
                                            // minHeight: '100%',
                                        },
                                    },
                                    children: [generateChildTree(definitions.view)]
                                },
                            ]
                        },
                        // component and state
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    display: 'flex',
                                    background: 'linear-gradient(to top, #ECE9E6 , #FFFFFF)',
                                    borderTop: '6px solid #4d4d4d',
                                    height: '50%',
                                    width: '100%',
                                    color: '#000000',
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                },
                            },
                            children: [
                                {
                                    sel: 'div',
                                    data: {
                                        style: {
                                            flex: '1',
                                            overflow: 'scroll',
                                            padding: '10px',
                                            borderRight: '6px solid #4d4d4d',
                                        },
                                    },
                                    children: [
                                        state.selectedComponent.nodeType === 'text' && {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    width: '100%',
                                                    margin: '0 0 10px 0',
                                                },
                                            },
                                            children: [
                                                {
                                                    sel: 'div',
                                                    data: {
                                                        style: {
                                                            display: 'inline-block',
                                                            width: '30%',
                                                            textAlign: 'right',
                                                        },
                                                    },
                                                    text: 'Text: '
                                                },
                                                {
                                                    sel: 'input',
                                                    data: {
                                                        props: {
                                                            value: state.selectedComponent.value || ''
                                                        },
                                                        style: {
                                                            display: 'inline-block',
                                                        },
                                                        on: {
                                                            input: (e)=> {
                                                                state.selectedComponent.value = e.target.value;
                                                                renderApp()
                                                            }
                                                        }
                                                    },
                                                }
                                            ]
                                        },
                                        ...Object.keys(state.selectedComponent.style).map((name)=>(
                                        {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    width: '100%',
                                                },
                                            },
                                            children: [
                                                {
                                                    sel: 'div',
                                                    data: {
                                                        style: {
                                                            display: 'inline-block',
                                                            width: '30%',
                                                            textAlign: 'right',
                                                        },
                                                    },
                                                    text: name + ': '
                                                },
                                                {
                                                    sel: 'input',
                                                    data: {
                                                        props: {
                                                            value: state.selectedComponent.style[name] || ''
                                                        },
                                                        style: {
                                                            display: 'inline-block',
                                                        },
                                                        on: {
                                                            input: (e)=> {
                                                                state.selectedComponent.style = Object.assign({}, state.selectedComponent.style, {[name]: e.target.value});
                                                                renderApp()
                                                            }
                                                        }
                                                    },
                                                },
                                                {
                                                    sel: 'div',
                                                    data: {
                                                        style: {
                                                            display: 'inline-block'
                                                        },
                                                        on: {
                                                            click: [deleteStyle, name]
                                                        }
                                                    },
                                                    text: 'x'
                                                },
                                            ]
                                        })),
                                        state.addingStyle ?
                                        {
                                            sel: 'select',
                                            data: {
                                                style: {
                                                    margin: '10px',
                                                },
                                                on: {
                                                    change: [addStyle]
                                                }
                                            },
                                            children: styles
                                                .filter(style => !Object.keys(state.selectedComponent.style).includes(style))
                                                .map(style => ({
                                                sel: 'option',
                                                data: {
                                                    props: {
                                                        value: style,
                                                    },
                                                },
                                                text: style
                                            })),
                                        }:
                                        {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    background: '#0066cc',
                                                    margin: '10px',
                                                    color: 'white',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    display: 'inline-block',
                                                    marginLeft: '10px',
                                                    cursor: 'pointer',
                                                },
                                                on: {
                                                    click: [startAddingStyle]
                                                }
                                            },
                                            text: '+ Add Style',
                                        },
                                    ].filter((val)=>val),
                                },
                                // STATE
                                {
                                    sel: 'div',
                                    data: {
                                        style: {
                                            flex: '1',
                                            padding: '10px',
                                            overflow: 'scroll',
                                        },
                                    },
                                    children: [
                                        ...Object.keys(definitions.state).map(stateName =>
                                            ({
                                                sel: 'div',
                                                data: {
                                                    style: {
                                                        flex: '1',
                                                        padding: '10px',
                                                        fontSize: '1.5em',
                                                    },
                                                },
                                                key: stateName,
                                                children: [
                                                    {
                                                        sel: 'div',
                                                        data: {
                                                            style: {
                                                            },
                                                            on: definitions.state[stateName].stateType === 'array' && {
                                                                click: minifyState
                                                            }
                                                        },
                                                        children: [
                                                            {
                                                                sel: 'span',
                                                                data: {},
                                                                text: stateName + ': ',
                                                            },
                                                            {
                                                                sel: 'span',
                                                                data: {
                                                                    style: {
                                                                        background: '#dddddd',
                                                                        margin: '0 10px 0 0',
                                                                        padding: '0 5px',
                                                                        whiteSpace: 'pre-wrap',
                                                                    },
                                                                },
                                                                text: (definitions.state[stateName].stateType === 'array' && state.showStateMinified) ? '[...]': JSON.stringify(definitions.state[stateName].defaultValue, null, ' '),
                                                            },
                                                            {
                                                                sel: 'span',
                                                                data: {
                                                                    style: {
                                                                        background: '#aaddaa',
                                                                        padding: '0 5px',
                                                                        whiteSpace: 'pre-wrap',
                                                                    }
                                                                },
                                                                text: (definitions.state[stateName].stateType === 'array' && state.showStateMinified) ? '[...]': JSON.stringify(state.currentState[stateName], null, ' '),
                                                            }
                                                        ],
                                                    },
                                                    // Actions
                                                    {
                                                        sel: 'div',
                                                        data: {
                                                            style: {
                                                                paddingLeft: '10px',
                                                                fontSize: '0.5em',
                                                            },
                                                        },
                                                        children: Object.keys(definitions.state[stateName].mutators).map(key=>({
                                                            sel: 'div',
                                                            data: {
                                                                style: {
                                                                    paddingLeft: '10px',
                                                                    background: key === state.lastAction ? '#FFA273': 'none',
                                                                    transition: 'all 0.5s',
                                                                },
                                                            },
                                                            children: [
                                                                {
                                                                    sel: 'span',
                                                                    data: {},
                                                                    text: key + ': ',
                                                                },
                                                                {
                                                                    sel: 'span',
                                                                    data: {
                                                                        style: {
                                                                            background: '#dddddd',
                                                                        }
                                                                    },
                                                                    text: definitions.mutators[definitions.state[stateName].mutators[key]]._type === 'string' ?
                                                                    definitions.mutators[definitions.state[stateName].mutators[key]]._type + ' ' + definitions.mutators[definitions.state[stateName].mutators[key]].value:
                                                                        definitions.mutators[definitions.state[stateName].mutators[key]]._type,
                                                                }
                                                            ],
                                                        }))
                                                    },
                                                ],
                                            }),
                                        ),
                                        {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    background: '#0066cc',
                                                    color: 'white',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    display: 'inline-block',
                                                    marginLeft: '10px',
                                                    cursor: 'pointer',
                                                },
                                            },
                                            text: '+ Add State',
                                        },
                                    ],
                                }
                            ],
                        },
                    ]
                },
            ],
        }
    }
    
    function render() {
        const newDom = vdom()
        patch(node, newDom)
        node = newDom
    }
    
    render()
    
    return {
        state: state,
        emit: function (actionName, data, event, newState, mutations) {
            state.currentState = newState;
            blinkAction(actionName)
            render()
        },
        selectComponent: selectComponent,
    }
}